/**
 * ? Note that the LogStoreClient is not even necessary for Storing Data to the Log Store Network!
 */

import 'dotenv/config';
import 'disposablestack/auto';
import { StreamrClient } from 'streamr-client';
import utils from './utils';
import { PrivateKey, StreamId } from '../config';
import LogStoreClient from '@logsn/client';

const main = async () => {
	return new Promise(async (resolve, reject) => {
		try {
			utils.isValidPrivateKey(PrivateKey);
			// Create the client using the validated private key
			const client = new StreamrClient({
				logLevel: 'error',
				auth: {
					privateKey: PrivateKey,
				},
			});
			const lsClient = new LogStoreClient(client);

			// Here we cleanup the streamr connections
			await using cleanup = new AsyncDisposableStack();
			cleanup.defer(async () => {
				lsClient.destroy();
				await client.destroy();
			});

			// Create the default stream
			const stream = await client.getOrCreateStream({
				id: `/${StreamId || `logstore-demo`}`,
			});

			const isStore = await lsClient.isLogStoreStream(stream.id);
			if (!isStore) {
				console.log(
					`Stream is not registered in Log Store Netowrk. Use LogStore CLI to register a store. -- logstore store stake ${stream.id} 0.01 -u`
				);
				return;
			}

			const interval = setInterval(async () => {
				const message = {
					type: 'client:publish',
					ts: Date.now(),
				};
				await client.publish(stream, message);
				console.log('Sent successfully: ', message);
				resolve({ client, interval });
			}, 1000);
		} catch (e) {
			reject(e);
		}
	});
};

main();
