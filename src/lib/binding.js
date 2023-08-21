import { diffJson, patch, ACTION_CREATE, ACTION_REMOVE, ACTION_CHANGE } from './diff.js';
import set from 'lodash.set';

let ydoc;
let editorInstance;
let syncLocalToRemoteEventName;
let fieldName = 'blocks';

const syncContentFromLocalToRemoteHandler = async () => {
	const { blocks } = await editorInstance.save();
	const yBlocks = ydoc.getArray(fieldName);
	const diff = diffJson(yBlocks.toJSON(), blocks);

	if (!diff || !diff.length) return;

	console.log('--- [binding] local ---', { blocks, diff, yBlocks: yBlocks.toJSON() });

	ydoc.transact(() => {
		diff.forEach((item) => {
			patch(yBlocks, item, ['text', 'items']);
		});
	});
};

const updateBlock = async (path, value) => {
	const block = editorInstance.blocks.getBlockByIndex(path[0]);
	const blockData = await block.save();
	set(blockData, path.slice(1).join('.'), value);
	const data = { ...blockData.data };

	editorInstance.blocks.update(blockData.id, data);
};

const syncContentFromRemoteToLocalHandler = async (events) => {
	const local = events[0].transaction.local;

	if (local) return;

	const { blocks } = await editorInstance.save();
	const yBlocks = ydoc.getArray(fieldName);
	const diff = diffJson(blocks, yBlocks.toJSON());

	console.log('--- [binding] remove ---', { events, blocks, diff, yBlocks: yBlocks.toJSON() });

	diff.forEach(async ({ type, path, value }) => {
		if (type === ACTION_CREATE) {
			if (path.length === 1) {
				editorInstance.blocks.insert(value.type, value.data, null, path[0]);
			} else {
				await updateBlock(path, value);
			}
			return;
		}

    if (type === ACTION_REMOVE) {
      if (path.length === 1) {
			  editorInstance.blocks.delete(path[0]);
      } else {
        console.log('--- TODO: deal remove property ---');
      }
			return;
    }

		if (type === ACTION_CHANGE) {
			await updateBlock(path, value);
			return;
		}
	});
};

export const register = async ({
	doc,
	editor,
	syncEventName = 'syncContentFromLocalToRemote',
	rootFieldName = 'blocks'
}) => {
	ydoc = doc;
	editorInstance = editor;
	syncLocalToRemoteEventName = syncEventName;
	fieldName = rootFieldName;

	await editorInstance.isReady;

	editorInstance.on(syncLocalToRemoteEventName, syncContentFromLocalToRemoteHandler);

	ydoc.getArray(fieldName).observeDeep(syncContentFromRemoteToLocalHandler);
};

export const destroy = () => {
	editorInstance.off(syncLocalToRemoteEventName, syncContentFromLocalToRemoteHandler);
	ydoc = undefined;
	editorInstance = undefined;
	syncLocalToRemoteEventName = undefined;
	fieldName = undefined;
};
