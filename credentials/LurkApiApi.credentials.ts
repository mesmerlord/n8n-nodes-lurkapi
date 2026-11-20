import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class LurkApiApi implements ICredentialType {
	name = 'lurkApiApi';

	displayName = 'LurkAPI API';

	icon: Icon = { light: 'file:lurkapi.svg', dark: 'file:lurkapi.dark.svg' };

	documentationUrl = 'https://github.com/mesmerlord/n8n-nodes-lurkapi?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Create a key on https://lurkapi.com/dashboard. It starts with lk_live_.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	// The balance endpoint is free, so testing the credential costs nothing.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.lurkapi.com',
			url: '/v1/account/credit-balance',
		},
	};
}
