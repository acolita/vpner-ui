<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { useVPNs } from '$lib/stores/vpns.svelte';
	import { onVisibilityChange } from '$lib/utils/visibility';
	import VPNCard from '$lib/components/VPNCard.svelte';
	import ImportModal from '$lib/components/ImportModal.svelte';
	import { RefreshCw, Plus, Shield, Upload } from 'lucide-svelte';

	const vpnStore = useVPNs();
	let cleanupVisibility: (() => void) | null = null;
	let showImportModal = $state(false);

	onMount(() => {
		vpnStore.startPolling(5000);

		cleanupVisibility = onVisibilityChange(
			() => vpnStore.startPolling(5000),
			() => vpnStore.stopPolling()
		);
	});

	onDestroy(() => {
		vpnStore.stopPolling();
		cleanupVisibility?.();
	});

	function handleImport(data: any) {
		// Navigate to new VPN page with imported data
		const params = new URLSearchParams();
		params.set('import', JSON.stringify(data));
		goto(`/vpn/new?${params.toString()}`);
		showImportModal = false;
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">VPN Dashboard</h1>
		<div class="flex gap-2">
			<button
				onclick={() => vpnStore.refresh()}
				disabled={vpnStore.loading}
				class="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
				title="Refresh"
			>
				<RefreshCw class="h-5 w-5 {vpnStore.loading ? 'animate-spin' : ''}" />
			</button>
			<button
				onclick={() => (showImportModal = true)}
				class="flex items-center gap-1 rounded-lg border px-3 py-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
			>
				<Upload class="h-4 w-4" />
				Import
			</button>
			<a
				href="/vpn/new"
				class="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
			>
				<Plus class="h-4 w-4" />
				Add VPN
			</a>
		</div>
	</div>

	{#if vpnStore.error}
		<div class="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
			{vpnStore.error}
		</div>
	{/if}

	{#if vpnStore.loading && vpnStore.vpns.length === 0}
		<div class="flex justify-center py-12">
			<RefreshCw class="h-8 w-8 animate-spin text-gray-400" />
		</div>
	{:else if vpnStore.vpns.length === 0}
		<div class="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
			<Shield class="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
			<p class="mb-4 text-gray-500 dark:text-gray-400">No VPN profiles configured.</p>
			<a href="/vpn/new" class="text-blue-600 hover:underline">Add your first VPN</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each vpnStore.vpns as profile (profile.name)}
				<VPNCard {profile} status={vpnStore.getStatus(profile.name)} />
			{/each}
		</div>
	{/if}
</div>

<ImportModal open={showImportModal} onClose={() => (showImportModal = false)} onImport={handleImport} />
