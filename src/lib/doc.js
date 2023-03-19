import * as Y from 'yjs';

export const getDoc = (guid) => {
	const doc = new Y.Doc({ guid });

	return doc;
};
