<script>
	import { getDoc } from '../lib/doc.js';
	import { createWsProvider } from '../lib/provider.js';
	import { init } from '../lib/editor.js';
	import { blocks as defaultBlocks } from '../lib/default.js';
	import { register } from '../lib/binding.js';

	const guid = 'foo';
	const doc = getDoc(guid);
	const syncedCallback = () => {
		const syncEventName = 'syncLocalToRemote';
		const blcoksFromRemote = doc.getArray('blocks').toJSON();
		const blocks = blcoksFromRemote.length ? blcoksFromRemote : defaultBlocks;
		const editor = init(blocks, syncEventName);

		register({ doc, editor, syncEventName });
	};
	createWsProvider(doc, syncedCallback);
</script>

<div id="editorjs" />
