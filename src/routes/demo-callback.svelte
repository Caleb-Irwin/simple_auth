<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	export const load: Load = function ({ url }) {
		return { props: { jwt: url.searchParams.get('jwt') } };
	};
</script>

<script lang="ts">
	export let jwt: string;
</script>

<div class="top-0 left-0 absolute w-full h-full grid place-items-center">
	<div class="w-4/5 h-4/5 p-2 bg-white rounded-lg pb-20">
		<h1 class="text-3xl mt-1 text-center font-bold">View JSON Web Token</h1>
		<p class="text-lg mb-1 text-center underline"><a href="/">Home</a></p>
		<iframe
			class="w-full h-full"
			title="jwt viewer"
			src={`https://jwt.io/#debugger-io?token=${jwt}&publicKey=${
				import.meta.env['VITE_PUBLIC_KEY']
			}`}
			frameborder="0"
		/>
	</div>
</div>
