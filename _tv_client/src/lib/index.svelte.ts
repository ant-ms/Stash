import { PersistedState } from 'runed';

export const vars = new (class Vars {
	instanceURL = new PersistedState('instanceURL', 'http://10.42.0.1:3069');
	apiKey = new PersistedState('apiKey', null as null | string);
})();

export const query = async (endpoint: string, d: object): Promise<any> => {
	return await fetch(`${vars.instanceURL.current}/api/rpc?session=${vars.apiKey.current}`, {
		method: 'POST',
		body: JSON.stringify({
			endpoint,
			d
		}),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${vars.apiKey.current}`
		}
	}).then(async (res) => {
		if (!res.ok) throw new Error('Failed to fetch');
		const response = await res.text();
		if (!response) return null;
		return JSON.parse(response);
	});
};
