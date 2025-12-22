<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style lang="scss">
	:global(body) {
		margin: 0;

		background: #000;
		color: #fff;
		font-family: 'Arial';
	}

	:global(input),
	:global(button) {
		color: #fff;
		background: #333;
		border: 1px solid #777;
		border-radius: 3px;
		padding: 3px;
		outline: 2px solid transparent;
	}

	:global(h1) {
		margin: 0;
	}

	:global([data-selected='true']) {
		outline: 2px solid orange;
	}
</style>
