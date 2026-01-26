<script lang="ts">
	interface Props {
		variant?: 'text' | 'circular' | 'rectangular';
		width?: string;
		height?: string;
		class?: string;
	}

	let {
		variant = 'text',
		width = '100%',
		height = '1rem',
		class: className = ''
	}: Props = $props();

	const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-700';
	const variantClasses = {
		text: 'rounded',
		circular: 'rounded-full',
		rectangular: 'rounded-lg'
	};
</script>

<div
	class="{baseClass} {variantClasses[variant]} {className}"
	style="width: {width}; height: {height}"
></div>
