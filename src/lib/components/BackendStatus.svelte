<script lang="ts">
	import { useConnection } from '$lib/stores/connection.svelte';
	import { api } from '$lib/api';
	import { AlertTriangle, RefreshCw, Server } from 'lucide-svelte';

	const connection = useConnection();

	let checking = $state(false);
	let countdown = $state(0);
	let countdownTimer: ReturnType<typeof setInterval> | null = null;

	async function checkConnection() {
		checking = true;
		try {
			await api.get('/health');
			// If successful, connection store will be updated by the API client
		} catch {
			// Error handled by API client
		} finally {
			checking = false;
		}
	}

	function startAutoRetry() {
		countdown = 10;
		if (countdownTimer) clearInterval(countdownTimer);
		countdownTimer = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				if (countdownTimer) clearInterval(countdownTimer);
				checkConnection().then(() => {
					if (!connection.connected) {
						startAutoRetry();
					}
				});
			}
		}, 1000);
	}

	$effect(() => {
		if (!connection.connected && !countdownTimer) {
			startAutoRetry();
		}
		if (connection.connected && countdownTimer) {
			clearInterval(countdownTimer);
			countdownTimer = null;
		}
	});

	// Cleanup on unmount
	$effect(() => {
		return () => {
			if (countdownTimer) clearInterval(countdownTimer);
		};
	});
</script>

{#if !connection.connected}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
		<div class="mx-4 max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
			<div class="flex flex-col items-center text-center">
				<div class="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/30">
					<Server class="h-12 w-12 text-red-600 dark:text-red-400" />
				</div>

				<h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
					Backend Unavailable
				</h2>

				<div class="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-left dark:bg-amber-900/20">
					<AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
					<p class="text-sm text-amber-800 dark:text-amber-200">
						{connection.lastError || 'Unable to connect to the vpner backend service'}
					</p>
				</div>

				<p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
					Please check that the vpnerd service is running on the server:
				</p>

				<div class="mb-6 w-full rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
					<code class="text-xs text-gray-800 dark:text-gray-200">
						sudo systemctl status vpnerd
					</code>
				</div>

				<div class="flex w-full flex-col gap-3">
					<button
						onclick={checkConnection}
						disabled={checking}
						class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{#if checking}
							<RefreshCw class="h-5 w-5 animate-spin" />
							Checking...
						{:else}
							<RefreshCw class="h-5 w-5" />
							Check Connection
						{/if}
					</button>

					{#if countdown > 0 && !checking}
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Auto-retry in {countdown} seconds...
						</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
