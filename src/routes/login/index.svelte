<script lang="ts">
	import { browser } from '$app/env';
	import { Magic, RPCErrorCode } from 'magic-sdk';
	import { OAuthExtension } from '@magic-ext/oauth';
	import MaskInput from 'svelte-input-mask/MaskInput.svelte';
	import { verifyDIDT, verifyCallbackUrl } from '$lib/verify';
	import { goto } from '$app/navigation';
	import MethodIcons from '$lib/methodIcons.svelte';
	import MdArrowForward from 'svelte-icons/md/MdArrowForward.svelte';
	import MdClose from 'svelte-icons/md/MdClose.svelte';
	import IoMdLock from 'svelte-icons/io/IoMdLock.svelte';
	import { onMount } from 'svelte';

	type Method = 'phone' | 'email' | 'google';
	const magic =
		browser &&
		new Magic(import.meta.env['VITE_MAGIC_PUBLIC'] as string, {
			extensions: [new OAuthExtension()]
		});

	let state: 'prev' | 'reauth' | 'login' = 'login',
		email = '',
		areacode = '+1',
		phone = '',
		phoneMode = false,
		loading = false,
		loadingGoogle = false,
		lastSignIn: { method: Method; value?: string; date: number } = null,
		prefetchedDidt: { didt: string; expires: number } = null,
		awaitingInitailization = false,
		loginOnInit = false;

	onMount(async () => {
		if (!verifyCallbackUrl(location.search)) {
			goto('/login/invalid' + location.search, { replaceState: true });
		}
		const lastStr = localStorage.getItem('last');
		if (lastStr !== null) {
			lastSignIn = JSON.parse(lastStr);
			if (lastSignIn.date + 1000 * 60 * 60 * 24 * 7 < Date.now()) {
				console.log('expired');
				state = 'reauth';
				return;
			}
			awaitingInitailization = true;
			state = 'prev';
			try {
				const loggedIn = await magic.user.isLoggedIn();
				if (!awaitingInitailization) return;
				if (!loggedIn) {
					state = 'reauth';
					awaitingInitailization = false;
					if (loginOnInit) useReauth();
					return;
				}
				if (!awaitingInitailization) return;
				prefetchedDidt = {
					didt: await magic.user.getIdToken(),
					expires: Date.now() + 1000 * 60 * 10
				};
				if (!awaitingInitailization) return;
				awaitingInitailization = false;
				if (loginOnInit) usePrev();
			} catch (e) {
				console.log(e);
				awaitingInitailization = false;
				state = 'login';
			}
		}
		magic.preload();
	});
	const submit = () => {
		if (state === 'login') phoneMode ? loginWithPhone() : loginWithEmail();
		else state === 'reauth' ? useReauth() : usePrev();
		return false;
	};
	const handleChange = ({ detail }) => {
		phone = detail.inputState.maskedValue;
		console.log('+' + areacode.replace(/\D/g, '') + phone.replace(/\D/g, ''));
	};
	const loginWithEmail = async () => login('email');
	const loginWithPhone = async () => login('phone');
	const loginWithGoogle = async () => {
		localStorage.setItem('callback', location.search);
		loading = true;
		loadingGoogle = true;
		await magic.oauth.loginWithRedirect({
			provider: 'google',
			redirectURI: window.location.origin + '/login/callback'
		});
	};
	const login = async (method: Method) => {
		try {
			if (method === 'google') {
				return loginWithGoogle();
			}
			loading = true;
			const value =
				method === 'email' ? email : '+' + areacode.replace(/\D/g, '') + phone.replace(/\D/g, '');
			const didt =
				method === 'email'
					? await magic.auth.loginWithMagicLink({ email: value })
					: await magic.auth.loginWithSMS({
							phoneNumber: value
					  });
			localStorage.setItem('last', JSON.stringify({ method, value, date: Date.now() }));
			verifyDIDT(didt);
		} catch (e) {
			if (method === 'email' && e.code === RPCErrorCode.UserRequestEditEmail) {
				loading = false;
			} else {
				alert(`We couldn't log you in. Please try again. (Error message: ${e.message})`);
				location.reload();
			}
		}
	};
	const usePrev = async () => {
		loading = true;
		if (awaitingInitailization) {
			loginOnInit = true;
			return;
		}
		try {
			let didt =
				prefetchedDidt.expires > Date.now() ? prefetchedDidt.didt : await magic.user.getIdToken();
			verifyDIDT(didt);
		} catch (e) {
			console.log(e);
			useReauth();
		}
	};
	const useReauth = async () => {
		if (lastSignIn.method === 'phone') {
			phone = lastSignIn.value.slice(lastSignIn.value.length - 10);
			areacode = lastSignIn.value.slice(0, lastSignIn.value.length - 10);
			loginWithPhone();
		} else if (lastSignIn.method === 'email') {
			email = lastSignIn.value;
			loginWithEmail();
		} else if (lastSignIn.method === 'google') {
			loginWithGoogle();
		}
	};
