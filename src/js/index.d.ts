export function isReady (): boolean;
export function keypairFromSeed (seed: Uint8Array): Uint8Array;
export function secretFromSeed (seed: Uint8Array): Uint8Array;
export function sign (publicKey: Uint8Array, secretKey: Uint8Array, message: Uint8Array): Uint8Array;
export function softDeriveKeypair (pair: Uint8Array, chainCode: Uint8Array): Uint8Array;
export function softDerivePublic (publicKey: Uint8Array, chainCode: Uint8Array): Uint8Array;
export function softDeriveSecret (secretKey: Uint8Array, chainCode: Uint8Array): Uint8Array;
export function verify (signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean;
export function waitReady (): Promise<boolean>;
