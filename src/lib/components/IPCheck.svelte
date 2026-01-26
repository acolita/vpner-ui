<script lang="ts">
	import { Search, ArrowRight, Loader2 } from 'lucide-svelte';
	import { api } from '$lib/api';

	interface IPCheckResult {
		ip: string;
		routed_via: string;
		vpn?: string;
		interface?: string;
	}

	let ip = $state('');
	let result = $state<IPCheckResult | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function checkIP(e: Event) {
		e.preventDefault();
		if (!ip) return;
		loading = true;
		error = null;
		try {
			result = await api.get<IPCheckResult>(`/routes/check?ip=${encodeURIComponent(ip)}`);
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			error = apiError.message ?? 'Failed to check IP';
			result = null;
		} finally {
			loading = false;
		}
	}
</script>

<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
	<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
		<Search class="h-5 w-5 text-gray-500" />
		Check IP Routing
	</h2>

	<form onsubmit={checkIP} class="mb-4 flex gap-2">
		<input
			bind:value={ip}
			type="text"
			placeholder="Enter IP address (e.g., 10.10.1.1)"
			class="flex-1 rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
		/>
		<button
			type="submit"
			disabled={loading || !ip}
			class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
		>
			{#if loading}
				<Loader2 class="h-4 w-4 animate-spin" />
			{:else}
				Check
			{/if}
		</button>
	</form>

	{#if error}
		<div class="rounded-lg bg-red-100 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
			{error}
		</div>
	{/if}

	{#if result}
		<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
			<div class="flex items-center gap-2">
				<span class="font-mono">{result.ip}</span>
				<ArrowRight class="h-4 w-4 text-gray-400" />
				<span class="font-medium">{result.routed_via}</span>
				{#if result.vpn}
					<span class="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
						{result.vpn}
					</span>
				{/if}
				{#if result.interface}
					<span class="text-sm text-gray-500">via {result.interface}</span>
				{/if}
			</div>
		</div>
	{/if}
</div>
