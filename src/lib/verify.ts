export const verifyDIDT = async (didt: string) => {
	console.log(didt);
	console.log('TO BE IMPLEMENTED');
};
export const verifyCallbackUrl = (query: string): boolean => {
	const cb = getQueryVariable(query, 'cb');
	if (cb) {
		return /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/.test(
			cb
		);
	}
	const token = getQueryVariable(query, 'token');
	console.log('TODO');
	return false;
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
