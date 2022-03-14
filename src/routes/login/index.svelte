<script lang="ts">
	import { browser } from '$app/env';
	import { Magic, type MagicUserMetadata } from 'magic-sdk';
	import MaskInput from 'svelte-input-mask/MaskInput.svelte';

	const magic = browser && new Magic(import.meta.env['VITE_MAGIC_PUBLIC'] as string);

	let state: 'loading' | 'awaitingMagic' | 'prev' | 'reauth' | 'login' = 'login',
		email = '',
		areacode = '+1',
		phone = '',
		phoneMode = false,
		lastSignIn: { method: 'phone' | 'email' | 'google'; value?: string; data: number } = null;

	const init = async () => {
		const lastStr = localStorage.getItem('last');
		if (lastStr !== null) {
			lastSignIn = JSON.parse(lastStr);
			state = 'awaitingMagic';
			try {
				const loggedIn = await magic.user.isLoggedIn();
				if (!loggedIn) {
					state = 'reauth';
					return;
				}
				state = 'prev';
			} catch (e) {
				console.log(e);
				state = 'login';
			}
		}
	};
	if (browser) init();
	const handleChange = ({ detail }) => {
		phone = detail.inputState.maskedValue;
		console.log('+' + areacode.replace(/\D/g, '') + phone.replace(/\D/g, ''));
	};
	const loginWithEmail = async () => {
		state = 'loading';
		const didt = await magic.auth.loginWithMagicLink({ email });
		localStorage.setItem(
			'last',
			JSON.stringify({ method: 'email', value: email, data: Date.now() })
		);
		verify(didt);
	};
	const loginWithPhone = async () => {
		state = 'loading';
		const didt = await magic.auth.loginWithSMS({
			phoneNumber: '+' + areacode.replace(/\D/g, '') + phone.replace(/\D/g, '')
		});
		localStorage.setItem(
			'last',
			JSON.stringify({ method: 'phone', value: phone, data: Date.now() })
		);
		verify(didt);
	};
	const loginWithGoogle = async () => {};
	const usePrev = async () => {
		state = 'loading';
		try {
			let didt = await magic.user.getIdToken();
			verify(didt);
		} catch (e) {
			console.log(e);
			useReauth();
		}
	};
	const useReauth = async () => {};
	const verify = async (didt: string) => {
		console.log(didt);
		console.log('TO BE IMPLEMENTED');
	};
</script>

<h1 class="text-center font-semibold text-2xl">Simple Auth</h1>

{#if state === 'loading'}
	<div class="m-4 flex justify-center">
		<div
			style="border-top-color:transparent"
			class="w-16 h-16 border-4 border-black border-solid rounded-full animate-spin"
		/>
	</div>
{:else if state === 'reauth' || state === 'prev' || state === 'awaitingMagic'}
	<h2 class="text-center text-lg">Previous</h2>
	<div class="flex justify-center">
		<button
			class="rounded-full h-10 w-10 ml-0 text-center bg-white text-red-500 border-red-500 hover:bg-red-200 hover:border-white"
			on:click={async () => {
				if (state === 'prev') {
					state = 'loading';
					await magic.user.logout();
					localStorage.removeItem('last');
				}
				state = 'login';
			}}>×</button
		>
		<span
			class="text-center text-lg m-1 mr-1 border-solid border-2 p-1 px-4 rounded-full border-black"
		>
			{(lastSignIn.method === 'google' ? lastSignIn.method : '') + lastSignIn.value}
		</span>
		<button
			disabled={state === 'awaitingMagic'}
			class="rounded-full h-10 w-10 ml-0 text-center border-black hover:border-white disabled:bg-gray-800 disabled:border-gray-800 disabled:cursor-not-allowed"
			on:click={() => (state === 'reauth' ? useReauth() : usePrev())}>→</button
		>
	</div>
	<p class="text-center">Or</p>
	<div class="grid grid-cols-1 m-0">
		<button
			class="m-0.5"
			on:click={async () => {
				if (state === 'prev') {
					await magic.user.logout();
					localStorage.removeItem('last');
				}
				state = 'login';
				phoneMode = false;
			}}>Email</button
		>
		<button
			class="m-0.5"
			on:click={async () => {
				if (state === 'prev') {
					await magic.user.logout();
					localStorage.removeItem('last');
				}
				state = 'login';
				phoneMode = true;
			}}>Phone</button
		>
		<button
			class="m-0.5"
			on:click={async () => {
				if (state === 'prev') {
					await magic.user.logout();
					localStorage.removeItem('last');
				}
				loginWithGoogle();
			}}>Google</button
		>
	</div>
{:else if state === 'login'}
	<h2 class="text-center text-lg">Login or Sign Up</h2>
	<form on:submit={() => (phoneMode ? loginWithPhone() : loginWithEmail())}>
		{#if phoneMode}
			<input type="text" size="2" class="px-0.5 mx-0" bind:value={areacode} />
			<MaskInput
				alwaysShowMask
				mask="(000) 000 - 0000"
				size={12}
				showMask
				maskChar="_"
				on:change={handleChange}
			/>
		{:else}
			<input type="email" name="email" placeholder="Email" bind:value={email} />
		{/if}
		<button
			class="rounded-full h-10 w-10 ml-0 text-center"
			on:click={() => (phoneMode ? loginWithPhone() : loginWithEmail())}>→</button
		>
	</form>
	<div class="grid grid-cols-2">
		{#if phoneMode}
			<button on:click={() => (phoneMode = false)}>Email</button>
		{:else}
			<button on:click={() => (phoneMode = true)}>Phone</button>
		{/if}
		<button on:click={loginWithGoogle}>Google</button>
	</div>
{/if}

<p class="text-center">
	Powered by <a
		class="underline"
		href="https://magic.link"
		target="_blank"
		rel="noopener noreferrer">magic.link</a
	>
</p>
