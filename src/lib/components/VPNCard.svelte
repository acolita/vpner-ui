<script lang="ts">
	import { Network, Clock, Route, Key, AlertTriangle, Calendar } from 'lucide-svelte';
	import StatusBadge from './StatusBadge.svelte';
	import HealthIndicator from './HealthIndicator.svelte';
	import ConnectButton from './ConnectButton.svelte';
	import OTPModal from './OTPModal.svelte';
	import { connect, disconnect, submitOTP } from '$lib/services/connection';
	import { useToast } from '$lib/stores/toast.svelte';
	import type { VPNProfile, ConnectionStatus } from '$lib/types';

	interface Props {
		profile: VPNProfile;
		status?: ConnectionStatus;
		onStatusChange?: () => void;
	}

	let { profile, status, onStatusChange }: Props = $props();

	const toast = useToast();
	let showOTP = $state(false);
	let connecting = $state(false);

	const connectionStatus = $derived(status?.status ?? 'disconnected');
	const isConnected = $derived(connectionStatus === 'connected');
	const routeCount = $derived(profile.routes?.length ?? 0);
	const hasOTP = $derived(status?.otp_required ?? false);
	const hasFailover = $derived(status?.failover_active ?? false);
	const hasSchedule = $derived(profile.schedule?.enabled ?? false);
	const scheduleInfo = $derived(() => {
		if (!profile.schedule) return null;
		const parts = [];
		if (profile.schedule.connect_at) parts.push(`↑${profile.schedule.connect_at}`);
		if (profile.schedule.disconnect_at) parts.push(`↓${profile.schedule.disconnect_at}`);
		if (profile.schedule.days?.length) {
			parts.push(profile.schedule.days.join(', '));
		}
		return parts.join(' ') || 'Scheduled';
	});

	async function handleConnect() {
		// If OTP is required, show OTP modal first instead of calling connect
		if (hasOTP || profile.otp_required) {
			showOTP = true;
			return;
		}

		connecting = true;
		try {
			const result = await connect(profile.name);
			if (result.otpRequired) {
				showOTP = true;
			} else if (result.status.status === 'connected') {
				toast.success(`Connected to ${profile.name}`);
			}
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Connection failed');
		} finally {
			connecting = false;
			onStatusChange?.();
		}
	}

	async function handleDisconnect() {
		try {
			await disconnect(profile.name);
			toast.success(`Disconnected from ${profile.name}`);
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Disconnect failed');
		}
		onStatusChange?.();
	}

	async function handleOTPSubmit(token: string) {
		const result = await submitOTP(profile.name, token);
		showOTP = false;
		if (result.status === 'connected') {
			toast.success(`Connected to ${profile.name}`);
		} else if (result.status === 'failed') {
			toast.error(result.error_message ?? 'Connection failed');
		}
		onStatusChange?.();
	}

	function handleOTPCancel() {
		showOTP = false;
		// Optionally disconnect if we were waiting for OTP
		if (status?.status === 'waiting_for_otp') {
			disconnect(profile.name).catch(() => {});
		}
	}
</script>

<div class="rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md dark:bg-gray-800">
	<a href="/vpn/{profile.name}" class="block">
		<div class="mb-3 flex items-start justify-between">
			<div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
					{profile.name}
				</h3>
				<p class="text-sm text-gray-500 dark:text-gray-400">{profile.provider}</p>
			</div>
			<div class="flex items-center gap-2">
				{#if isConnected && status?.health}
					<HealthIndicator health={status.health} />
				{/if}
				<StatusBadge status={connectionStatus} />
			</div>
		</div>

		<div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
			<div class="flex items-center gap-1" title="{routeCount} routes configured">
				<Route class="h-4 w-4" />
				<span>{routeCount}</span>
			</div>

			{#if hasOTP}
				<div class="flex items-center gap-1 text-orange-500" title="OTP required">
					<Key class="h-4 w-4" />
				</div>
			{/if}

			{#if hasSchedule}
				<div class="flex items-center gap-1 text-blue-500" title="Scheduled: {scheduleInfo()}">
					<Calendar class="h-4 w-4" />
					<span class="text-xs">{scheduleInfo()}</span>
				</div>
			{/if}

			{#if status?.interface}
				<div class="flex items-center gap-1">
					<Network class="h-4 w-4" />
					<span>{status.interface}</span>
				</div>
			{/if}

			{#if isConnected && status?.started_at}
				<div class="flex items-center gap-1">
					<Clock class="h-4 w-4" />
					<span>{new Date(status.started_at).toLocaleTimeString()}</span>
				</div>
			{/if}

			{#if hasFailover}
				<div
					class="flex items-center gap-1 text-yellow-500"
					title="Failover to {status?.failover_profile}"
				>
					<AlertTriangle class="h-4 w-4" />
					<span class="text-xs">Failover</span>
				</div>
			{/if}
		</div>

		{#if status?.error_message}
			<p class="mt-2 text-sm text-red-600 dark:text-red-400">{status.error_message}</p>
		{/if}

		{#if !profile.enabled}
			<p class="mt-2 text-sm italic text-gray-500 dark:text-gray-400">Disabled</p>
		{/if}
	</a>

	<!-- Connect/Disconnect Button -->
	<div class="mt-4 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-700">
		<ConnectButton
			{status}
			onConnect={handleConnect}
			onDisconnect={handleDisconnect}
			disabled={connecting || !profile.enabled}
			size="sm"
		/>
	</div>
</div>

<OTPModal
	vpnName={profile.name}
	open={showOTP}
	onSubmit={handleOTPSubmit}
	onCancel={handleOTPCancel}
/>
