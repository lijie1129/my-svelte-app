import { createId } from '@paralleldrive/cuid2';

export const blocks = [
	{
		id: createId(),
		type: 'header',
		data: { level: 1, text: 'The binding for YJS & EditorJS' }
	},
	{
		id: createId(),
		type: 'paragraph',
		data: {
			text: `This is a document for explaining about how to create a binding for YJS Doc and EditorJS's instance.`
		}
	},
	{
		id: createId(),
		type: 'header',
		data: { level: 2, text: 'Step 1: Download existed data.' }
	},
	{
		id: createId(),
		type: 'paragraph',
		data: {
			text: `Create persistence provider connection to download updates of current document.`
		}
	},
	{
		id: createId(),
		type: 'header',
		data: { level: 2, text: `Step 2: Create EditorJS's instance` }
	},
	{
		id: createId(),
		type: 'paragraph',
		data: { text: `Create EditorJS's instance via the existed data of current document.` }
	},
	{
		id: createId(),
		type: 'header',
		data: { level: 2, text: 'Step 3: Register binding' }
	},
	{
		id: createId(),
		type: 'list',
		data: {
			style: 'ordered',
			items: [
				'Register binding & passing editor and ydoc',
				'Initialize the handler of sync local to remote',
				'Initialize the listener of sync remote to local'
			]
		}
	},
	{
		id: createId(),
		type: 'header',
		data: { level: 2, text: 'API of binding' }
	},
	{
		id: createId(),
		type: 'header',
		data: { level: 3, text: 'Constructor' }
	},
	{
		id: createId(),
		type: 'paragraph',
		data: { text: `Params list:` }
	},
	{
		id: createId(),
		type: 'list',
		data: {
			style: 'ordered',
			items: [
				'doc {Y.Doc} - The YJS Doc',
				`editor {EditorJS} - The EditorJS's instance`
			]
		}
	},
	{
		id: createId(),
		type: 'header',
		data: { level: 3, text: 'Destroy' }
	},
	{
		id: createId(),
		type: 'paragraph',
		data: { text: `Release the YJS Doc & EditorJS's instance.` }
	},
	{
		id: createId(),
		type: 'header',
		data: { level: 2, text: 'Others: we need the tools below' }
	},
	{
		id: createId(),
		type: 'list',
		data: {
			style: 'ordered',
			items: [
				`YJS Type detector: detect any yjs's type`,
				'JSON diff method (YArray, YMap): diff array level data & map level data',
				'Text diff method (YText): diff text level data'
			]
		}
	}
];
