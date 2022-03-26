import adapter from '@sveltejs/adapter-netlify';
import preprocess from 'svelte-preprocess';
import 'dotenv/config';
import jwkToPem from 'jwk-to-pem';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true
		})
	],

	kit: {
		adapter: adapter({ split: true }),
		vite: {
			define: {
				__PRIVATE_KEY_PEM__: JSON.stringify(
					jwkToPem(JSON.parse(process.env['PRIVATE_KEY']), {
						private: true
					})
				),
				__PUBLIC_KEY_PEM__: JSON.stringify(
					jwkToPem(JSON.parse(process.env['PRIVATE_KEY']), {
						private: false
					})
				),
				__MAGIC_PRIVATE__: JSON.stringify(process.env['MAGIC_PRIVATE'])
			}
		}
	}
};

export default config;
