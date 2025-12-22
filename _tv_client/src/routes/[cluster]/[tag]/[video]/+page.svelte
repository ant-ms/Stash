<script lang="ts">
	import { page } from '$app/state';
	import { vars } from '$lib/index.svelte';
	import { PressedKeys } from 'runed';

	const keys = new PressedKeys();
	keys.onKeys('Escape', () => {
		history.back();
	});
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<!-- svelte-ignore element_invalid_self_closing_tag -->
<!-- svelte-ignore a11y_autofocus -->
<video
	controls
	src={vars.instanceURL.current + '/file/' + page.params.video + '?session=' + vars.apiKey.current}
	autoplay
	autofocus
/>

<style lang="scss">
	video {
		width: 100vw;
		height: 100vh;
		object-fit: cover;
		outline: none;
	}

	:global(body) {
		overflow: hidden;
	}
</style>
