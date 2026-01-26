import { api } from '$lib/api';
import type { VPNProfile, ConnectionStatus } from '$lib/types';

let vpns = $state<VPNProfile[]>([]);
let statuses = $state<Map<string, ConnectionStatus>>(new Map());
let loading = $state(false);
let error = $state<string | null>(null);
let pollInterval: ReturnType<typeof setInterval> | null = null;

export function useVPNs() {
	async function refresh() {
		loading = true;
		error = null;
		try {
			vpns = await api.get<VPNProfile[]>('/vpns');
			// Fetch status for each VPN
			const newStatuses = new Map<string, ConnectionStatus>();
			for (const vpn of vpns) {
				try {
					const status = await api.get<ConnectionStatus>(`/vpns/${vpn.name}/status`);
					newStatuses.set(vpn.name, status);
				} catch {
					// Ignore status fetch errors for individual VPNs
				}
			}
			statuses = newStatuses;
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			error = apiError.message ?? 'Failed to load VPNs';
		} finally {
			loading = false;
		}
	}

	function startPolling(intervalMs = 5000) {
		stopPolling();
		refresh();
		pollInterval = setInterval(refresh, intervalMs);
	}

	function stopPolling() {
		if (pollInterval) {
			clearInterval(pollInterval);
			pollInterval = null;
		}
	}

	return {
		get vpns() {
			return vpns;
		},
		get statuses() {
			return statuses;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		refresh,
		startPolling,
		stopPolling,
		getStatus: (name: string) => statuses.get(name)
	};
}
