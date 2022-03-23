import type { RequestHandler } from '@sveltejs/kit';
import { verifyCB, verifyToken } from '$lib/verify';
import { Magic } from '@magic-sdk/admin';
import 'dotenv/config';
import njwt, { type JSONMap } from 'njwt';
const { Jwt, verify } = njwt;
import jwkToPem from 'jwk-to-pem';
import cookie from 'cookie';

const privateKey = jwkToPem(JSON.parse(process.env['PRIVATE_KEY']), { private: true });
const publicKey = jwkToPem(JSON.parse(process.env['PRIVATE_KEY']), { private: false });

const m = new Magic(process.env['MAGIC_PRIVATE']);

export const post: RequestHandler<'', { message: string } | { redirect: string }> = async ({
	request
}) => {
	const json: { didt: string; cb?: string; token?: string; accessToken?: string } =
		await request.json();
	const googleId = cookie.parse(request.headers.get('cookie') || '').googleId;

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
		let gID = null,
			storeGID = false;
		if (metadata.oauthProvider === 'google') {
			if (!(json.accessToken || googleId)) {
				return {
					status: 400,
					body: {
						message: 'Google oauth login needs an access token or a cookie with verified google id!'
					}
				};
			}
			if (json.accessToken) {
				gID = await verifyGoogleToken(json.accessToken);
				if (!gID) {
					return {
						status: 400,
						body: {
							message: 'Failed to get google id using access token!'
						}
					};
				}
				storeGID = true;
			} else {
				gID = verifyGId(googleId, metadata.issuer);
				if (!gID) {
					return {
						status: 400,
						body: {
							message: 'Failed to get google id using cookie!'
						}
					};
				}
			}
		}
		const token = new Jwt(metadata as unknown as JSONMap, true)
			.setSigningAlgorithm('RS256')
			.setSigningKey(privateKey)
			.compact();

		const res = {
			status: 200,
			body: { redirect: `${json.cb}?jwt=${token}` },
			headers: {}
		};
		if (storeGID) {
			res.headers = {
				'set-cookie': cookie.serialize('googleId', signGId(gID, metadata.issuer), {
					maxAge: Date.now() + 604800000 // 1 week
				})
			};
		}
		return res;
	} catch (err) {
		console.log(err);
		return {
			status: 500,
			body: { message: 'Server had an issue while validating DIDToken or signing.' }
		};
	}
};

const verifyGoogleToken = async (accessToken: string): Promise<string | null> => {
	try {
		const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo/', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});
		if (res.status === 200) {
			const json = await res.json();
			return json.id;
		} else {
			console.log(res.status, ': ', res.text);
			return null;
		}
	} catch (err) {
		console.log(err);
		return null;
	}
};

const signGId = (gid: string, iss: string): string => {
	return new Jwt({ gid, iss }, false)
		.setSigningAlgorithm('RS256')
		.setSigningKey(privateKey)
		.compact();
};
const verifyGId = (gid: string, iss: string): string => {
	try {
		const jwt = verify(gid, publicKey, 'RS256');
		if (jwt.body['iss'] === iss) {
			return jwt.body['gid'];
		} else {
			console.log(`${iss} does not match stored ${jwt.body}!`);
			return null;
		}
	} catch (e) {
		console.log(e);
		return null;
	}
};
