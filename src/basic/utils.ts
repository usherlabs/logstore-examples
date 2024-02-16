import { Wallet } from 'ethers';

export default {
	isValidPrivateKey: (privateKey: string) => {
		try {
			new Wallet(privateKey);
		} catch (e) {
			console.error(
				'You need to provide a Private Key under /src/config.js before you can execute this example.'
			);
			process.exit(1);
		}
	},
};