</script>

<div class="flex w-full justify-center items-center">
	<div class="w-8 h-8 inline-block mr-1"><IoMdLock /></div>
	<h1 class="text-center font-semibold text-2xl inline-block">Simple Authentication</h1>
</div>

<h2 class="text-center text-lg">
	{state === 'login' ? 'Login or Sign Up' : 'Continue With Previous'}
</h2>

<form class="flex justify-center flex-row" on:submit|preventDefault={submit}>
	{#if state !== 'login'}
		<button
			class="grid place-items-center rounded-full h-10 w-10 mr-0  border-black hover:border-white hover:text-white hover:bg-black bg-white text-black"
			on:click={async () => {
				if (state === 'prev') {
					magic.user.logout();
					localStorage.removeItem('last');
				}
				state = 'login';
			}}
		>
			<div style="width: 20px; height: 20px;">
				<MdClose />
			</div>
		</button>
		<div
			class="flex-grow text-center text-lg m-1 mr-1 border-solid border-2 p-1 px-4 rounded-full border-black h-full inline-flex justify-center"
		>
			<div class="flex-grow inline-grid place-items-center mr-2">
				<MethodIcons method={lastSignIn.method} size={20} />
			</div>
			<span>{lastSignIn.value}</span>
		</div>
	{:else if phoneMode}
		<input type="text" size="1" class="px-0.5 w-10 mx-0.5" bind:value={areacode} />
		<MaskInput
			alwaysShowMask
			mask="(000) 000 - 0000"
			size={12}
			showMask
			maskChar="_"
			class="flex-grow"
			on:change={handleChange}
		/>
	{:else}
		<input
			class="inline-block flex-grow ml-0.5"
			type="email"
			name="email"
			placeholder="Email"
			bind:value={email}
		/>
	{/if}
	<button
		disabled={loading}
		class="flex items-center justify-center rounded-full h-10 w-10 ml-0 text-lg border-black hover:border-white hover:text-white hover:bg-black bg-white text-black disabled:bg-white disabled:cursor-not-allowed"
	>
		<div class="w-5 h-5">
			{#if !loading || loadingGoogle}
				<MdArrowForward />
			{:else}
				<div
					style="border-top-color:transparent"
					class="w-5 h-5 border-2 border-black border-solid rounded-full animate-spin"
				/>
			{/if}
		</div>
	</button>
</form>
<div class={`grid ${state === 'login' ? 'grid-cols-2' : 'grid-cols-3'} m-0`}>
	{#if phoneMode || state !== 'login'}
		<button
			class="h-10 m-0.5"
			on:click={async () => {
				if (state === 'prev') {
					magic.user.logout();
					localStorage.removeItem('last');
				}
				awaitingInitailization = false;
				state = 'login';
				phoneMode = false;
			}}
		>
			<div class="h-full grid place-items-center">
				<MethodIcons method="email" noStyle={true} addClass="w-5 hover:text-white" />
			</div>
		</button>
	{/if}
	{#if !phoneMode || state !== 'login'}
		<button
			class="h-10 m-0.5"
			on:click={async () => {
				if (state === 'prev') {
					magic.user.logout();
					localStorage.removeItem('last');
				}
				awaitingInitailization = false;
				state = 'login';
				phoneMode = true;
			}}
			><div class="h-full grid place-items-center">
				<MethodIcons method="phone" noStyle={true} addClass="w-5 hover:text-white" />
			</div></button
		>
	{/if}
	<button
		class={`h-10 m-0.5 ${loadingGoogle ? 'hover:bg-white hover:border-gray-500' : ''}`}
		on:click={async () => {
			if (state === 'prev') {
				magic.user.logout();
				localStorage.removeItem('last');
			}
			awaitingInitailization = false;
			loginWithGoogle();
		}}
	>
		<div class="h-full grid place-items-center">
			{#if loadingGoogle}
				<div
					style="border-top-color:transparent"
					class="w-5 h-5 border-2 border-black border-solid rounded-full animate-spin"
				/>
			{:else}
				<MethodIcons method="google" noStyle={true} addClass="w-5 hover:text-white" />
			{/if}
		</div></button
	>
</div>
