<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { useToast } from '$lib/stores/toast.svelte';
	import ProfileForm from '$lib/components/ProfileForm.svelte';
	import type { VPNProfile } from '$lib/types';
	import { ArrowLeft } from 'lucide-svelte';

	const toast = useToast();
	let saving = $state(false);

	async function handleSave(profile: Partial<VPNProfile>) {
		saving = true;
		try {
			await api.post('/vpns', profile);
			toast.success(`Created profile: ${profile.name}`);
			goto(`/vpn/${profile.name}`);
		} catch (err: unknown) {
			const apiError = err as { message?: string };
			toast.error(apiError.message ?? 'Failed to create profile');
		} finally {
			saving = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/" class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700" title="Back">
			<ArrowLeft class="h-5 w-5" />
		</a>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create VPN Profile</h1>
	</div>

	<ProfileForm onSave={handleSave} {saving} />
</div>
