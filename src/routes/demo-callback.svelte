<script context="module" lang="ts">
	export const prerender = false;
	import type { Load } from '@sveltejs/kit';
	export const load: Load = function ({ url }) {
		return { props: { jwt: url.searchParams.get('jwt') } };
	};
	const publicKey = __PUBLIC_KEY_JWK__;
</script>

<script lang="ts">
	export let jwt: string;
</script>

<div class="max-w-4xl max-h-min m-5 pb-16" style="width:80vw; height: 80vh">
	<h1 class="text-3xl mt-1 text-center font-bold">View JSON Web Token</h1>
	<p class="text-lg mb-1 text-center underline"><a href="/">Home</a></p>
	<iframe
		class="w-full h-full max-h-"
		title="jwt viewer"
		src={`https://jwt.io/#debugger-io?token=${jwt}&publicKey=${publicKey}`}
		frameborder="0"
	/>
</div>
