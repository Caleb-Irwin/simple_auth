<script>
	import '../app.pcss';
	import Background from '$lib/background.svelte';
</script>

<svelte:head>
	<title>Simple Authentication</title>
</svelte:head>

<div id="content" class="w-full h-full flex flex-col">
	<div class="w-full flex-grow grid place-items-center">
		<div class="bg-white p-3 m-2 rounded-lg max-w-full">
			<slot />
		</div>
	</div>
	<div class="text-center text-black bg-[#ffffff40] flex justify-center p-1 text-sm lg:text-base">
		<div class="inline-flex items-center">
			<span class="mx-1.5">
				Made by <a
					class="underline"
					href="https://calebirwin.ca"
					target="_blank"
					rel="noopener noreferrer">Caleb Irwin</a
				>
			</span>
		</div>
		<div class="inline-flex items-center">
			<span class="mx-1.5">
				Secured by
				<a class="underline" href="https://magic.link" target="_blank" rel="noopener noreferrer"
					>Magic</a
				>
			</span>
		</div>
		<div class="inline-flex items-center">
			<span class="mx-1.5">
				<a
					class="underline"
					href="http://github.com/Caleb-Irwin/simple_auth/"
					target="_blank"
					rel="noopener noreferrer">Github</a
				>
			</span>
		</div>
		<div class="inline-flex items-center">
			<span class="mx-1.5">
				<a class="underline" href="/">About</a>
			</span>
		</div>
	</div>
</div>
<Background />
