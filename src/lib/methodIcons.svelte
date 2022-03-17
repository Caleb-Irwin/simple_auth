<script lang="ts">
	import FaGoogle from 'svelte-icons/fa/FaGoogle.svelte';
	import MdEmail from 'svelte-icons/md/MdEmail.svelte';
	import MdSmartphone from 'svelte-icons/md/MdSmartphone.svelte';

	export let method: 'email' | 'phone' | 'google',
		size = 32,
		color = 'black',
		noStyle = false,
		addClass = '';
</script>

<div
	style={noStyle ? '' : `width: ${size}px; height: ${size}px; color: ${color};`}
	class={addClass}
>
	{#if method === 'email'}
		<MdEmail />
	{:else if method === 'phone'}
		<MdSmartphone />
	{:else if method === 'google'}
		<FaGoogle />
	{/if}
</div>
