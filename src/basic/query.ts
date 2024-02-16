import 'dotenv/config';
import { LogStoreClient } from '@logsn/client';
import StreamrClient from 'streamr-client';
import utils from './utils';
import { PrivateKey, StreamId } from './config';

/**
 * ? Note: Remember to create and/or stake tokens on this stream for this example to work
 */

const main = async () => {
	utils.isValidPrivateKey(PrivateKey);
	// Create the client using the validated private key
	const client = new StreamrClient({
		auth: {
			privateKey: PrivateKey,
		},
	});

	const lsClient = new LogStoreClient(client);

	// Create the default stream
	const stream = await client.getOrCreateStream({
		id: `/${StreamId || `logstore-demo`}`,
	});
	// const stream = await client.getOrCreateStream({
	//   id: `0xa156eda7dcd689ac725ce9595d4505bf28256454/heartbeat`,
	// });

	await stream.publish({ id: 0 });
	await stream.publish({ id: 1 });
	await stream.publish({ id: 2 });

	// ensure that the stream is being stored!
	console.log('Stream fetched:', stream.id);

	await client.subscribe(
		{
			stream: stream.id,
			resend: {
				// should see the recently send messages, along with 3 identical ones from storage
				last: 6,
			},
		},
		(message) => {
			// Do something with the messages as they are received
			console.log(JSON.stringify(message));
		}
	);

	console.log('Subscribing to stream:', stream.id);

	await lsClient.query(
		stream.id,
		{
			// should see the recently send messages, along with 3 identical ones from storage
			last: 6,
		},
		(message) => {
			// Do something with the messages as they are received
			console.log(JSON.stringify(message));
		}
	);

	console.log('Queried stream from Log Store:', stream.id);
};

main();
