<script lang="ts">
	import { X, Upload, FileText, AlertCircle } from 'lucide-svelte';
	import { api } from '$lib/api';

	interface Props {
		open: boolean;
		onClose: () => void;
		onImport: (data: ImportPreview) => void;
	}

	interface ImportPreview {
		provider: string;
		detected: boolean;
		name?: string;
		otp_required?: boolean;
		openfortivpn?: {
			host?: string;
			port?: number;
			username?: string;
			trusted_cert?: string;
		};
		openvpn?: {
			remote?: string;
			port?: number;
			proto?: string;
			dev?: string;
			cipher?: string;
			auth?: string;
			has_ca?: boolean;
			has_cert?: boolean;
			has_key?: boolean;
			has_tls_auth?: boolean;
			tls_auth_direction?: number;
			ca?: string;
			cert?: string;
			key?: string;
			tls_auth?: string;
		};
	}

	let { open, onClose, onImport }: Props = $props();

	let content = $state('');
	let provider = $state<'auto' | 'openfortivpn' | 'openvpn'>('auto');
	let profileName = $state('');
	let preview = $state<ImportPreview | null>(null);
	let error = $state('');
	let loading = $state(false);

	async function handlePreview() {
		if (!content.trim()) {
			error = 'Please paste or upload a config file';
			return;
		}

		error = '';
		loading = true;
		preview = null;

		try {
			const response = await api.post('/vpns/import/preview', {
				content: content,
				provider: provider === 'auto' ? '' : provider,
				name: profileName
			});
			preview = response as ImportPreview;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to parse config';
		} finally {
			loading = false;
		}
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			content = e.target?.result as string;
			// Auto-detect provider from file extension
			if (file.name.endsWith('.ovpn') || file.name.endsWith('.conf')) {
				provider = 'openvpn';
			}
			// Auto-set profile name from filename
			if (!profileName) {
				profileName = file.name.replace(/\.(ovpn|conf)$/, '');
			}
		};
		reader.readAsText(file);
	}

	function handleImportClick() {
		if (preview) {
			onImport(preview);
			resetForm();
		}
	}

	function resetForm() {
		content = '';
		provider = 'auto';
		profileName = '';
		preview = null;
		error = '';
	}

	function handleClose() {
		resetForm();
		onClose();
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onclick={handleClose}>
		<div
			class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold">Import VPN Profile</h2>
				<button onclick={handleClose} class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
					<X class="h-5 w-5" />
				</button>
			</div>

			{#if !preview}
				<!-- Import form -->
				<div class="space-y-4">
					<div>
						<label class="mb-1 block text-sm font-medium">Profile Name (optional)</label>
						<input
							bind:value={profileName}
							type="text"
							placeholder="my-vpn"
							class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium">Provider</label>
						<select
							bind:value={provider}
							class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
						>
							<option value="auto">Auto-detect</option>
							<option value="openfortivpn">openfortivpn</option>
							<option value="openvpn">OpenVPN</option>
						</select>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium">Config Content</label>
						<div class="mb-2">
							<label
								class="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
							>
								<Upload class="h-4 w-4" />
								Upload File
								<input
									type="file"
									accept=".conf,.ovpn,.txt"
									class="hidden"
									onchange={handleFileUpload}
								/>
							</label>
						</div>
						<textarea
							bind:value={content}
							placeholder="Paste your openfortivpn or OpenVPN config here..."
							rows="10"
							class="w-full rounded-lg border p-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
						></textarea>
					</div>

					{#if error}
						<div
							class="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400"
						>
							<AlertCircle class="h-5 w-5" />
							{error}
						</div>
					{/if}

					<div class="flex justify-end gap-2">
						<button
							onclick={handleClose}
							class="rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							Cancel
						</button>
						<button
							onclick={handlePreview}
							disabled={loading || !content.trim()}
							class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
						>
							{loading ? 'Parsing...' : 'Preview'}
						</button>
					</div>
				</div>
			{:else}
				<!-- Preview -->
				<div class="space-y-4">
					<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
						<div class="mb-2 flex items-center gap-2">
							<FileText class="h-5 w-5 text-blue-600" />
							<span class="font-medium">Detected Configuration</span>
							{#if preview.detected}
								<span class="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
									Auto-detected
								</span>
							{/if}
						</div>

						<dl class="grid grid-cols-2 gap-2 text-sm">
							<dt class="text-gray-500">Provider</dt>
							<dd class="font-mono">{preview.provider}</dd>

							{#if preview.otp_required}
								<dt class="text-gray-500">OTP Required</dt>
								<dd class="text-orange-600">Yes</dd>
							{/if}

							{#if preview.openfortivpn}
								{#if preview.openfortivpn.host}
									<dt class="text-gray-500">Host</dt>
									<dd class="font-mono">{preview.openfortivpn.host}</dd>
								{/if}
								{#if preview.openfortivpn.port}
									<dt class="text-gray-500">Port</dt>
									<dd class="font-mono">{preview.openfortivpn.port}</dd>
								{/if}
								{#if preview.openfortivpn.username}
									<dt class="text-gray-500">Username</dt>
									<dd class="font-mono">{preview.openfortivpn.username}</dd>
								{/if}
								{#if preview.openfortivpn.trusted_cert}
									<dt class="text-gray-500">Trusted Cert</dt>
									<dd class="truncate font-mono" title={preview.openfortivpn.trusted_cert}>
										{preview.openfortivpn.trusted_cert.slice(0, 20)}...
									</dd>
								{/if}
							{/if}

							{#if preview.openvpn}
								{#if preview.openvpn.remote}
									<dt class="text-gray-500">Remote</dt>
									<dd class="font-mono">{preview.openvpn.remote}</dd>
								{/if}
								{#if preview.openvpn.port}
									<dt class="text-gray-500">Port</dt>
									<dd class="font-mono">{preview.openvpn.port}</dd>
								{/if}
								{#if preview.openvpn.proto}
									<dt class="text-gray-500">Protocol</dt>
									<dd class="font-mono">{preview.openvpn.proto}</dd>
								{/if}
								{#if preview.openvpn.dev}
									<dt class="text-gray-500">Device</dt>
									<dd class="font-mono">{preview.openvpn.dev}</dd>
								{/if}
								{#if preview.openvpn.cipher}
									<dt class="text-gray-500">Cipher</dt>
									<dd class="font-mono">{preview.openvpn.cipher}</dd>
								{/if}
								<dt class="text-gray-500">Certificates</dt>
								<dd class="flex gap-1">
									<span
										class="rounded px-1.5 py-0.5 text-xs {preview.openvpn.has_ca
											? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
											: 'bg-gray-100 text-gray-500 dark:bg-gray-600'}"
									>
										CA
									</span>
									<span
										class="rounded px-1.5 py-0.5 text-xs {preview.openvpn.has_cert
											? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
											: 'bg-gray-100 text-gray-500 dark:bg-gray-600'}"
									>
										Cert
									</span>
									<span
										class="rounded px-1.5 py-0.5 text-xs {preview.openvpn.has_key
											? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
											: 'bg-gray-100 text-gray-500 dark:bg-gray-600'}"
									>
										Key
									</span>
									{#if preview.openvpn.has_tls_auth}
										<span
											class="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
										>
											TLS-Auth
										</span>
									{/if}
								</dd>
							{/if}
						</dl>
					</div>

					<p class="text-sm text-gray-500">
						Click "Create Profile" to continue. You'll be able to add routes, DNS entries, and
						other settings on the edit page.
					</p>

					<div class="flex justify-end gap-2">
						<button
							onclick={() => (preview = null)}
							class="rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							Back
						</button>
						<button
							onclick={handleImportClick}
							class="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
						>
							Create Profile
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
