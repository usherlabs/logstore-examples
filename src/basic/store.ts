/**
 * ? Note that the LogStoreClient is not even necessary for Storing Data to the Log Store Network!
 */

import 'dotenv/config';
import StreamrClient from 'streamr-client';
import utils from './utils';
import { PrivateKey, StreamId } from './config';

const main = async () => {
	return new Promise(async (resolve, reject) => {
		try {
			utils.isValidPrivateKey(PrivateKey);
			// Create the client using the validated private key
			const client = new StreamrClient({
				auth: {
					privateKey: PrivateKey,
				},
			});

			// Create the default stream
			const stream = await client.getStream(`/${StreamId || `logstore-demo`}`);

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
