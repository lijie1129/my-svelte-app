import { WebsocketProvider } from 'y-websocket';

export const createWsProvider = (ydoc, syncedCallback) => {
	const provider = new WebsocketProvider('ws://localhost:1234', ydoc.guid, ydoc);
	provider.on('synced', syncedCallback);
	return provider;
};
