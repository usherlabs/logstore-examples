![Cover image](https://github.com/usherlabs/logstore/raw/master/assets/readmes/logstore-cover.png)

# Log Store Examples

This repository contains examples of creating or consuming data using the LogStore technology.

- `src/basic`: publish and query data from a simple stream
- `src/listen-to-contract`: publish and query data from a stream that listens for smart contract events
- `src/gas-station`: consuming data from the [Multi-Chain Gas Station](https://streamr.network/hub/projects/0x833774c6a6bcffdc67289895167d1190b738803502c89a451bbfd13076e4a61b/overview) public stream

## How to run it?

- install using your favorite package manager. e.g., `npm install`
- copy `.env.example` to `.env` and fill in the required values
- find and run scripts inside `package.json`

Note: After using the `LogStoreClient` or the `StreamrClient`, it's important to destroy them to avoid memory leaks. You are also able to perform this action by using the [Explicit Resource Management feature](https://github.com/tc39/proposal-explicit-resource-management).

Example:
```ts
const yourFn = async () => {
	const client = new StreamrClient(streamrOptions);
	const lsClient = new LogStoreClient(client);

	// Here we cleanup the streamr connections
	using cleanup = new DisposableStack();
	cleanup.defer(() => {
		lsClient.destroy();
		client.destroy();
	});
	// operations as normally
}; // -- at the end of this scope, the cleanup will be called
```

## How to contribute?

1. Fork and clone the repository.
2. Create a new branch.
3. Make and commit your changes.
4. Push changes to GitHub.
5. Create a pull request.

Notes:

- Some of these examples require you to create and stake the stream before executing it. Find out how to do this using our [CLI](https://docs.logstore.usher.so/network/cli/getting-started).
- Log Levels: see `.env.example` for details about `LOG_LEVEL` variable.

Check out our [documentation](https://docs.logstore.usher.so/) for more details about the LogStore

Join our [Discord](https://go.usher.so/discord) to get in touch with the team and community.
