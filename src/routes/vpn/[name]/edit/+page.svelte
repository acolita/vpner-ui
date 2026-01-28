<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { useToast } from '$lib/stores/toast.svelte';
	import ProfileForm from '$lib/components/ProfileForm.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import { ArrowLeft, Loader2 } from 'lucide-svelte';
	import type { VPNProfile } from '$lib/types';

	const vpnName = $derived($page.params.name ?? '');
	const toast = useToast();

	let profile = $state<VPNProfile | null>(null);
	let profiles = $state<VPNProfile[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let showDeleteConfirm = $state(false);

	const availableProfiles = $derived(profiles.map((p) => p.name));

	onMount(async () => {
		try {
			const [p, allProfiles] = await Promise.all([
				api.get<VPNProfile>(`/vpns/${vpnName}`),
				api.get<VPNProfile[]>('/vpns')
			]);
			profile = p;
			profiles = allProfiles ?? [];
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Failed to load profile');
			goto('/');
		} finally {
			loading = false;
		}
	});

	async function handleSave(data: Partial<VPNProfile>) {
		saving = true;
		try {
			await api.put(`/vpns/${vpnName}`, data);
			toast.success('Profile saved');
			goto(`/vpn/${vpnName}`);
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Failed to save');
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		try {
			await api.delete(`/vpns/${vpnName}`);
			toast.success(`Deleted profile: ${vpnName}`);
			goto('/');
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Failed to delete');
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a
			href="/vpn/{vpnName}"
			class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
			title="Back"
		>
			<ArrowLeft class="h-5 w-5" />
		</a>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Edit {vpnName}</h1>
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-gray-400" />
		</div>
	{:else if profile}
		<ProfileForm
			{profile}
			{availableProfiles}
			onSave={handleSave}
			onDelete={() => (showDeleteConfirm = true)}
			{saving}
		/>
	{/if}

	<ConfirmModal
		open={showDeleteConfirm}
		title="Delete Profile"
		message="Are you sure you want to delete '{vpnName}'? This cannot be undone."
		confirmText="Delete"
		confirmClass="bg-red-600 hover:bg-red-700"
		onConfirm={handleDelete}
		onCancel={() => (showDeleteConfirm = false)}
	/>
</div>
