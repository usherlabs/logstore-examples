import { CONFIG_TEST } from '@logsn/client';
import { StreamrClientConfig } from 'streamr-client';

const devMode = process.env.DEV_MODE ?? false;
const privateKey = process.env.PRIVATE_KEY!;

const config = (devMode ? CONFIG_TEST : {}) as StreamrClientConfig;
config.auth = { privateKey };

export { config };
