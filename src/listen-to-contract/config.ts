import { CONFIG_TEST } from '@logsn/client';
import { StreamrClientConfig } from 'streamr-client';
import { PrivateKey } from '../config';

const devMode = process.env.DEV_MODE ?? false;

const config = (devMode ? CONFIG_TEST : {}) as StreamrClientConfig;
config.auth = { privateKey: PrivateKey };

export { config };
export * from '../config';
