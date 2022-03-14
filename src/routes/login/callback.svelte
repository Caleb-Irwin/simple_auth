<script lang="ts">
	import { Magic } from 'magic-sdk';
	import { OAuthExtension } from '@magic-ext/oauth';
	import { browser } from '$app/env';
	import { verifyDIDT } from '$lib/verify';

	const init = async () => {
		const magic = new Magic(import.meta.env['VITE_MAGIC_PUBLIC'] as string, {
			extensions: [new OAuthExtension()]
		});

		const result = await magic.oauth.getRedirectResult();
		localStorage.setItem(
			'last',
			JSON.stringify({ method: 'google', value: result.magic.userMetadata.email, date: Date.now() })
		);
		verifyDIDT(result.magic.idToken);
	};
	if (browser) init();
</script>

<div class="m-4 flex justify-center">
	<div
		style="border-top-color:transparent"
		class="w-16 h-16 border-4 border-black border-solid rounded-full animate-spin"
	/>
</div>
