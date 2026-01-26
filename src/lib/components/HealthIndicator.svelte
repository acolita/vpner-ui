<script lang="ts">
	import { Heart, HeartCrack } from 'lucide-svelte';
	import type { HealthStatus } from '$lib/types';

	interface Props {
		health?: HealthStatus;
	}

	let { health }: Props = $props();

	const tooltip = $derived(
		health
			? health.healthy
				? `Healthy - Last check: ${new Date(health.last_check).toLocaleTimeString()}`
				: `Unhealthy - ${health.consecutive_failures} consecutive failures`
			: ''
	);
</script>

{#if health}
	<div class="flex items-center gap-1" title={tooltip}>
		{#if health.healthy}
			<Heart class="h-4 w-4 fill-green-500 text-green-500" />
		{:else}
			<HeartCrack class="h-4 w-4 text-red-500" />
			<span class="text-xs text-red-500">{health.consecutive_failures}</span>
		{/if}
	</div>
{/if}
