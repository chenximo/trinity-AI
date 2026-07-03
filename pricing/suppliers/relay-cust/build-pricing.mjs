#!/usr/bin/env node
import { buildOfficialDirectChannel } from "../official-direct/lib/build-channel.mjs";

buildOfficialDirectChannel("relay-cust")
  .then((r) => {
    const { outFile, mapFile, modelCount, trinityMappedCount } = r;
    console.log(
      JSON.stringify({ modelCount, trinityMappedCount, outFile, mapFile }, null, 2),
    );
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
