<script lang="ts">
	import Skeleton from './Skeleton.svelte';
</script>

<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
	<div class="mb-3 flex items-start justify-between">
		<div>
			<Skeleton width="120px" height="1.5rem" class="mb-2" />
			<Skeleton width="80px" height="1rem" />
		</div>
		<Skeleton width="100px" height="1.5rem" />
	</div>
	<div class="flex gap-4">
		<Skeleton width="60px" height="1rem" />
		<Skeleton width="60px" height="1rem" />
	</div>
</div>
