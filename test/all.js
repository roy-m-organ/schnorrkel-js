// @ts-check
const crypto = require('crypto');
const { assert, hexToU8a, stringToU8a, u8aToHex } = require('@polkadot/util');
const schnorrkel = require('../pkg/index');

function extractKeys (pair) {
  const pk = pair.slice(64);
  const sk = pair.slice(0, 64);

  return [pair, pk, sk];
}

function randomPair () {
  const seed = crypto.randomBytes(32);
  const pair = schnorrkel.keypairFromSeed(seed);

  assert(pair.length === 96, 'ERROR: Invalid pair created');

  return extractKeys(pair);
}

async function beforeAll () {
  return schnorrkel.waitReady();
}

async function pairFromSeed () {
  const SEED = stringToU8a('12345678901234567890123456789012');
  const PAIR = hexToU8a(
    '0x' +
    'f0106660c3dda23f16daa9ac5b811b963077f5bc0af89f85804f0de8e424f050' +
    'f98d66f39442506ff947fd911f18c7a7a5da639a63e8d3b4e233f74143d951c1' +
    '741c08a06f41c596608f6774259bd9043304adfa5d3eea62760bd9be97634d63'
  );

  const pair = schnorrkel.keypairFromSeed(SEED);

  console.log('\tSEC', u8aToHex(pair.slice(0, 64)));
  console.log('\tPUB', u8aToHex(pair.slice(64)));

  assert(u8aToHex(pair) === u8aToHex(PAIR), 'ERROR: pairFromSeed() does not match');
}

async function devFromSeed () {
  const SEED = hexToU8a('0xfac7959dbfe72f052e5a0c3c8d6530f202b02fd8f9f5ca3580ec8deb7797479e');
  const PAIR = hexToU8a(
    '0x' +
    '28b0ae221c6bb06856b287f60d7ea0d98552ea5a16db16956849aa371db3eb51' +
    'fd190cce74df356432b410bd64682309d6dedb27c76845daf388557cbac3ca34' +
    '46ebddef8cd9bb167dc30878d7113b7e168e6f0646beffd77d69d39bad76b47a'
  );

  const pair = schnorrkel.keypairFromSeed(SEED);

  console.log('\tSEC', u8aToHex(pair.slice(0, 64)));
  console.log('\tPUB', u8aToHex(pair.slice(64)));

  assert(u8aToHex(pair) === u8aToHex(PAIR), 'ERROR: devFromSeed() does not match');
}

async function verifyExisting () {
  const PK = hexToU8a('0x741c08a06f41c596608f6774259bd9043304adfa5d3eea62760bd9be97634d63');
  const MESSAGE = stringToU8a('this is a message');
  const SIGNATURE = hexToU8a(
    '0x' +
    'decef12cf20443e7c7a9d406c237e90bcfcf145860722622f92ebfd5eb4b5b39' +
    '90b6443934b5cba8f925a0ae75b3a77d35b8490cbb358dd850806e58eaf72904'
  );

  const isValid = schnorrkel.verify(SIGNATURE, MESSAGE, PK);

  console.log('\tRES', isValid);

  assert(isValid, 'ERROR: Unable to verify signature');
}

async function signAndVerify () {
  const MESSAGE = stringToU8a('this is a message');

  const [, pk, sk] = randomPair();
  const signature = schnorrkel.sign(pk, sk, MESSAGE);
  const isValid = schnorrkel.verify(signature, MESSAGE, pk);

  console.log('\tSIG', u8aToHex(signature));
  console.log('\tRES', isValid);

  assert(isValid, 'ERROR: Unable to verify signature');
}

async function deriveHard () {
  const CC = hexToU8a('0x0c666f6f00000000000000000000000000000000000000000000000000000000');
  const [pair] = randomPair();
  const derived = schnorrkel.deriveKeypairHard(pair, CC);

  console.log('\tSEC', u8aToHex(derived.slice(0, 64)));
  console.log('\tPUB', u8aToHex(derived.slice(64)));
}

