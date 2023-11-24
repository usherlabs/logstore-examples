import LogStoreClient, { CONFIG_TEST } from "@logsn/client";
import "dotenv/config";
import { Contract, ContractEventPayload, EventLog, JsonRpcProvider } from "ethers";

const devMode = process.env.DEV_MODE ?? false;
const rpcUrl = process.env.RPC_URL ?? "https://polygon.llamarpc.com";
const privateKey = process.env.PRIVATE_KEY!;
const contractAddress = process.env.CONTRACT_ADDRESS ?? "0x365Bdc64E2aDb50E43E56a53B7Cc438d48D0f0DD";

const contractAbi = [
  "event Approval(address indexed owner, address indexed spender, uint value)",
  "event Transfer(address indexed from, address indexed to, uint value)",
];

const STREAM_ID = '/lsan-events';

async function main() {
  const provider = new JsonRpcProvider(rpcUrl);
  const chainId = (await provider.getNetwork()).chainId.toString();
  const contract = new Contract(contractAddress, contractAbi, provider);

  const config = devMode ? CONFIG_TEST : {};
  config.auth = { privateKey };

  const logStoreClient = new LogStoreClient(config);

  const stream = await logStoreClient.getStream(STREAM_ID);

  const publishEventLog = async (log: EventLog) => {
    const message = {
      logStoreChainId: chainId,
      logStoreChannelId: "evm-validate",
      address: log.address,
      blockHash: log.blockHash,
      data: log.data,
      index: log.index,
      topics: log.topics,
      transactionHash: log.transactionHash,
    };

    console.log("Publishing contract event message:");
    console.log(message);

    await stream.publish(message);
  }

  await contract.on("Approval", async (...args: Array<any>) => {
    const { log } = args[args.length - 1] as ContractEventPayload;
    await publishEventLog(log);
  });

  await contract.on("Transfer", async (...args: Array<any>) => {
    const { log } = args[args.length - 1] as ContractEventPayload;
    await publishEventLog(log);
  });

  console.log("Listening for contract events...");
}

main();
