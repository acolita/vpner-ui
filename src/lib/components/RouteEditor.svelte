<script lang="ts">
	import { Plus, Trash2 } from 'lucide-svelte';
	import type { Route } from '$lib/types';

	interface Props {
		routes: Route[];
	}

	let { routes = $bindable() }: Props = $props();

	function addRoute() {
		routes = [...routes, { cidr: '', priority: 100 }];
	}

	function removeRoute(index: number) {
		routes = routes.filter((_, i) => i !== index);
	}

	function validateCIDR(cidr: string): boolean {
		return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/.test(cidr);
	}
</script>

<div class="space-y-2">
	{#each routes as route, i (i)}
		<div class="flex items-center gap-2">
			<input
				bind:value={route.cidr}
				type="text"
				placeholder="10.0.0.0/8"
				class="flex-1 rounded-lg border p-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
				class:border-red-500={route.cidr && !validateCIDR(route.cidr)}
			/>
			<input
				bind:value={route.priority}
				type="number"
				min="0"
				max="1000"
				class="w-24 rounded-lg border p-2 text-center dark:border-gray-600 dark:bg-gray-700"
				title="Priority (higher = preferred)"
			/>
			<button
				type="button"
				onclick={() => removeRoute(i)}
				class="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
			>
				<Trash2 class="h-4 w-4" />
			</button>
		</div>
	{/each}

	{#if routes.length === 0}
		<p class="py-4 text-center text-sm text-gray-500">No routes defined</p>
	{/if}

	<button
		type="button"
		onclick={addRoute}
		class="flex items-center gap-2 rounded-lg px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
	>
		<Plus class="h-4 w-4" />
		Add Route
	</button>
</div>
