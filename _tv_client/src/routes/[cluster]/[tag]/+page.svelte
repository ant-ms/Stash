<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { query, vars } from '$lib/index.svelte';
	import { mdiDiscPlayer } from '@mdi/js';
	import { PressedKeys } from 'runed';
	import { onMount } from 'svelte';

	const MEDIA_PER_ROW = 4;

	let selectedRow = $state(0);
	let selectedColumn = $state(0);

	const scroll = () => {
		setTimeout(() => {
			document
				.querySelector('.col[data-selected="true"]')
				?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}, 100);
	};

	const keys = new PressedKeys();
	keys.onKeys(['a'], () => {
		selectedColumn = Math.max(0, selectedColumn - 1);
		scroll();
	});
	keys.onKeys(['d'], () => {
		selectedColumn = Math.min(MEDIA_PER_ROW - 1, selectedColumn + 1);
		scroll();
	});
	keys.onKeys(['w'], () => {
		selectedRow = Math.max(0, selectedRow - 1);
		scroll();
	});
	keys.onKeys(['s'], () => {
		selectedRow = Math.min(rows.length - 1, selectedRow + 1);
		scroll();
	});
	keys.onKeys(['Enter'], () => {
		const selectedMedia = rows[selectedRow][selectedColumn];
		if (selectedMedia) {
			goto(`/${page.params.cluster}/${page.params.tag}/${selectedMedia.id}`);
		}
	});
	keys.onKeys('Escape', () => {
		history.back();
	});

	let media: {
		deleted: boolean;
		favourited: boolean;
		id: string;
		name: string;
		type: string;
	}[] = $state([]);

	let rows: (typeof media)[] = $state([]);

	onMount(async () => {
		media = await query('media_query_from_database', {
			cluster: page.params.cluster,
			tags: [page.params.tag],
			offset: 0,
			favouritesOnly: false,
			specialFilterAttribute: null,
			seed: 0,
			activeSortingMethod: 0,
			countOfTags: -1,
			minResolution: null,
			mediaType: 'video',
			traverse: true,
			includeTaggedTags: true
		});
		media = media.filter((m) => !m.deleted);

		rows = [];
		for (let i = 0; i < media.length; i += MEDIA_PER_ROW) {
			rows.push(media.slice(i, i + MEDIA_PER_ROW));
		}
	});
</script>

<main>
	{#each rows as row, i}
		<div class="row">
			{#each row as media, j}
				<div
					class="col"
					style:width="calc(100% / {MEDIA_PER_ROW})"
					data-selected={selectedRow === i && selectedColumn === j}
				>
					<img
						src={vars.instanceURL.current +
							'/thumb/' +
							media.id +
							'.webp?session=' +
							vars.apiKey.current}
						alt={media.name}
					/>
					<span>{media.name}</span>
				</div>
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

			.col {
				height: 200px;
				background-color: #f0f0f0;
				border-radius: 8px;
				overflow: hidden;
				scroll-margin: 1rem;
				background: #222;

				img {
					width: 100%;
					height: calc(100% - 2rem);
					object-fit: cover;
				}

				span {
					display: block;
					margin: 0.25rem;
					margin-top: -0.75rem;
					overflow: hidden;
					line-height: 3rem;
				}
			}
		}
	}
</style>
