import 'dotenv/config';
import { Contract, providers } from 'ethers';
import { EventMessage } from '../types';
import StreamrClient from 'streamr-client';
import { config } from './config';

const rpcUrl = process.env.RPC_URL ?? 'https://polygon.llamarpc.com';
const contractAddress =
	process.env.CONTRACT_ADDRESS ?? '0x365Bdc64E2aDb50E43E56a53B7Cc438d48D0f0DD';

const contractAbi = [
	'event Approval(address indexed owner, address indexed spender, uint value)',
	'event Transfer(address indexed from, address indexed to, uint value)',
];

const STREAM_ID = `/${process.env.STREAM_ID || 'lsan-events'}`;

// Validation output stream can be found at https://streamr.network/hub/streams/0xeb21022d952e5de09c30bfda9e6352ffa95f67be%2Ftopics/overview
// Transfer 0.000000000000000001 LSAN to demonstrate

async function main() {
	const provider = new providers.JsonRpcProvider(rpcUrl);
	const chainId = (await provider.getNetwork()).chainId.toString();
	const contract = new Contract(contractAddress, contractAbi, provider);

	const client = new StreamrClient(config);

	const stream = await client.getStream(STREAM_ID);

	const publishEventLog = async (log: providers.Log) => {
		const message: EventMessage = {
			__logStoreChainId: chainId,
			__logStoreChannelId: 'evm-validate',
			address: log.address,
			blockHash: log.blockHash,
			data: log.data,
			logIndex: log.logIndex,
			topics: log.topics,
			transactionHash: log.transactionHash,
		};

		console.log('Publishing contract event message:');
		console.log(message);

		await stream.publish(message);
	};

	await contract.on('Approval', async (...args: Array<any>) => {
		const log = args[args.length - 1];
		await publishEventLog(log);
	});

	await contract.on('Transfer', async (...args: Array<any>) => {
		const log = args[args.length - 1];
		await publishEventLog(log);
	});

	console.log('Listening for contract events...');
}

main();
