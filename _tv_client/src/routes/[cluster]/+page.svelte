<script lang="ts">
	import { query } from '$lib/index.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { PressedKeys } from 'runed';
	import { goto } from '$app/navigation';

	const TAGS_PER_ROW = 4;

	let selectedColumn = $state(0);
	let selectedRow = $state(0);

	const keys = new PressedKeys();
	keys.onKeys(['a'], () => {
		selectedColumn = Math.max(0, selectedColumn - 1);
	});
	keys.onKeys(['d'], () => {
		selectedColumn = Math.min(TAGS_PER_ROW - 1, selectedColumn + 1);
	});
	keys.onKeys(['w'], () => {
		selectedRow = Math.max(0, selectedRow - 1);
	});
	keys.onKeys(['s'], () => {
		selectedRow = Math.min(rows.length - 1, selectedRow + 1);
	});
	keys.onKeys(['Enter'], () => {
		if (
			selectedRow >= 0 &&
			selectedRow < rows.length &&
			selectedColumn >= 0 &&
			selectedColumn < TAGS_PER_ROW
		) {
			const tag = rows[selectedRow][selectedColumn];
			if (tag) {
				goto(page.url + '/' + tag.id);
			}
		}
	});
	keys.onKeys('Escape', () => {
		history.back();
	});

	let tags: {
		count: number;
		icon: string | null;
		id: number;
		parentId: number | null;
		tag: string;
	}[] = $state([]);
	let rows: (typeof tags)[] = $state([]);

	onMount(async () => {
		tags = await query('tags_query_from_database', {
			cluster: page.params.cluster,
			mediaTypeFilter: 'video',
			favouritesOnly: false
		});
		tags.sort((a, b) => b.count - a.count);

		rows = [];
		for (let i = 0; i < Math.ceil(tags.length / TAGS_PER_ROW); i++) {
			rows.push(tags.slice(i * TAGS_PER_ROW, (i + 1) * TAGS_PER_ROW));
		}
	});
</script>

<main>
	{#each rows as row, i}
		<div class="row">
			{#each row as tag, j}
				<button data-selected={i === selectedRow && j === selectedColumn}>
					{#if tag.icon}
						<Icon name={tag.icon as any} />
					{/if}
					{#if tag.parentId}
						{tags.find((t) => t.id === tag.parentId)?.tag} /
					{/if}
					{tag.tag}
				</button>
			{/each}
		</div>
	{/each}
</main>

<style lang="scss">
	main {
		display: grid;
		grid-gap: 1rem;
		margin: 1rem;

		.row {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 1rem;

			button {
				width: 250px;
				height: 2rem;

				display: flex;
				align-items: center;
				justify-content: center;
				gap: 0.75rem;
				text-transform: capitalize;
			}
		}
	}
</style>
