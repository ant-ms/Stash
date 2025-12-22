<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import { vars } from '$lib/index.svelte';
	import { PressedKeys } from 'runed';

	let selectedClusterIndex = 0;
	let numberOfClusters = 2;

	const keys = new PressedKeys();
	keys.onKeys(['a'], () => {
		selectedClusterIndex = Math.max(0, selectedClusterIndex - 1);
	});
	keys.onKeys(['d'], () => {
		selectedClusterIndex = Math.min(numberOfClusters - 1, selectedClusterIndex + 1);
	});
	keys.onKeys(['Enter'], () => {
		goto(`/${['Secret', 'Studios'][selectedClusterIndex]}`);
	});
</script>

<main>
	<div class="header">
		<h1>Stash</h1>

		<label>
			Instance URL:
			<input type="url" bind:value={vars.instanceURL.current} />
		</label>

		<label>
			API Key:
			<input type="password" bind:value={vars.apiKey.current} />
		</label>

		<button style="width: 38px;">
			<Icon name="mdiRefresh" />
		</button>
	</div>
	<div class="content">
		{#each ['Secret', 'Studios'] as clusterName, i}
			<button data-selected={i === selectedClusterIndex}>
				<Icon name="mdiFolder" />
				{clusterName}
			</button>
		{/each}
	</div>
</main>

<style lang="scss">
	main {
		.header {
			padding: 1rem;
			display: flex;
			gap: 1rem;

			h1 {
				flex-grow: 1;
			}

			label {
				display: grid;
				grid-template-columns: 1fr auto;
				align-items: center;
				gap: 0.35rem;
			}
		}

		.content {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem;
			justify-content: center;
			margin-top: 3rem;
		}
	}
</style>
