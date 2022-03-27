<script>
	import { browser } from '$app/env';
	import IoMdArrowDropdown from 'svelte-icons/io/IoMdArrowDropdown.svelte';
	import IoMdArrowDropup from 'svelte-icons/io/IoMdArrowDropup.svelte';
	import FaRegClipboard from 'svelte-icons/fa/FaRegClipboard.svelte';
	import ClipboardJs from 'clipboard';

	let dropDownOpen = false;
	let pemMode = false;
	const pemKey = __PUBLIC_KEY_PEM__;
	const jwtKey = __PUBLIC_KEY_JWK__;
	if (browser) new ClipboardJs('#clipboard');
</script>

<h1 class="text-3xl mb-2 text-center">Simple Authentication</h1>
<p class="text-center">
	A simple authenication service powered by <a
		class="underline"
		href="https://magic.link"
		target="_blank"
		rel="noopener noreferrer">magic.link</a
	>
</p>
<div class="grid grid-cols-2 mt-2">
	<a
		class="text-center text-lg m-1 bg-black p-1 text-white rounded-md border-solid border-2 hover:border-black"
		href={'/login?cb=' + (browser && location.origin) + '/demo-callback'}>Demo</a
	>
	<a
		class="text-center text-lg m-1 bg-black p-1 text-white rounded-md border-solid border-2 hover:border-black"
		href="http://github.com/Caleb-Irwin/simple_auth/"
		target="_blank"
		rel="noopener noreferrer">Github</a
	>
</div>
<div
	on:click={() => {
		dropDownOpen = !dropDownOpen;
	}}
	class="text-center flex justify-center underline hover:cursor-pointer"
>
	<span>Encryption Infomation </span>
	<div class="inline-block h-6 w-6">
		{#if dropDownOpen}<IoMdArrowDropup />{:else}<IoMdArrowDropdown />{/if}
	</div>
</div>
{#if dropDownOpen}
	<div class="bg-black text-white rounded-lg p-4">
		<p class="text-center text-lg">Public Key</p>
		<div class="flex justify-center">
			<button
				id="clipboard"
				data-clipboard-target="#code-public-key"
				class="grid place-items-center mx-0 h-12 w-12 bg-gray-800 text-center rounded-full hover:cursor-pointer"
				><div class="w-5 m-0 p-0"><FaRegClipboard /></div></button
			>
			<button
				class="bg-gray-800 text-center p-2 rounded-full hover:cursor-pointer"
				on:click={() => {
					pemMode = !pemMode;
				}}
			>
				<span class={pemMode ? '' : 'p-0.5 px-2 rounded-full bg-white text-gray-800'}>JWK</span>
				<span class={pemMode ? 'p-0.5 px-2 rounded-full bg-white text-gray-800' : ''}>PEM</span>
			</button>
		</div>
		<code class="inline-block max-w-xl break-words" id="code-public-key">
			{@html pemMode ? pemKey.replace(/\n/g, '<br/>') : jwtKey}</code
		>
	</div>
{/if}
