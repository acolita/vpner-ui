<script lang="ts">
	import { Globe, Server } from 'lucide-svelte';
	import type { DNSEntry } from '$lib/types';

	interface Props {
		entries: DNSEntry[];
	}

	let { entries }: Props = $props();
</script>

{#if entries.length === 0}
	<p class="text-gray-500 dark:text-gray-400">No DNS entries configured.</p>
{:else}
	<div class="overflow-x-auto">
		<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
			<thead>
				<tr>
					<th
						class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400"
					>
						Domain
					</th>
					<th
						class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400"
					>
						Type
					</th>
					<th
						class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400"
					>
						Value
					</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
				{#each entries as entry (entry.domain)}
					<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
						<td class="px-4 py-2 font-mono text-sm">{entry.domain}</td>
						<td class="px-4 py-2">
							{#if entry.address}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
								>
									<Globe class="h-3 w-3" />
									Static
								</span>
							{:else}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
								>
									<Server class="h-3 w-3" />
									Forward
								</span>
							{/if}
						</td>
						<td class="px-4 py-2 font-mono text-sm text-gray-600 dark:text-gray-400">
							{entry.address ?? entry.server}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
