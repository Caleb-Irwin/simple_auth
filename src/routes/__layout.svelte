<script>
	import '../app.pcss';
	import Background from '$lib/background.svelte';
</script>

<svelte:head>
	<title>Simple Authentication</title>
</svelte:head>

<div id="content" class="w-full h-full flex flex-col">
	<div class="w-full flex-grow grid place-items-center">
		<div class="bg-white p-4 m-6 rounded-lg max-w-lg">
			<slot />
		</div>
	</div>
	<div class="text-center text-black bg-[#ffffff40] flex justify-center p-1">
		<span class="mx-1.5">
			Made by <a
				class="underline"
				href="https://calebirwin.ca"
				target="_blank"
				rel="noopener noreferrer">Caleb Irwin</a
			>
		</span>
		<span class="mx-1.5">
			Secured by
			<a class="underline" href="https://magic.link" target="_blank" rel="noopener noreferrer"
				>Magic</a
			>
		</span>
		<span class="mx-1.5">
			<a class="underline" href="/">About</a>
		</span>
		<span class="mx-1.5">
			<a class="underline" href="/admin/">Admin</a>
		</span>
	</div>
</div>
<Background />
