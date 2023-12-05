require('dotenv/config');
const LogStoreClient = require("@logsn/client");
const utils = require("../basic/utils.js");
const { PrivateKey } = require("../basic/config.js");
const main = async () => {
  utils.isValidPrivateKey(PrivateKey);
  // Create the client using the validated private key
  const client = new LogStoreClient({
    auth: {
      privateKey: PrivateKey,
    },
  });

  // Create the default stream
  const stream = await client.getOrCreateStream({
    id: `/logstore-demo`,
  });
  // const stream = await client.getOrCreateStream({
  //   id: `0xa156eda7dcd689ac725ce9595d4505bf28256454/heartbeat`,
  // });

  await stream.publish({ id: 0 });
  await stream.publish({ id: 1 });
  await stream.publish({ id: 2 });

  // ensure that the stream is being stored!
  console.log("Stream fetched:", stream.id);

  const subscription = await client.subscribe(
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

  const query = await client.query(
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
};

if (utils.isRunFlagPresent(process.argv)) {
  main();
}

module.exports = main;