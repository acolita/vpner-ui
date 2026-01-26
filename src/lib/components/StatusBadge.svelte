<script lang="ts">
	import { Circle, Loader2 } from 'lucide-svelte';

	interface Props {
		status: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { status, size = 'md' }: Props = $props();

	const statusColors: Record<string, string> = {
		connected: 'text-green-500',
		connecting: 'text-yellow-500',
		disconnected: 'text-gray-400',
		disconnecting: 'text-yellow-500',
		failed: 'text-red-500',
		waiting_for_otp: 'text-orange-500',
		reconnecting: 'text-yellow-500'
	};

	const statusLabels: Record<string, string> = {
		connected: 'Connected',
		connecting: 'Connecting',
		disconnected: 'Disconnected',
		disconnecting: 'Disconnecting',
		failed: 'Failed',
		waiting_for_otp: 'OTP Required',
		reconnecting: 'Reconnecting'
	};

	const sizeClasses: Record<string, string> = {
		sm: 'h-3 w-3',
		md: 'h-4 w-4',
		lg: 'h-5 w-5'
	};

	const textSizes: Record<string, string> = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base'
	};

	const isAnimated = $derived(
		['connecting', 'disconnecting', 'reconnecting', 'waiting_for_otp'].includes(status)
	);
	const color = $derived(statusColors[status] ?? 'text-gray-400');
	const label = $derived(statusLabels[status] ?? status);
	const iconSize = $derived(sizeClasses[size]);
	const textSize = $derived(textSizes[size]);
</script>

<div class="flex items-center gap-2">
	{#if isAnimated}
		<Loader2 class="{iconSize} {color} animate-spin" />
	{:else}
		<Circle class="{iconSize} {color} fill-current" />
	{/if}
	<span class="{textSize} font-medium {color}">{label}</span>
</div>
