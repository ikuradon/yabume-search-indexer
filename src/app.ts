import NDK, { NDKEvent, type NDKRelay } from '@nostr-dev-kit/ndk';
import chalk from 'chalk';
import * as dotenv from 'dotenv';
import { getUnixTime } from 'date-fns';
import { MeiliSearch } from 'meilisearch';

const log = console.log;
const debug = chalk.bold.gray;
const info = chalk.bold.white;
const error = chalk.bold.red;
const debugLog = (...args: string[]) => log(debug(...args));
const infoLog = (...args: string[]) => log(info(...args));
const errorLog = (...args: string[]) => log(error(...args));

const currUnixtime = (): number => getUnixTime(new Date());

const getEnv = (key: string) => {
  const value = Deno.env.get(key);
  if ((value === undefined) || (value === null)) {
    throw (`missing env var for ${key}`);
  }
  return value;
};

(async (_) => {
  dotenv.loadSync({ export: true });

  const RELAY_URL = getEnv('RELAY_URL');
  const MEILISEARCH_URL = getEnv('MEILISEARCH_URL');
  const MEILISEARCH_KEY = getEnv('MEILISEARCH_KEY');

  const mClient = new MeiliSearch({
    host: MEILISEARCH_URL,
    apiKey: MEILISEARCH_KEY,
  });
  const mIndex = mClient.index('events');

  const explicitRelayUrls = [RELAY_URL];

  const ndk = new NDK({
    explicitRelayUrls,
  });
  ndk.pool.on('relay:connect', (r: NDKRelay) => {
    infoLog(`Connected to relay ${r.url}`);
  });

  await ndk.connect(2000);

  const sub = ndk.subscribe({ kinds: [0, 1, 42, 30023], since: currUnixtime() });
  sub.on('event', async (event: NDKEvent) => {
    await mIndex.addDocuments([event.rawEvent()]);
  });
})().catch((e) => errorLog(e));
