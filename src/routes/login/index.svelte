<script lang="ts">
	import { browser } from '$app/env';
	import { Magic } from 'magic-sdk';
	import { OAuthExtension } from '@magic-ext/oauth';
	import MaskInput from 'svelte-input-mask/MaskInput.svelte';
	import { verifyDIDT, verifyCallbackUrl } from '$lib/verify';
	import { goto } from '$app/navigation';
	import MethodIcons from '$lib/methodIcons.svelte';
	import MdArrowForward from 'svelte-icons/md/MdArrowForward.svelte';
	import MdClose from 'svelte-icons/md/MdClose.svelte';

	const magic =
		browser &&
		new Magic(import.meta.env['VITE_MAGIC_PUBLIC'] as string, {
			extensions: [new OAuthExtension()]
		});

	let state: 'loading' | 'awaitingMagic' | 'prev' | 'reauth' | 'login' = 'login',
		email = '',
		areacode = '+1',
		phone = '',
		phoneMode = false,
		lastSignIn: { method: 'phone' | 'email' | 'google'; value?: string; date: number } = null,
		prefetchedDidt: { didt: string; expires: number } = null;

	const init = async () => {
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
			state = 'awaitingMagic';
			try {
				const loggedIn = await magic.user.isLoggedIn();
				if (!loggedIn) {
					state = 'reauth';
					return;
				}
				prefetchedDidt = {
					didt: await magic.user.getIdToken(),
					expires: Date.now() + 1000 * 60 * 10
				};
				state = 'prev';
			} catch (e) {
				console.log(e);
				state = 'login';
			}
		}
		magic.preload();
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
			JSON.stringify({ method: 'email', value: email, date: Date.now() })
		);
		verifyDIDT(didt);
	};
	const loginWithPhone = async () => {
		state = 'loading';
		const didt = await magic.auth.loginWithSMS({
			phoneNumber: '+' + areacode.replace(/\D/g, '') + phone.replace(/\D/g, '')
		});
		localStorage.setItem(
			'last',
			JSON.stringify({
				method: 'phone',
				value: '+' + areacode.replace(/\D/g, '') + phone.replace(/\D/g, ''),
				date: Date.now()
			})
		);
		verifyDIDT(didt);
	};
	const loginWithGoogle = async () => {
		localStorage.setItem('callback', location.search);
		state = 'loading';
		await magic.oauth.loginWithRedirect({
			provider: 'google',
			redirectURI: window.location.origin + '/login/callback'
		});
	};
	const usePrev = async () => {
		state = 'loading';
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

<h1 class="text-center font-semibold text-2xl">Simple Authentication</h1>

{#if state === 'loading'}
	<div class="m-4 flex justify-center">
		<div
			style="border-top-color:transparent"
			class="w-16 h-16 border-4 border-black border-solid rounded-full animate-spin"
		/>
	</div>
{:else if state === 'reauth' || state === 'prev' || state === 'awaitingMagic'}
	<h2 class="text-center text-lg">Continue with Previous</h2>
	<div class="flex justify-center">
		<button
			class="grid place-items-center rounded-full h-10 w-10 mr-0  border-black hover:border-white hover:text-white hover:bg-black bg-white text-black"
			on:click={async () => {
				if (state === 'prev') {
					state = 'loading';
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
			class="text-center text-lg m-1 mr-1 border-solid border-2 p-1 px-4 rounded-full border-black h-full inline-flex justify-center"
		>
			<div class="flex-grow inline-grid place-items-center mr-2">
				<MethodIcons method={lastSignIn.method} size={20} />
			</div>
			<span>{lastSignIn.value}</span>
		</div>
		<button
			disabled={state === 'awaitingMagic'}
			class="grid place-items-center rounded-full h-10 w-10 ml-0 text-lg border-black hover:border-white hover:text-white hover:bg-black bg-white text-black disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
			on:click={() => (state === 'reauth' ? useReauth() : usePrev())}
		>
			<div style="width: 20px; height: 20px;">
				<MdArrowForward />
			</div>
		</button>
	</div>
{:else if state === 'login'}
	<h2 class="text-center text-lg">Login or Sign Up</h2>
	<form
		class="flex justify-center flex-row"
		on:submit={() => (phoneMode ? loginWithPhone() : loginWithEmail())}
	>
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
			<input
				class="inline-block"
				type="email"
				name="email"
				placeholder="Email"
				bind:value={email}
			/>
		{/if}
		<button
			class="grid place-items-center rounded-full h-10 w-10 m-1 ml-0 text-center text-lg  bg-white text-black border-black hover:border-white hover:text-white hover:bg-black"
			on:click={() => (phoneMode ? loginWithPhone() : loginWithEmail())}
		>
			<div style="width: 20px; height: 20px;">
				<MdArrowForward />
			</div>
		</button>
	</form>
{/if}
{#if state !== 'loading'}
	<div class={`grid ${state === 'login' ? 'grid-cols-2' : 'grid-cols-3'} m-0`}>
		{#if phoneMode || state !== 'login'}
			<button
				class="h-10 m-0.5"
				on:click={async () => {
					if (state === 'prev') {
						magic.user.logout();
						localStorage.removeItem('last');
					}
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
					state = 'login';
					phoneMode = true;
				}}
				><div class="h-full grid place-items-center">
					<MethodIcons method="phone" noStyle={true} addClass="w-5 hover:text-white" />
				</div></button
			>
		{/if}
		<button
			class="h-10 m-0.5"
			on:click={async () => {
				if (state === 'prev') {
					magic.user.logout();
					localStorage.removeItem('last');
				}
				loginWithGoogle();
			}}
			><div class="h-full grid place-items-center">
				<MethodIcons method="google" noStyle={true} addClass="w-5 hover:text-white" />
			</div></button
		>
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
