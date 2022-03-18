<script>
	import '../app.pcss';
	import Background from '$lib/background.svelte';
</script>

<svelte:head>
	<title>Simple Authentication</title>
</svelte:head>

<div id="content" class="w-full h-full">
	<div class="w-full h-full grid place-items-center">
		<div class="bg-white p-4 m-6 rounded-lg max-w-lg">
			<slot />
		</div>
	</div>
	<Background />
</div>
