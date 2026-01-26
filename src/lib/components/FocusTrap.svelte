<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		active: boolean;
		children: Snippet;
	}

	let { active, children }: Props = $props();
	let container: HTMLDivElement;

	function handleKeydown(e: KeyboardEvent) {
		if (!active || e.key !== 'Tab') return;

		const focusable = container.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		const first = focusable[0] as HTMLElement;
		const last = focusable[focusable.length - 1] as HTMLElement;

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	onMount(() => {
		if (active) {
			const focusable = container.querySelector('button, [href], input') as HTMLElement;
			focusable?.focus();
		}
	});
</script>

<div bind:this={container} onkeydown={handleKeydown}>
	{@render children()}
</div>
