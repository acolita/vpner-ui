<script lang="ts">
	interface Props {
		config: {
			remote: string;
			port: number;
			proto: string;
			dev: string;
			cipher: string;
			auth: string;
			ca: string;
			cert: string;
			key: string;
			config_path: string;
		};
		errors: Record<string, string>;
	}

	let { config = $bindable(), errors }: Props = $props();
</script>

<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
	<h2 class="mb-4 text-lg font-semibold">OpenVPN Configuration</h2>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div>
			<label for="ovpn-config-path" class="mb-1 block text-sm font-medium"
				>Config File (.ovpn)</label
			>
			<input
				id="ovpn-config-path"
				bind:value={config.config_path}
				type="text"
				placeholder="/etc/openvpn/client.ovpn"
				class="w-full rounded-lg border p-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
			/>
			<p class="mt-1 text-xs text-gray-500">Or specify individual fields below</p>
		</div>

		<div></div>

		<div>
			<label for="ovpn-remote" class="mb-1 block text-sm font-medium">Remote Host</label>
			<input
				id="ovpn-remote"
				bind:value={config.remote}
				type="text"
				placeholder="vpn.example.com"
				class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
				class:border-red-500={errors.remote}
			/>
			{#if errors.remote}
				<p class="mt-1 text-sm text-red-500">{errors.remote}</p>
			{/if}
		</div>

		<div>
			<label for="ovpn-port" class="mb-1 block text-sm font-medium">Port</label>
			<input
				id="ovpn-port"
				bind:value={config.port}
				type="number"
				min="1"
				max="65535"
				class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
			/>
		</div>

		<div>
			<label for="ovpn-proto" class="mb-1 block text-sm font-medium">Protocol</label>
			<select
				id="ovpn-proto"
				bind:value={config.proto}
				class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
			>
				<option value="udp">UDP</option>
				<option value="tcp">TCP</option>
			</select>
		</div>

		<div>
			<label for="ovpn-dev" class="mb-1 block text-sm font-medium">Device Type</label>
			<select
				id="ovpn-dev"
				bind:value={config.dev}
				class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
			>
				<option value="tun">TUN (routed)</option>
				<option value="tap">TAP (bridged)</option>
			</select>
		</div>

		<div>
			<label for="ovpn-cipher" class="mb-1 block text-sm font-medium">Cipher</label>
			<input
				id="ovpn-cipher"
				bind:value={config.cipher}
				type="text"
				placeholder="AES-256-GCM"
				class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
			/>
		</div>

		<div>
			<label for="ovpn-auth" class="mb-1 block text-sm font-medium">Auth</label>
			<input
				id="ovpn-auth"
				bind:value={config.auth}
				type="text"
				placeholder="SHA256"
				class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
			/>
		</div>

		<div class="md:col-span-2">
			<label for="ovpn-ca" class="mb-1 block text-sm font-medium">CA Certificate</label>
			<textarea
				id="ovpn-ca"
				bind:value={config.ca}
				rows="4"
				placeholder="-----BEGIN CERTIFICATE-----"
				class="w-full rounded-lg border p-2 font-mono text-xs dark:border-gray-600 dark:bg-gray-700"
			></textarea>
		</div>

		<div class="md:col-span-2">
			<label for="ovpn-cert" class="mb-1 block text-sm font-medium">Client Certificate</label>
			<textarea
				id="ovpn-cert"
				bind:value={config.cert}
				rows="4"
				placeholder="-----BEGIN CERTIFICATE-----"
				class="w-full rounded-lg border p-2 font-mono text-xs dark:border-gray-600 dark:bg-gray-700"
			></textarea>
		</div>

		<div class="md:col-span-2">
			<label for="ovpn-key" class="mb-1 block text-sm font-medium">Client Key</label>
			<textarea
				id="ovpn-key"
				bind:value={config.key}
				rows="4"
				placeholder="-----BEGIN PRIVATE KEY-----"
				class="w-full rounded-lg border p-2 font-mono text-xs dark:border-gray-600 dark:bg-gray-700"
			></textarea>
		</div>
	</div>
</div>
