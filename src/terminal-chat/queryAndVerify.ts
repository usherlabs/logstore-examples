import { LogStoreClient } from "@logsn/client";
import os from "os";
import * as fs from "fs";

// getting privateKey from the cli configuration, we could get from .env
const homeDir = os.homedir();
const { privateKey } = JSON.parse(
  fs.readFileSync(`${homeDir}/.logstore-cli/default.json`, "utf8"),
);

// we instantiate our client using this private key
const client = new LogStoreClient({
  auth: {
    privateKey: privateKey,
  },
});

const streamIdOrPath = `0xd95083fbf72897f8a6607f27891e814b29d843b3/tutorial_1_wiehqew`;

const systemStream = await client.getStream(
  "0xeb21022d952e5De09C30bfda9E6352FFA95F67bE/system",
);

console.log("Subscribing to system stream...");
await client.subscribe(systemStream, (event) => {
  console.log("System stream event:", event);
});

console.log("Querying stream for last 2 messages...");
const response = await client
  .query(streamIdOrPath, { last: 2 }, undefined, {
    verifyNetworkResponses: {
      timeout: 15000,
    },
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

for await (const event of response) {
  console.log(event.content);
}

console.log("Exiting!");
process.exit(0);
