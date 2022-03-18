import type { RequestHandler } from '@sveltejs/kit';
import { verifyCB, verifyToken } from '$lib/verify';
import { Magic } from '@magic-sdk/admin';
import 'dotenv/config';
import njwt, { type JSONMap } from 'njwt';
const { Jwt } = njwt;
import jwkToPem from 'jwk-to-pem';

const privateKey = jwkToPem(JSON.parse(process.env['PRIVATE_KEY']), { private: true });

const m = new Magic(process.env['MAGIC_PRIVATE']);

export const post: RequestHandler<'', { message: string } | { redirect: string }> = async ({
	request
}) => {
	const json: { didt: string; cb?: string; token?: string } = await request.json();
	if (typeof json.didt !== 'string') {
		return {
			status: 400,
			body: {
				message: 'DIDT not provided!'
			}
		};
	}
	if (typeof json.cb !== 'string' && typeof json.token !== 'string') {
		return {
			status: 400,
			body: { message: 'No callback or token provided!' }
		};
	}
	if (json.token && !verifyToken(json.token)) {
		return {
			status: 400,
			body: { message: 'Invalid Token provided.' }
		};
	} else if (!verifyCB(json.cb)) {
		return {
			status: 400,
			body: { message: 'Invalid Callback provided.' }
		};
	}
	try {
		const metadata = await m.users.getMetadataByToken(json.didt);

		const token = new Jwt(metadata as unknown as JSONMap, true)
			.setSigningAlgorithm('RS256')
			.setSigningKey(privateKey)
			.compact();

		return {
			status: 200,
			body: { redirect: `${json.cb}?jwt=${token}` }
		};
	} catch (err) {
		console.log(err);
		return {
			status: 500,
			body: { message: 'Server had an issue while validating DIDToken or signing.' }
		};
	}
};
