/**
 * node --test pricing/pipeline/lib/tier-key.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  findTierByKey,
  tierKeyFromTokenBounds,
  tierToKey,
} from "./tier-key.mjs";

test("short listing labels join official 512k / 32k / 256k keys", () => {
  assert.equal(tierToKey("≤ 512K", 0, 2), "t:0-512k");
  assert.equal(tierToKey("> 512K", 1, 2), "t:512k+");
  assert.equal(tierToKey("输入≤512k", 0, 2), "t:0-512k");
  assert.equal(tierToKey("输入>512k", 1, 2), "t:512k+");

  assert.equal(tierToKey("≤ 32K", 0, 2), "t:0-32k");
  assert.equal(tierToKey("> 32K", 1, 2), "t:32k+");
  assert.equal(tierToKey("输入<32k", 0, 2), "t:0-32k");
  assert.equal(tierToKey("输入≥32k", 1, 2), "t:32k+");

  assert.equal(tierToKey("≤ 16K", 0, 3), "t:0-16k");
  assert.equal(tierToKey("16K – 32K", 1, 3), "t:16k-32k");
  assert.equal(tierToKey("> 32K", 2, 3), "t:32k+");

  assert.equal(tierToKey("≤ 256K", 0, 2), "t:0-256k");
  assert.equal(tierToKey("> 256K", 1, 2), "t:256k-1m");
  assert.equal(tierToKey("32K – 256K", 1, 3), "t:32k-256k");
});

test("binary display 524.29K / 32.77K snaps to 512k / 32k", () => {
  assert.equal(tierToKey("≤ 524.29K", 0, 2), "t:0-512k");
  assert.equal(tierToKey("> 524.29K", 1, 2), "t:512k+");
  assert.equal(tierToKey("≤ 32.77K", 0, 2), "t:0-32k");
  assert.equal(tierToKey("> 32.77K", 1, 2), "t:32k+");
  assert.equal(tierToKey("≤ 262.14K", 0, 2), "t:0-256k");
  assert.equal(tierToKey("> 262.15K", 1, 2), "t:256k-1m");
});

test("API token bounds match official keys", () => {
  assert.equal(tierKeyFromTokenBounds(0, 524288), "t:0-512k");
  assert.equal(tierKeyFromTokenBounds(524289, undefined), "t:512k+");
  assert.equal(tierKeyFromTokenBounds(0, 32768), "t:0-32k");
  assert.equal(tierKeyFromTokenBounds(32769, undefined), "t:32k+");
  assert.equal(tierKeyFromTokenBounds(16385, 32768), "t:16k-32k");
  assert.equal(tierKeyFromTokenBounds(32769, 262144), "t:32k-256k");
  assert.equal(tierKeyFromTokenBounds(0, 512000), "t:0-512k");
  assert.equal(tierKeyFromTokenBounds(512001, undefined), "t:512k+");
  assert.equal(tierKeyFromTokenBounds(0, 32000), "t:0-32k");
  assert.equal(tierKeyFromTokenBounds(32001, undefined), "t:32k+");
  assert.equal(tierToKey("输入≤512k", 0, 2), "t:0-512k");
  assert.equal(tierToKey("输入>512k", 1, 2), "t:512k+");
});

test("findTierByKey uses stored tierKey or label", () => {
  const online = [
    { tierLabel: "≤ 512K", input: 0.323 },
    { tierLabel: "> 512K", input: 0.646 },
  ];
  assert.equal(findTierByKey(online, "t:512k+")?.input, 0.646);
  assert.equal(findTierByKey(online, "t:0-512k")?.input, 0.323);
});

test("lookup totalTiers=1 still keeps context key from label", () => {
  assert.equal(tierToKey("输入>512k", 0, 1), "t:512k+");
  assert.equal(tierToKey("标准价", 0, 1), "uniform");
});
