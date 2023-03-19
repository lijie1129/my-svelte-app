import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';

export const init = (blocks = [], syncEventName) => {
	const editor = new EditorJS({
		tools: {
			header: { class: Header },
			list: { class: List }
		},

		data: {
			blocks
		},

		onChange: (api) => {
			api.events.emit(syncEventName);
		}
	});

	return editor;
};
