// jshint esversion: 8
import adapter from '@sveltejs/adapter-netlify';
import preprocess from 'svelte-preprocess';
import 'dotenv/config';
import pkg from 'node-jose';
const { JWK } = pkg;

const getConfig = async () => {
	const __PRIVATE_KEY_PEM__ = JSON.stringify(
		(await JWK.asKey(JSON.parse(process.env.KEY_PAIR), 'json')).toPEM(true)
	);

	const __PUBLIC_KEY_PEM__ = JSON.stringify(
		(await JWK.asKey(JSON.parse(process.env.KEY_PAIR), 'json')).toPEM()
	);

	const __PUBLIC_KEY_JWK__ = JSON.stringify(
		JSON.stringify((await JWK.asKey(JSON.parse(process.env.KEY_PAIR), 'json')).toJSON())
	);

	/** @type {import('@sveltejs/kit').Config} */
	return {
		preprocess: [
			preprocess({
				postcss: true
			})
		],
		kit: {
			prerender: { default: true },
			adapter: adapter({ split: true }),
			vite: {
				define: {
					__PRIVATE_KEY_PEM__,
					__PUBLIC_KEY_PEM__,
					__PUBLIC_KEY_JWK__,
					__MAGIC_PRIVATE__: JSON.stringify(process.env.MAGIC_PRIVATE)
				}
			}
		}
	};
};
export default await getConfig();
