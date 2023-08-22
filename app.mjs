import { nip19, relayInit } from "nostr-tools";
import "websocket-polyfill";
import "dotenv/config";
import { MeiliSearch } from "meilisearch";

const RELAY_URL = process.env.RELAY_URL;
const MEILISEARCH_URL = process.env.MEILISEARCH_URL;
const MEILISEARCH_KEY = process.env.MEILISEARCH_KEY;

const main = async () => {
  const mClient = new MeiliSearch({
    host: MEILISEARCH_URL,
    apiKey: MEILISEARCH_KEY,
  });
  const mIndex = mClient.index("events");

  const relay = relayInit(RELAY_URL);
  relay.on("error", () => {
    console.error("failed to connect");
    process.exit(0);
  });

  relay.connect();

  const sub = relay.sub([{
    kinds: [0, 1],
  }]);

  sub.on("event", async (ev) => {
    if (ev.kind === 0 || ev.kind === 1) {
      let response = await mIndex.addDocuments(ev);
      console.log(response);
    }
  });
};

main().catch((e) => console.error(e));