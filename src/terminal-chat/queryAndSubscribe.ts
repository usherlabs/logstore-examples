import 'dotenv/config';

import { LogStoreClient } from '@logsn/client';
import os from 'os';
import * as fs from 'fs';
import { StreamrClient } from 'streamr-client';
import { StreamId } from '../config';

// getting privateKey from the cli configuration, we could get from .env
const homeDir = os.homedir();
const { privateKey } = JSON.parse(
	fs.readFileSync(`${homeDir}/.logstore-cli/default.json`, 'utf8')
);

// we instantiate our client using this private key
const client = new StreamrClient({
	auth: {
		privateKey: privateKey,
	},
});

const lsClient = new LogStoreClient(client);

const streamIdOrPath = `/${StreamId || `logstore-demo`}`;

async function main() {
	console.log('Querying stream for last 2 messages...');
	const response = await lsClient
		.query(streamIdOrPath, { last: 2 })
		.catch((err) => {
			console.log(err);
			process.exit(1);
		});

	for await (const event of response) {
		console.log(event.content);
	}

	const stream = await client.getStream(streamIdOrPath);

	console.log('');
	console.log('Subscribing to stream...');
	await client.subscribe(stream, (event) => {
		console.log('Stream event:', event);
	});
}

// Call the main function
main();

// exit on 'ctrl + c'
process.on('SIGINT', async function () {
	lsClient.destroy();
	await client.destroy();
	process.exit(0);
});
