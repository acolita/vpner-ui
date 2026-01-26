<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { DNSEntryWithProfile, LocalDNSEntry } from '$lib/types';
	import { useToast } from '$lib/stores/toast.svelte';
	import {
		Globe,
		Server,
		ExternalLink,
		RefreshCw,
		Plus,
		Pencil,
		Trash2,
		Check,
		X,
		Home
	} from 'lucide-svelte';

	const toast = useToast();

	let entries = $state<DNSEntryWithProfile[]>([]);
	let localEntries = $state<LocalDNSEntry[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Local DNS form state
	let showAddForm = $state(false);
	let editingId = $state<number | null>(null);
	let formDomain = $state('');
	let formAddress = $state('');
	let formDescription = $state('');
	let formEnabled = $state(true);
	let formLoading = $state(false);

	// Group VPN entries by profile
	const groupedEntries = $derived.by(() => {
		const groups = new Map<string, DNSEntryWithProfile[]>();
		for (const entry of entries) {
			const profile = entry.profile_name ?? 'global';
			if (!groups.has(profile)) {
				groups.set(profile, []);
			}
			groups.get(profile)!.push(entry);
		}
		return groups;
	});

	async function refresh() {
		loading = true;
		error = null;
		try {
			const [vpnDns, local] = await Promise.all([
				api.get<DNSEntryWithProfile[]>('/dns'),
				api.get<LocalDNSEntry[]>('/dns/local')
			]);
			entries = vpnDns;
			localEntries = local ?? [];
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			error = apiError.message ?? 'Failed to load DNS entries';
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		formDomain = '';
		formAddress = '';
		formDescription = '';
		formEnabled = true;
		showAddForm = false;
		editingId = null;
	}

	function startEdit(entry: LocalDNSEntry) {
		editingId = entry.id;
		formDomain = entry.domain;
		formAddress = entry.address;
		formDescription = entry.description ?? '';
		formEnabled = entry.enabled;
		showAddForm = false;
	}

	async function saveLocalEntry() {
		if (!formDomain.trim() || !formAddress.trim()) {
			toast.error('Domain and address are required');
			return;
		}

		formLoading = true;
		try {
			const payload = {
				domain: formDomain.trim(),
				address: formAddress.trim(),
				description: formDescription.trim(),
				enabled: formEnabled
			};

			if (editingId) {
				await api.put(`/dns/local/${editingId}`, payload);
				toast.success('DNS entry updated');
			} else {
				await api.post('/dns/local', payload);
				toast.success('DNS entry created');
			}
			resetForm();
			refresh();
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Failed to save DNS entry');
		} finally {
			formLoading = false;
		}
	}

	async function deleteLocalEntry(id: number) {
		if (!confirm('Are you sure you want to delete this DNS entry?')) {
			return;
		}

		try {
			await api.delete(`/dns/local/${id}`);
			toast.success('DNS entry deleted');
			refresh();
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Failed to delete DNS entry');
		}
	}

	async function toggleEnabled(entry: LocalDNSEntry) {
		try {
			await api.put(`/dns/local/${entry.id}`, {
				enabled: !entry.enabled
			});
			refresh();
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Failed to update DNS entry');
		}
	}

	onMount(refresh);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
			<Globe class="h-6 w-6" />
			DNS Management
		</h1>
		<button
			onclick={refresh}
			disabled={loading}
			class="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
			title="Refresh"
		>
			<RefreshCw class="h-5 w-5 {loading ? 'animate-spin' : ''}" />
		</button>
	</div>

	{#if error}
		<div class="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="animate-pulse space-y-4">
			<div class="h-32 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
			<div class="h-32 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
		</div>
	{:else}
		<!-- Local DNS Section -->
		<div class="rounded-lg bg-white shadow dark:bg-gray-800">
			<div class="flex items-center justify-between border-b p-4 dark:border-gray-700">
				<div class="flex items-center gap-2">
					<Home class="h-5 w-5 text-green-500" />
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Local Services</h2>
					<span class="text-sm text-gray-500">({localEntries.length} entries)</span>
				</div>
				<button
					onclick={() => {
						resetForm();
						showAddForm = true;
					}}
					class="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
				>
					<Plus class="h-4 w-4" />
					Add Entry
				</button>
			</div>

			<!-- Add/Edit Form -->
			{#if showAddForm || editingId}
				<div class="border-b bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
					<div class="grid gap-4 md:grid-cols-4">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>Domain</label
							>
							<input
								type="text"
								bind:value={formDomain}
								placeholder="service.example.local"
								class="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>Address</label
							>
							<input
								type="text"
								bind:value={formAddress}
								placeholder="192.168.1.100"
								class="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>Description</label
							>
							<input
								type="text"
								bind:value={formDescription}
								placeholder="Optional description"
								class="w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
							/>
						</div>
						<div class="flex items-end gap-2">
							<button
								onclick={saveLocalEntry}
								disabled={formLoading}
								class="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
							>
								<Check class="h-4 w-4" />
								{editingId ? 'Update' : 'Add'}
							</button>
							<button
								onclick={resetForm}
								class="flex items-center gap-1 rounded-lg border px-4 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
							>
								<X class="h-4 w-4" />
								Cancel
							</button>
						</div>
					</div>
				</div>
			{/if}

			<!-- Local DNS Table -->
			{#if localEntries.length > 0}
				<div class="overflow-x-auto">
					<table class="min-w-full">
						<thead class="bg-gray-50 dark:bg-gray-700/50">
							<tr>
								<th class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500"
									>Domain</th
								>
								<th class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500"
									>Address</th
								>
								<th class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500"
									>Description</th
								>
								<th class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500"
									>Status</th
								>
								<th class="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
							{#each localEntries as entry}
								<tr class={!entry.enabled ? 'opacity-50' : ''}>
									<td class="px-4 py-2 font-mono text-sm">{entry.domain}</td>
									<td class="px-4 py-2 font-mono text-sm">{entry.address}</td>
									<td class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
										{entry.description || '-'}
									</td>
									<td class="px-4 py-2">
										<button
											onclick={() => toggleEnabled(entry)}
											class="rounded px-2 py-0.5 text-xs font-medium {entry.enabled
												? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
												: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}"
										>
											{entry.enabled ? 'Enabled' : 'Disabled'}
										</button>
									</td>
									<td class="px-4 py-2 text-right">
										<div class="flex justify-end gap-1">
											<button
												onclick={() => startEdit(entry)}
												class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
												title="Edit"
											>
												<Pencil class="h-4 w-4 text-gray-500" />
											</button>
											<button
												onclick={() => deleteLocalEntry(entry.id)}
												class="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/30"
												title="Delete"
											>
												<Trash2 class="h-4 w-4 text-red-500" />
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else if !showAddForm}
				<div class="p-8 text-center text-gray-500 dark:text-gray-400">
					<Home class="mx-auto mb-2 h-8 w-8 opacity-50" />
					<p>No local DNS entries configured.</p>
					<p class="mt-1 text-sm">Add entries for local services like portals, dashboards, etc.</p>
				</div>
			{/if}
		</div>

		<!-- VPN DNS Section -->
		<div class="space-y-4">
			<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
				<Server class="h-5 w-5 text-blue-500" />
				VPN DNS Entries
			</h2>

			{#each [...groupedEntries.entries()] as [profile, profileEntries]}
				<div class="rounded-lg bg-white shadow dark:bg-gray-800">
					<div class="flex items-center justify-between border-b p-4 dark:border-gray-700">
						<div class="flex items-center gap-2">
							<Server class="h-5 w-5 text-gray-500" />
							<h3 class="font-semibold">{profile}</h3>
							<span class="text-sm text-gray-500">({profileEntries.length} entries)</span>
						</div>
						{#if profile !== 'global'}
							<a
								href="/vpn/{profile}"
								class="flex items-center gap-1 text-sm text-blue-600 hover:underline"
							>
								View Profile <ExternalLink class="h-3 w-3" />
							</a>
						{/if}
					</div>
					<div class="overflow-x-auto">
						<table class="min-w-full">
							<thead class="bg-gray-50 dark:bg-gray-700/50">
								<tr>
									<th class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500"
										>Domain</th
									>
									<th class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500"
										>Type</th
									>
									<th class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500"
										>Value</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
								{#each profileEntries as entry}
									<tr>
										<td class="px-4 py-2 font-mono text-sm">{entry.domain}</td>
										<td class="px-4 py-2">
											{#if entry.address}
												<span
													class="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
													>Static</span
												>
											{:else}
												<span
													class="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
													>Forward</span
												>
											{/if}
										</td>
										<td class="px-4 py-2 font-mono text-sm">{entry.address ?? entry.server}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/each}

			{#if entries.length === 0}
				<div class="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
					<Globe class="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
					<p class="text-gray-500 dark:text-gray-400">No VPN DNS entries configured.</p>
					<p class="mt-1 text-sm text-gray-400">
						Add DNS entries to your VPN profiles to enable split-horizon DNS.
					</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
