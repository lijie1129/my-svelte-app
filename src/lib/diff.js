import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import diff from 'microdiff';
import * as Y from 'yjs';

const TextDiffType = {
	Delete: -1,
	Insert: 1,
	Retain: 0
};

const DeltaType = {
	Delete: 'delete',
	Insert: 'insert',
	Retain: 'retain'
};

export const is = (arg) => Object.getPrototypeOf(arg).constructor.name;
const YJS_ARRAY = 'YArray';
const YJS_MAP = 'YMap';
const YJS_TEXT = 'YText';
const RAW_OBJECT = 'Object';
const RAW_STRING = 'String';
const isYarray = (arg) => is(arg) === YJS_ARRAY;
const isYmap = (arg) => is(arg) === YJS_MAP;
const isYtext = (arg) => is(arg) === YJS_TEXT;
const isObject = (arg) => is(arg) === RAW_OBJECT;
const isString = (arg) => is(arg) === RAW_STRING;

const yArrayAdd = (yArray, idx, item) => yArray.insert(idx, [item]);
const yArrayRemove = (yArray, idx) => yArray.delete(idx, 1);
const yArrayGet = (yArray, idx) => yArray.get(idx);
const yArrayChange = (yArray, idx, item) => {
	yArray.delete(idx, 1);
	yArray.insert(idx, [item]);
};

const yMapRemove = (yMap, key) => yMap.delete(key);
const yMapGet = (yMap, key) => yMap.get(key);
const yMapSet = ({ yMap, key, value }) => {
	if (!isYtext(value)) {
		yMap.set(key, value);
		return;
	}

	if (!yMap.get(key)) {
		yMap.set(key, value);
	} else {
		const yText = yMap.get(key);
		const deltas = diffText(yText, value.toJSON());

		yText.applyDelta(deltas);
	}
};

export const ACTION_CREATE = 'CREATE';
export const ACTION_REMOVE = 'REMOVE';
export const ACTION_CHANGE = 'CHANGE';
const grpupAction = {
	[ACTION_CREATE]: {
		YArray: yArrayAdd,
		YMap: yMapSet
	},
	[ACTION_REMOVE]: {
		YArray: yArrayRemove,
		YMap: yMapRemove
	},
	[ACTION_CHANGE]: {
		YArray: yArrayChange,
		YMap: yMapSet
	}
};

const get = (yStruct, path) => {
	let result = yStruct;

	for (const key of path) {
		if (result && isYarray(result)) {
			result = yArrayGet(result, key);
		} else if (result && isYmap(result)) {
			result = yMapGet(result, key);
		}
	}

	return result;
};

const makeYstruct = (raw, yTextFields = [], fromYTextArray = false) => {
	const createYtext = (str) => {
		const yText = new Y.Text();

		yText.insert(0, str);

		return yText;
	};

	if (isObject(raw)) {
		const yMap = new Y.Map();

		for (const key in raw) {
			if (Object.prototype.hasOwnProperty.call(raw, key)) {
				let value;

				if (isString(raw[key]) && yTextFields.includes(key)) {
					value = createYtext(raw[key]);
				}

				yMapSet({
					yMap,
					key,
					value:
						value ||
						makeYstruct(raw[key], yTextFields, yTextFields.includes(key) && Array.isArray(raw[key]))
				});
			}
		}

		return yMap;
	}

	if (Array.isArray(raw)) {
		const yArray = new Y.Array();

		for (const item of raw) {
			yArray.push([makeYstruct(item, yTextFields, fromYTextArray)]);
		}

		return yArray;
	}

	let result = raw;

	if (fromYTextArray && isString(raw)) {
		result = createYtext(raw);
	}

	return result;
};

export const diffText = (oldText, newText) => {
	const dmp = new DiffMatchPatch();
	const diff = dmp.diff_main(oldText, newText);
	const deltas = [];

	for (const [type, value] of diff) {
		switch (type) {
			case TextDiffType.Delete: {
				deltas.push({ [DeltaType.Delete]: value.length });
				break;
			}

			case TextDiffType.Insert: {
				deltas.push({ [DeltaType.Insert]: value });
				break;
			}

			case TextDiffType.Retain: {
				deltas.push({ [DeltaType.Retain]: value.length });
				break;
			}
		}
	}

	return deltas;
};

export const diffJson = (oldJson, newJson, cyclesFix = false) => {
	return diff(oldJson, newJson, { cyclesFix });
};

export const patch = (yData, { type, path, value, oldValue }, yTextFields = []) => {
	const isOnlyOneItem = path.length === 1;
	const yItem = isOnlyOneItem ? yData : get(yData, path.slice(0, -1));
	const key = isOnlyOneItem ? path[0] : path[path.length - 1];
	const mapAction = grpupAction[type];
	const formatedValue = value === undefined ? undefined : makeYstruct(value, yTextFields);
	const actionKey = is(yItem);

	if (actionKey === YJS_ARRAY) {
		const arrayActionFn = mapAction[actionKey];
		arrayActionFn(yItem, key, formatedValue);
	} else if (actionKey === YJS_MAP) {
		if ([ACTION_CREATE, ACTION_CHANGE].includes(type)) {
			const mapSet = mapAction[actionKey];
			mapSet({
				yMap: yItem,
				key: key,
				value: formatedValue,
				isYtext: yTextFields.includes(key),
				oldValue: oldValue
			});
		} else {
			const mapRemove = mapAction[actionKey];
			mapRemove(yItem, key);
		}
	}
};
