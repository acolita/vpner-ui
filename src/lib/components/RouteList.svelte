<script lang="ts">
	import { CheckCircle, XCircle, Ban } from 'lucide-svelte';
	import type { Route } from '$lib/types';

	interface Props {
		routes: Route[];
		vpnInterface?: string;
	}

	let { routes, vpnInterface }: Props = $props();

	const isConnected = $derived(!!vpnInterface);
</script>

{#if routes.length === 0}
	<p class="text-gray-500 dark:text-gray-400">No routes configured.</p>
{:else}
	<div class="overflow-x-auto">
		<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
			<thead>
				<tr>
					<th
						class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400"
					>
						CIDR
					</th>
					<th
						class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400"
					>
						Priority
					</th>
					<th
						class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400"
					>
						Status
					</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
				{#each routes as route (route.cidr)}
					<tr
						class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
						class:opacity-50={route.enabled === false}
					>
						<td class="px-4 py-2 font-mono text-sm">{route.cidr}</td>
						<td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
							{route.priority ?? 100}
						</td>
						<td class="px-4 py-2">
							{#if route.enabled === false}
								<div class="flex items-center gap-1 text-amber-500 dark:text-amber-400">
									<Ban class="h-4 w-4" />
									<span class="text-xs">Disabled</span>
								</div>
							{:else if isConnected}
								<div class="flex items-center gap-1 text-green-600 dark:text-green-400">
									<CheckCircle class="h-4 w-4" />
									<span class="text-xs">Active</span>
								</div>
							{:else}
								<div class="flex items-center gap-1 text-gray-400">
									<XCircle class="h-4 w-4" />
									<span class="text-xs">Inactive</span>
								</div>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