async function deriveHardKnown () {
  const CC = hexToU8a('0x14416c6963650000000000000000000000000000000000000000000000000000');
  const PAIR = hexToU8a(
    '0x' +
    '28b0ae221c6bb06856b287f60d7ea0d98552ea5a16db16956849aa371db3eb51' +
    'fd190cce74df356432b410bd64682309d6dedb27c76845daf388557cbac3ca34' +
    '46ebddef8cd9bb167dc30878d7113b7e168e6f0646beffd77d69d39bad76b47a'
  );
  const PUBLIC = '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d';

  const derived = schnorrkel.deriveKeypairHard(PAIR, CC);
  const publicKey = u8aToHex(derived.slice(64));

  console.log('\tSEC', u8aToHex(derived.slice(0, 64)));
  console.log('\tPUB', publicKey);

  assert(publicKey === PUBLIC, 'Unmatched resulting public keys');
}

async function deriveSoft () {
  const CC = hexToU8a('0x0c666f6f00000000000000000000000000000000000000000000000000000000');

  const [pair] = randomPair();
  const derived = schnorrkel.deriveKeypairSoft(pair, CC);

  console.log('\tSEC', u8aToHex(derived.slice(0, 64)));
  console.log('\tPUB', u8aToHex(derived.slice(64)));
}

async function deriveSoftKnown () {
  const CC = hexToU8a('0x0c666f6f00000000000000000000000000000000000000000000000000000000');
  const PUBLIC = '0x40b9675df90efa6069ff623b0fdfcf706cd47ca7452a5056c7ad58194d23440a';
  const PAIR = hexToU8a(
    '0x' +
    '28b0ae221c6bb06856b287f60d7ea0d98552ea5a16db16956849aa371db3eb51' +
    'fd190cce74df356432b410bd64682309d6dedb27c76845daf388557cbac3ca34' +
    '46ebddef8cd9bb167dc30878d7113b7e168e6f0646beffd77d69d39bad76b47a'
  );

  const derived = schnorrkel.deriveKeypairSoft(PAIR, CC);
  const publicKey = u8aToHex(derived.slice(64));

  console.log('\tSEC', u8aToHex(derived.slice(0, 64)));
  console.log('\tPUB', publicKey);

  assert(publicKey === PUBLIC, 'Unmatched resulting public keys');
}

async function deriveSoftPubkey () {
  const CC = hexToU8a('0x0c666f6f00000000000000000000000000000000000000000000000000000000');
  const PUBLIC = hexToU8a('0x46ebddef8cd9bb167dc30878d7113b7e168e6f0646beffd77d69d39bad76b47a');
  const DERIVED = '0x40b9675df90efa6069ff623b0fdfcf706cd47ca7452a5056c7ad58194d23440a';

  const derived = u8aToHex(schnorrkel.derivePublicSoft(PUBLIC, CC));

  console.log('\tPUB', derived);

  assert(derived === DERIVED, 'Unmatched resulting public keys');
}

async function benchmark () {
  const MESSAGE = stringToU8a('this is a message');

  for (let i = 0; i < 256; i++) {
    const [, pk, sk] = randomPair();

    const signature = schnorrkel.sign(pk, sk, MESSAGE);
    const isValid = schnorrkel.verify(signature, MESSAGE, pk);

    assert(isValid, 'ERROR: Unable to verify signature');
  }
}

const tests = {
  pairFromSeed,
  devFromSeed,
  deriveHard,
  deriveHardKnown,
  deriveSoft,
  deriveSoftKnown,
  deriveSoftPubkey,
  signAndVerify,
  verifyExisting,
  benchmark
};

async function runAll () {
  Object.keys(tests).forEach(async (name) => {
    console.time(name);
    console.log();
    console.log(name);

    await tests[name]();

    console.timeEnd(name);
  });
}

module.exports.beforeAll = beforeAll;
module.exports.runAll = runAll;
module.exports.tests = tests;
