import { goto } from '$app/navigation';

export const verifyDIDT = async (didt: string, accessToken?: string) => {
	try {
		const search =
			window.location.pathname === '/login/callback'
				? localStorage.getItem('callback')
				: window.location.search;
		localStorage.removeItem('callback');
		const rawRes = await fetch('/api/sign', {
			body: JSON.stringify({
				didt,
				cb: getQueryVariable(search, 'cb'),
				accessToken: accessToken ?? undefined
			}),
			method: 'POST'
		});
		try {
			const res = await rawRes.json();
			if (rawRes.status === 200) {
				goto(res.redirect);
			} else {
				alert(
					`An error occurred! Please try again. Status Code: ${rawRes.status} Message: ${res.message}`
				);
				location.reload();
			}
		} catch (err) {
			console.log(err);
			alert(`An error occurred! Please try again. Status Code: ${rawRes.status}`);
			location.reload();
		}
	} catch (e) {
		console.log(e);
		alert(`An error occurred! Please try again. Error: ${e}`);
		location.reload();
	}
};
export const verifyCallbackUrl = (query: string): boolean => {
	const cb = getQueryVariable(query, 'cb');
	if (cb) {
		return verifyCB(cb);
	}
	return false;
};

export const verifyCB = (cb: string): boolean => {
	return /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/.test(
		cb
	);
};

function getQueryVariable(query: string, variable: string): string {
	if (query[0] == '?') {
		query = query.substring(1);
	}
	const vars = query.split('&');
	for (let i = 0; i < vars.length; i++) {
		const pair = vars[i].split('=');
		if (decodeURIComponent(pair[0]) == variable) {
			return decodeURIComponent(pair[1]);
		}
	}
}
