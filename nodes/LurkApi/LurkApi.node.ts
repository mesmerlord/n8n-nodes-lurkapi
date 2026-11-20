import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { operationProperties, resourceProperty } from './operations.generated';

export class LurkApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LurkAPI',
		name: 'lurkApi',
		icon: { light: 'file:lurkapi.svg', dark: 'file:lurkapi.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] === "custom" ? $parameter["path"] : $parameter["operation"]}}',
		description:
			'Get public social media data as JSON: profiles, posts, comments, transcripts and ad libraries',
		defaults: {
			name: 'LurkAPI',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'lurkApiApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.lurkapi.com',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			resourceProperty,
			...operationProperties,
			{
				displayName: 'Path',
				name: 'path',
				type: 'string',
				required: true,
				default: '',
				placeholder: '/v1/tiktok/profile',
				description:
					'The endpoint path from https://lurkapi.com/docs. Every endpoint is a GET request.',
				displayOptions: { show: { resource: ['custom'] } },
				routing: {
					request: {
						method: 'GET',
						url: '={{ "/" + $value.replace(/^\\/+/, "") }}',
					},
				},
			},
			{
				displayName: 'Query Parameters',
				name: 'queryParameters',
				type: 'fixedCollection',
				placeholder: 'Add parameter',
				typeOptions: { multipleValues: true },
				default: {},
				displayOptions: { show: { resource: ['custom'] } },
				options: [
					{
						displayName: 'Parameter',
						name: 'parameter',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'handle',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								placeholder: 'nike',
								routing: {
									send: {
										type: 'query',
										property: '={{ $parent.name }}',
									},
								},
							},
						],
					},
				],
			},
		],
	};
}
