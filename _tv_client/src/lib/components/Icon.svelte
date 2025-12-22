<script lang="ts">
	import { possibleIcons } from './possibleIcons';

	const possibleIconsAlt = possibleIcons as any;

	interface Props {
		name?: keyof typeof possibleIcons | null;
		nameAlt?: string;
		size?: number | string;
		color?: any;
		opacity?: number;
	}

	let {
		name = null,
		nameAlt = '',
		size = $bindable(1),
		color = null,
		opacity = 1
	}: Props = $props();

	// size
	if (Number(size)) size = Number(size);

	const getStyles = () => {
		const styles = [];

		if (size !== null) {
			const width = typeof size === 'string' ? size : `${size * 1.5}rem`;
			styles.push(['width', width]);
			styles.push(['height', width]);
		}

		// @ts-ignore
		styles.push(['fill', color !== null ? color : 'currentColor']);

		return styles.reduce((cur, item) => {
			return `${cur} ${item[0]}:${item[1]};`;
		}, '');
	};

	// @ts-ignore
	let style = $derived(getStyles(size, color));
</script>

{#if (name || nameAlt).startsWith('mdi')}
	<svg style:opacity viewBox="0 0 24 24" {style}>
		<path d={possibleIconsAlt[name || nameAlt]} />
	</svg>
{:else if (name || nameAlt).startsWith('extra')}
	<svg style:opacity style="position: absolute; width: 0; height: 0" aria-hidden="true">
		<symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135.5 135.5" id={name || nameAlt}>
			{@html possibleIconsAlt[name || nameAlt]}
		</symbol>
	</svg>
	<svg style:opacity viewBox="0 0 20 20" {style}>
		<use xlink:href="#{name || nameAlt}" stroke="#FFF" />
	</svg>
{:else}
	INVALID ICON
{/if}

<style>
	svg {
		vertical-align: middle;
	}
</style>
