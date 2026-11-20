// Checks the built node: run `npm run build` first.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { LurkApi } = require('../dist/nodes/LurkApi/LurkApi.node.js');
const { LurkApiApi } = require('../dist/credentials/LurkApiApi.credentials.js');

const { properties } = new LurkApi().description;
const resources = properties.find((p) => p.name === 'resource').options.map((o) => o.value);
const operations = properties.filter((p) => p.name === 'operation');

test('every resource has its operations', () => {
	for (const r of resources.filter((r) => r !== 'custom')) {
		assert.ok(operations.some((o) => o.displayOptions.show.resource.includes(r)), r);
	}
});

test('every operation is a GET to a LurkAPI path, with unique ids', () => {
	const ids = new Set();
	for (const op of operations.flatMap((o) => o.options)) {
		assert.equal(op.routing.request.method, 'GET');
		assert.match(op.routing.request.url, /^\/v\d\//);
		assert.ok(!ids.has(op.value), `duplicate ${op.value}`);
		ids.add(op.value);
	}
	assert.ok(ids.size > 50, `only ${ids.size} operations`);
});

test('every field is sent as a query parameter for exactly one operation', () => {
	for (const p of properties.filter((p) => p.displayOptions?.show?.operation)) {
		assert.equal(p.displayOptions.show.operation.length, 1);
		const fields = p.type === 'collection' ? p.options : [p];
		for (const f of fields) assert.equal(f.routing.send.type, 'query', `${p.name}.${f.name}`);
	}
});

test('the credential sends x-api-key and tests on the free balance endpoint', () => {
	const cred = new LurkApiApi();
	assert.equal(cred.authenticate.properties.headers['x-api-key'], '={{$credentials.apiKey}}');
	assert.equal(cred.test.request.url, '/v1/account/credit-balance');
});
