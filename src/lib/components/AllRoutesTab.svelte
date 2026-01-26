<script lang="ts">
	import { Network, CheckCircle, XCircle, ExternalLink } from 'lucide-svelte';
	import type { RouteEntry } from '$lib/types';

	interface Props {
		routes: RouteEntry[];
		loading: boolean;
	}

	let { routes, loading }: Props = $props();

	// Group by VPN profile
	const groupedRoutes = $derived.by(() => {
		const groups = new Map<string, RouteEntry[]>();
		for (const route of routes) {
			const profile = route.profile_name;
			if (!groups.has(profile)) {
				groups.set(profile, []);
			}
			groups.get(profile)!.push(route);
		}
		return groups;
	});
</script>

{#if loading}
	<div class="animate-pulse space-y-4">
		<div class="h-32 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
	</div>
{:else}
	<div class="space-y-4">
		{#each [...groupedRoutes.entries()] as [profile, profileRoutes]}
			<div class="rounded-lg bg-white shadow dark:bg-gray-800">
				<div class="flex items-center justify-between border-b p-4 dark:border-gray-700">
					<div class="flex items-center gap-2">
						<Network class="h-5 w-5 text-gray-500" />
						<h3 class="font-semibold">{profile}</h3>
						<span class="text-sm text-gray-500">({profileRoutes.length} routes)</span>
					</div>
					<a
						href="/vpn/{profile}"
						class="flex items-center gap-1 text-sm text-blue-600 hover:underline"
					>
						View Profile <ExternalLink class="h-3 w-3" />
					</a>
				</div>
				<div class="overflow-x-auto">
					<table class="min-w-full">
						<thead class="bg-gray-50 dark:bg-gray-700/50">
							<tr>
								<th class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">CIDR</th>
								<th class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500"
									>Priority</th
								>
								<th class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500"
									>Device</th
								>
								<th class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500"
									>Active</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
							{#each profileRoutes as route}
								<tr>
									<td class="px-4 py-2 font-mono text-sm">{route.cidr}</td>
									<td class="px-4 py-2 text-sm">{route.priority ?? 100}</td>
									<td class="px-4 py-2 font-mono text-sm text-gray-500">{route.device ?? '-'}</td>
									<td class="px-4 py-2">
										{#if route.active}
											<CheckCircle class="h-4 w-4 text-green-500" />
										{:else}
											<XCircle class="h-4 w-4 text-gray-400" />
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/each}

		{#if routes.length === 0}
			<div class="py-12 text-center text-gray-500">No routes configured.</div>
		{/if}
	</div>
{/if}
