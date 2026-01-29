<script lang="ts">
	import { Play, Square, Loader2 } from 'lucide-svelte';
	import type { ConnectionStatus } from '$lib/types';

	interface Props {
		status?: ConnectionStatus;
		onConnect: () => void | Promise<void>;
		onDisconnect: () => void | Promise<void>;
		disabled?: boolean;
		size?: 'sm' | 'md' | 'lg';
	}

	let { status, onConnect, onDisconnect, disabled = false, size = 'md' }: Props = $props();

	// Local state to track request in flight (guards against double-click)
	let requestInFlight = $state(false);

	const currentStatus = $derived(status?.status ?? 'disconnected');
	const isConnected = $derived(currentStatus === 'connected');
	const isConnecting = $derived(
		['connecting', 'waiting_for_otp', 'reconnecting'].includes(currentStatus)
	);
	const isDisconnecting = $derived(currentStatus === 'disconnecting');
	const isBusy = $derived(isConnecting || isDisconnecting || requestInFlight);

	async function handleConnect() {
		if (requestInFlight) return;
		requestInFlight = true;
		try {
			await onConnect();
		} finally {
			requestInFlight = false;
		}
	}

	async function handleDisconnect() {
		if (requestInFlight) return;
		requestInFlight = true;
		try {
			await onDisconnect();
		} finally {
			requestInFlight = false;
		}
	}

	const sizeClasses = {
		sm: 'px-2 py-1 text-xs',
		md: 'px-3 py-1.5 text-sm',
		lg: 'px-4 py-2 text-base'
	};

	const iconSizes = {
		sm: 'h-3 w-3',
		md: 'h-4 w-4',
		lg: 'h-5 w-5'
	};
</script>

{#if isConnected || isDisconnecting}
	<button
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			handleDisconnect();
		}}
		disabled={disabled || isBusy}
		class="flex items-center gap-2 rounded-lg bg-red-600 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 {sizeClasses[
			size
		]}"
	>
		{#if isDisconnecting || requestInFlight}
			<Loader2 class="{iconSizes[size]} animate-spin" />
			<span>Disconnecting...</span>
		{:else}
			<Square class={iconSizes[size]} />
			<span>Disconnect</span>
		{/if}
	</button>
{:else}
	<button
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			handleConnect();
		}}
		disabled={disabled || isBusy}
		class="flex items-center gap-2 rounded-lg bg-green-600 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 {sizeClasses[
			size
		]}"
	>
		{#if isConnecting || requestInFlight}
			<Loader2 class="{iconSizes[size]} animate-spin" />
			<span>
				{#if currentStatus === 'waiting_for_otp'}
					Waiting for OTP...
				{:else if currentStatus === 'reconnecting'}
					Reconnecting...
				{:else}
					Connecting...
				{/if}
			</span>
		{:else}
			<Play class={iconSizes[size]} />
			<span>Connect</span>
		{/if}
	</button>
{/if}
