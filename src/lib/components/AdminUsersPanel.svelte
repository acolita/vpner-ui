<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { useToast } from '$lib/stores/toast.svelte';
	import { Users, Plus, Pencil, Trash2, Key, Shield, Network } from 'lucide-svelte';
	import type { AdminUser, CreateAdminUserRequest, UpdateAdminUserRequest } from '$lib/types';
	import ConfirmModal from './ConfirmModal.svelte';

	const toast = useToast();

	let users = $state<AdminUser[]>([]);
	let loading = $state(true);
	let availableVPNs = $state<string[]>([]);

	// Modal states
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let showPasswordModal = $state(false);
	let showDeleteModal = $state(false);
	let selectedUser = $state<AdminUser | null>(null);

	// Form states
	let createForm = $state<CreateAdminUserRequest>({
		username: '',
		password: '',
		roles: ['admin'],
		vpns: ['*']
	});

	let editForm = $state<UpdateAdminUserRequest>({
		username: '',
		roles: [],
		vpns: []
	});

	let passwordForm = $state({ password: '', confirm: '' });
	let formError = $state<string | null>(null);
	let saving = $state(false);

	onMount(async () => {
		await Promise.all([loadUsers(), loadVPNs()]);
	});

	async function loadUsers() {
		loading = true;
		try {
			users = await api.listAdminUsers();
		} catch (err: unknown) {
			const e = err as { message?: string };
			toast.error(e.message ?? 'Failed to load users');
		} finally {
			loading = false;
		}
	}

	async function loadVPNs() {
		try {
			const vpns = await api.get<{ name: string }[]>('/vpns');
			availableVPNs = vpns.map((v) => v.name);
		} catch {
			// Ignore - VPNs list is optional
		}
	}

	function openCreateModal() {
		createForm = { username: '', password: '', roles: ['admin'], vpns: ['*'] };
		formError = null;
		showCreateModal = true;
	}

	function openEditModal(user: AdminUser) {
		selectedUser = user;
		editForm = {
			username: user.username,
			roles: [...user.roles],
			vpns: [...user.vpns]
		};
		formError = null;
		showEditModal = true;
	}

	function openPasswordModal(user: AdminUser) {
		selectedUser = user;
		passwordForm = { password: '', confirm: '' };
		formError = null;
		showPasswordModal = true;
	}

	function openDeleteModal(user: AdminUser) {
		selectedUser = user;
		showDeleteModal = true;
	}

	async function handleCreate() {
		if (!createForm.username.trim()) {
			formError = 'Username is required';
			return;
		}
		if (createForm.password.length < 8) {
			formError = 'Password must be at least 8 characters';
			return;
		}

		saving = true;
		formError = null;
		try {
			await api.createAdminUser(createForm);
			toast.success('User created');
			showCreateModal = false;
			await loadUsers();
		} catch (err: unknown) {
			const e = err as { message?: string };
			formError = e.message ?? 'Failed to create user';
		} finally {
			saving = false;
		}
	}

	async function handleEdit() {
		if (!selectedUser) return;
		if (!editForm.username?.trim()) {
			formError = 'Username is required';
			return;
		}

		saving = true;
		formError = null;
		try {
			await api.updateAdminUser(selectedUser.id, editForm);
			toast.success('User updated');
			showEditModal = false;
			await loadUsers();
		} catch (err: unknown) {
			const e = err as { message?: string };
			formError = e.message ?? 'Failed to update user';
		} finally {
			saving = false;
		}
	}

	async function handlePasswordChange() {
		if (!selectedUser) return;
		if (passwordForm.password.length < 8) {
			formError = 'Password must be at least 8 characters';
			return;
		}
		if (passwordForm.password !== passwordForm.confirm) {
			formError = 'Passwords do not match';
			return;
		}

		saving = true;
		formError = null;
		try {
			await api.changeAdminPassword(selectedUser.id, { password: passwordForm.password });
			toast.success('Password changed');
			showPasswordModal = false;
		} catch (err: unknown) {
			const e = err as { message?: string };
			formError = e.message ?? 'Failed to change password';
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		if (!selectedUser) return;

		saving = true;
		try {
			await api.deleteAdminUser(selectedUser.id);
			toast.success('User deleted');
			showDeleteModal = false;
			await loadUsers();
		} catch (err: unknown) {
			const e = err as { message?: string };
			toast.error(e.message ?? 'Failed to delete user');
		} finally {
			saving = false;
		}
	}

	function toggleRole(form: { roles?: string[] }, role: string) {
		if (!form.roles) form.roles = [];
		if (form.roles.includes(role)) {
			form.roles = form.roles.filter((r) => r !== role);
		} else {
			form.roles = [...form.roles, role];
		}
	}

	function toggleVPN(form: { vpns?: string[] }, vpn: string) {
		if (!form.vpns) form.vpns = [];
		if (vpn === '*') {
			form.vpns = form.vpns.includes('*') ? [] : ['*'];
		} else {
			// Remove wildcard when selecting specific VPNs
			form.vpns = form.vpns.filter((v) => v !== '*');
			if (form.vpns.includes(vpn)) {
				form.vpns = form.vpns.filter((v) => v !== vpn);
			} else {
				form.vpns = [...form.vpns, vpn];
			}
		}
	}

	function formatDate(dateStr: string | undefined): string {
		if (!dateStr) return 'Never';
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white">
			<Users class="h-5 w-5 text-blue-500" />
			Admin Users
		</h3>
		<button
			onclick={openCreateModal}
			class="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
		>
			<Plus class="h-4 w-4" />
			Add User
		</button>
	</div>

	{#if loading}
		<div class="animate-pulse space-y-2">
			<div class="h-10 rounded bg-gray-200 dark:bg-gray-700"></div>
			<div class="h-10 rounded bg-gray-200 dark:bg-gray-700"></div>
		</div>
	{:else if users.length === 0}
		<p class="text-sm text-gray-500 dark:text-gray-400">No admin users configured.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b dark:border-gray-700">
						<th class="py-2 text-left font-medium text-gray-600 dark:text-gray-400">Username</th>
						<th class="py-2 text-left font-medium text-gray-600 dark:text-gray-400">Roles</th>
						<th class="py-2 text-left font-medium text-gray-600 dark:text-gray-400">VPN Access</th>
						<th class="py-2 text-left font-medium text-gray-600 dark:text-gray-400">Last Login</th>
						<th class="py-2 text-right font-medium text-gray-600 dark:text-gray-400">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each users as user}
						<tr class="border-b dark:border-gray-700">
							<td class="py-2 font-medium text-gray-900 dark:text-white">{user.username}</td>
							<td class="py-2">
								<div class="flex flex-wrap gap-1">
									{#each user.roles as role}
										<span
											class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
										>
											{role}
										</span>
									{/each}
								</div>
							</td>
							<td class="py-2">
								{#if user.vpns.includes('*')}
									<span class="text-green-600 dark:text-green-400">All VPNs</span>
								{:else}
									<span class="text-gray-600 dark:text-gray-400">
										{user.vpns.length} VPN{user.vpns.length !== 1 ? 's' : ''}
									</span>
								{/if}
							</td>
							<td class="py-2 text-gray-600 dark:text-gray-400">
								{formatDate(user.last_login)}
							</td>
							<td class="py-2">
								<div class="flex justify-end gap-1">
									<button
										onclick={() => openEditModal(user)}
										class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
										title="Edit user"
									>
										<Pencil class="h-4 w-4 text-gray-500" />
									</button>
									<button
										onclick={() => openPasswordModal(user)}
										class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
										title="Change password"
									>
										<Key class="h-4 w-4 text-gray-500" />
									</button>
									<button
										onclick={() => openDeleteModal(user)}
										class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
										title="Delete user"
										disabled={users.length === 1}
									>
										<Trash2
											class="h-4 w-4 {users.length === 1
												? 'text-gray-300 dark:text-gray-600'
												: 'text-red-500'}"
										/>
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Create User Modal -->
{#if showCreateModal}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={() => (showCreateModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showCreateModal = false)}
		role="dialog"
		aria-modal="true"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Create Admin User</h2>

			{#if formError}
				<div class="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
					{formError}
				</div>
			{/if}

			<div class="space-y-4">
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
					<input
						type="text"
						bind:value={createForm.username}
						class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
						placeholder="admin"
					/>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
					<input
						type="password"
						bind:value={createForm.password}
						class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
						placeholder="Minimum 8 characters"
					/>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
						<Shield class="mr-1 inline h-4 w-4" />
						Roles
					</label>
					<div class="flex gap-2">
						<button
							onclick={() => toggleRole(createForm, 'admin')}
							class="rounded-lg border px-3 py-1 text-sm {createForm.roles?.includes('admin')
								? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
								: 'border-gray-300 dark:border-gray-600'}"
						>
							admin
						</button>
						<button
							onclick={() => toggleRole(createForm, 'viewer')}
							class="rounded-lg border px-3 py-1 text-sm {createForm.roles?.includes('viewer')
								? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
								: 'border-gray-300 dark:border-gray-600'}"
						>
							viewer
						</button>
					</div>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
						<Network class="mr-1 inline h-4 w-4" />
						VPN Access
					</label>
					<div class="flex flex-wrap gap-2">
						<button
							onclick={() => toggleVPN(createForm, '*')}
							class="rounded-lg border px-3 py-1 text-sm {createForm.vpns?.includes('*')
								? 'border-green-500 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
								: 'border-gray-300 dark:border-gray-600'}"
						>
							All VPNs
						</button>
						{#each availableVPNs as vpn}
							<button
								onclick={() => toggleVPN(createForm, vpn)}
								class="rounded-lg border px-3 py-1 text-sm {createForm.vpns?.includes(vpn)
									? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
									: 'border-gray-300 dark:border-gray-600'}"
							>
								{vpn}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<button
					onclick={() => (showCreateModal = false)}
					class="rounded-lg border px-4 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
				>
					Cancel
				</button>
				<button
					onclick={handleCreate}
					disabled={saving}
					class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{saving ? 'Creating...' : 'Create User'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Edit User Modal -->
{#if showEditModal && selectedUser}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={() => (showEditModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showEditModal = false)}
		role="dialog"
		aria-modal="true"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Edit User: {selectedUser.username}</h2>

			{#if formError}
				<div class="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
					{formError}
				</div>
			{/if}

			<div class="space-y-4">
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
					<input
						type="text"
						bind:value={editForm.username}
						class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
					/>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
						<Shield class="mr-1 inline h-4 w-4" />
						Roles
					</label>
					<div class="flex gap-2">
						<button
							onclick={() => toggleRole(editForm, 'admin')}
							class="rounded-lg border px-3 py-1 text-sm {editForm.roles?.includes('admin')
								? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
								: 'border-gray-300 dark:border-gray-600'}"
						>
							admin
						</button>
						<button
							onclick={() => toggleRole(editForm, 'viewer')}
							class="rounded-lg border px-3 py-1 text-sm {editForm.roles?.includes('viewer')
								? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
								: 'border-gray-300 dark:border-gray-600'}"
						>
							viewer
						</button>
					</div>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
						<Network class="mr-1 inline h-4 w-4" />
						VPN Access
					</label>
					<div class="flex flex-wrap gap-2">
						<button
							onclick={() => toggleVPN(editForm, '*')}
							class="rounded-lg border px-3 py-1 text-sm {editForm.vpns?.includes('*')
								? 'border-green-500 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
								: 'border-gray-300 dark:border-gray-600'}"
						>
							All VPNs
						</button>
						{#each availableVPNs as vpn}
							<button
								onclick={() => toggleVPN(editForm, vpn)}
								class="rounded-lg border px-3 py-1 text-sm {editForm.vpns?.includes(vpn)
									? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
									: 'border-gray-300 dark:border-gray-600'}"
							>
								{vpn}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<button
					onclick={() => (showEditModal = false)}
					class="rounded-lg border px-4 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
				>
					Cancel
				</button>
				<button
					onclick={handleEdit}
					disabled={saving}
					class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{saving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Change Password Modal -->
{#if showPasswordModal && selectedUser}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={() => (showPasswordModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showPasswordModal = false)}
		role="dialog"
		aria-modal="true"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
				Change Password: {selectedUser.username}
			</h2>

			{#if formError}
				<div class="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
					{formError}
				</div>
			{/if}

			<div class="space-y-4">
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
					<input
						type="password"
						bind:value={passwordForm.password}
						class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
						placeholder="Minimum 8 characters"
					/>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
					<input
						type="password"
						bind:value={passwordForm.confirm}
						class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
						placeholder="Repeat password"
					/>
				</div>
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<button
					onclick={() => (showPasswordModal = false)}
					class="rounded-lg border px-4 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
				>
					Cancel
				</button>
				<button
					onclick={handlePasswordChange}
					disabled={saving}
					class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{saving ? 'Changing...' : 'Change Password'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
<ConfirmModal
	open={showDeleteModal}
	title="Delete User"
	message="Are you sure you want to delete user '{selectedUser?.username}'? This action cannot be undone."
	confirmText="Delete"
	confirmClass="bg-red-600 hover:bg-red-700"
	onConfirm={handleDelete}
	onCancel={() => (showDeleteModal = false)}
/>
