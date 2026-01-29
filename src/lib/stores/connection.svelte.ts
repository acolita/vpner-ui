// Backend connection status store

type ConnectionState = {
	connected: boolean;
	lastError: string | null;
	lastChecked: Date | null;
	retryCount: number;
};

let state = $state<ConnectionState>({
	connected: true,
	lastError: null,
	lastChecked: null,
	retryCount: 0
});

let retryTimer: ReturnType<typeof setTimeout> | null = null;

export function useConnection() {
	return {
		get connected() {
			return state.connected;
		},
		get lastError() {
			return state.lastError;
		},
		get retryCount() {
			return state.retryCount;
		},

		setConnected() {
			state.connected = true;
			state.lastError = null;
			state.lastChecked = new Date();
			state.retryCount = 0;
			if (retryTimer) {
				clearTimeout(retryTimer);
				retryTimer = null;
			}
		},

		setDisconnected(error: string) {
			state.connected = false;
			state.lastError = error;
			state.lastChecked = new Date();
		},

		incrementRetry() {
			state.retryCount++;
		},

		scheduleRetry(callback: () => void, delayMs: number = 5000) {
			if (retryTimer) {
				clearTimeout(retryTimer);
			}
			retryTimer = setTimeout(() => {
				state.retryCount++;
				callback();
			}, delayMs);
		}
	};
}

// Check if an error indicates backend unavailability
export function isBackendUnavailable(error: unknown): boolean {
	if (error instanceof TypeError) {
		// Network error (fetch failed)
		return true;
	}
	if (typeof error === 'object' && error !== null && 'status' in error) {
		const status = (error as { status: number }).status;
		// Bad Gateway, Service Unavailable, Gateway Timeout
		return status === 502 || status === 503 || status === 504;
	}
	return false;
}

// Get user-friendly error message
export function getBackendErrorMessage(error: unknown): string {
	if (error instanceof TypeError) {
		return 'Unable to connect to the vpner backend service';
	}
	if (typeof error === 'object' && error !== null && 'status' in error) {
		const status = (error as { status: number }).status;
		switch (status) {
			case 502:
				return 'Bad Gateway - The vpner backend service may not be running';
			case 503:
				return 'Service Unavailable - The vpner backend is temporarily unavailable';
			case 504:
				return 'Gateway Timeout - The vpner backend is not responding';
			default:
				return `Server error (${status})`;
		}
	}
	return 'Unknown connection error';
}
