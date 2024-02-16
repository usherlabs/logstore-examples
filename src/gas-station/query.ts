import { LogStoreClient } from '@logsn/client';
import * as fs from 'fs';
import os from 'os';
import { ethers } from 'ethers';
import { StreamrClient } from 'streamr-client';

const homeDir = os.homedir();
const { privateKey } = JSON.parse(
	// we're getting the private key from the cli configuration, we could get from .env
	fs.readFileSync(`${homeDir}/.logstore-cli/default.json`, 'utf8')
);

// we instantiate our client using this private key
const client = new StreamrClient({
	auth: {
		privateKey: privateKey,
	},
});

const lsClient = new LogStoreClient(client);

const main = async () => {
	// assuming we want every stream that starts with this prefix
	const gasStationPrefix =
		'0xd37dc4d7e2c1bdf3edd89db0e505394ea69af43d/gas-station/';

	// we use the client to search for streams under the same prefix
	const streamsIterable = client.searchStreams(gasStationPrefix, undefined);

	// we create an empty list to store the stream ids
	const streamList = [];

	// we iterate over the streams
	for await (const stream of streamsIterable) {
		console.log('stream found!', stream.id);
		streamList.push(stream.id);
	}

	for (const streamId of streamList) {
		// we query the last message of each stream
		const response = await lsClient.query(streamId, { last: 1 });

		for await (const event of response) {
			// @ts-ignore - just for demonstration purposes, we won't maintain a type for this
			const llamaRpcData = event.content.data.find((e) => e.source === 'llama');

			if (!llamaRpcData) {
				continue;
			}

			const fastInGwei = ethers.utils.formatUnits(
				llamaRpcData.fast.maxFee,
				'gwei'
			);

			const networkName = streamId.split('/').slice(-1)[0];

			console.log(
				`Fast fee on ${networkName} at block ${llamaRpcData.blockNumber} is ${fastInGwei} gwei`
			);
		}

		// if you want some real time data, you can subscribe to the stream
		const subscription = await client.subscribe(streamId, (content) => {
			// @ts-ignore - just for demonstration purposes, we won't maintain a type for this
			const llamaRpcData = content.data.find((e) => e.source === 'llama');

			if (!llamaRpcData) {
				subscription.unsubscribe();
				return;
			}

			const fastInGwei = ethers.utils.formatUnits(
				llamaRpcData.fast.maxFee,
				'gwei'
			);

			const networkName = streamId.split('/').slice(-1)[0];

			console.log(`REAL TIME:
             Fast fee on ${networkName} at block ${llamaRpcData.blockNumber} is ${fastInGwei} gwei`);
		});
	}
};

main();
