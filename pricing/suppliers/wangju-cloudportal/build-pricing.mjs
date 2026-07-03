#!/usr/bin/env node
import { buildOfficialDirectChannel } from "../official-direct/lib/build-channel.mjs";

buildOfficialDirectChannel("wangju-cloudportal")
  .then((r) => {
    const { models, meta, outFile, mapFile, modelCount, trinityMappedCount } = r;
    console.log(
      JSON.stringify(
        {
          modelCount,
          trinityMappedCount,
          openai: models.filter((m) => m.vendor === "openai").length,
          google: models.filter((m) => m.vendor === "google").length,
          outFile,
          mapFile,
        },
        null,
        2,
      ),
    );
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
