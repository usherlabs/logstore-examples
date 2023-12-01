import LogStoreClient, { CONFIG_TEST } from "@logsn/client";
import "dotenv/config";
import {
  // Contract,
  providers
} from "ethers";
import { EventMessage } from "./types";

const devMode = process.env.DEV_MODE ?? false;
const rpcUrl = process.env.RPC_URL ?? "https://polygon.llamarpc.com";
const privateKey = process.env.PRIVATE_KEY!;
// const contractAddress = process.env.CONTRACT_ADDRESS ?? "0x365Bdc64E2aDb50E43E56a53B7Cc438d48D0f0DD";

// const contractAbi = [
//   "event Approval(address indexed owner, address indexed spender, uint value)",
//   "event Transfer(address indexed from, address indexed to, uint value)",
// ];

const STREAM_ID = `/${process.env.STREAMR_ID || 'lsan-events'}`;

// Validation output stream can be found at https://streamr.network/hub/streams/0xeb21022d952e5de09c30bfda9e6352ffa95f67be%2Ftopics/overview
// Transfer 0.000000000000000001 LSAN to demonstrate

async function main() {
  const provider = new providers.JsonRpcProvider(rpcUrl);
  // const chainId = (await provider.getNetwork()).chainId.toString();
  // const contract = new Contract(contractAddress, contractAbi, provider);

  const config = devMode ? CONFIG_TEST : {};
  config.auth = { privateKey };

  const logStoreClient = new LogStoreClient(config);

  const stream = await logStoreClient.getStream(STREAM_ID);

  const publishEventLog = async () => {
    const message: EventMessage = {
      __logStoreChainId: '137',
      __logStoreChannelId: 'evm-validate',
      address: '0x365Bdc64E2aDb50E43E56a53B7Cc438d48D0f0DD',
      blockHash: '0xed6afdb35db598ee08623a9564a5fab3a6e64fea6718c380e7c7342911a4d1a4',
      data: '0x0000000000000000000000000000000000000000000000000000000000000001',
      logIndex: 372,
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000aeefa929280b17c81803727dcfb62c5fad511f31',
        '0x000000000000000000000000c6d330e5b7deb31824b837aa77771178bd8e6713'
      ],
      transactionHash: '0x4b4b1b1b3c89ac7833926e410c7d39f976fc7e47125d1326d715846f7acf06ef'
    }

    console.log("Publishing contract event message:");
    console.log(message);

    await stream.publish(message);
  }

  // await contract.on("Approval", async (...args: Array<any>) => {
  //   const log = args[args.length - 1];
  //   await publishEventLog(log);
  // });

  // await contract.on("Transfer", async (...args: Array<any>) => {
  //   const log = args[args.length - 1];
  //   await publishEventLog(log);
  // });

  console.log("Publishing a sample event...");

  await publishEventLog();
}

main();
