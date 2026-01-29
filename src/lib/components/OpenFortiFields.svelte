<script lang="ts">
	interface Props {
		config: {
			host: string;
			port: number;
			username: string;
			password: string;
			trusted_cert: string;
		};
		errors: Record<string, string>;
	}

	let { config = $bindable(), errors }: Props = $props();
</script>

<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
	<h2 class="mb-4 text-lg font-semibold">openfortivpn Configuration</h2>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div>
			<label for="forti-host" class="mb-1 block text-sm font-medium">Host</label>
			<input
				id="forti-host"
				bind:value={config.host}
				type="text"
				placeholder="vpn.example.com"
				class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
				class:border-red-500={errors.host}
			/>
			{#if errors.host}
				<p class="mt-1 text-sm text-red-500">{errors.host}</p>
			{/if}
		</div>

		<div>
			<label for="forti-port" class="mb-1 block text-sm font-medium">Port</label>
			<input
				id="forti-port"
				bind:value={config.port}
				type="number"
				min="1"
				max="65535"
				class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
			/>
		</div>

		<div>
			<label for="forti-username" class="mb-1 block text-sm font-medium">Username</label>
			<input
				id="forti-username"
				bind:value={config.username}
				type="text"
				placeholder="user@domain"
				class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
			/>
		</div>

		<div>
			<label for="forti-password" class="mb-1 block text-sm font-medium">Password</label>
			<input
				id="forti-password"
				bind:value={config.password}
				type="password"
				placeholder="••••••••"
				class="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
			/>
			<p class="mt-1 text-xs text-gray-500">Use ${'{'}ENV_VAR{'}'} for environment variables</p>
		</div>

		<div class="md:col-span-2">
			<label for="forti-trusted-cert" class="mb-1 block text-sm font-medium"
				>Trusted Certificate</label
			>
			<input
				id="forti-trusted-cert"
				bind:value={config.trusted_cert}
				type="text"
				placeholder="SHA256 fingerprint"
				class="w-full rounded-lg border p-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
			/>
		</div>
	</div>
</div>
