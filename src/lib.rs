extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

extern crate schnorrkel;

mod wrapper;
use wrapper::*;

extern crate wee_alloc;

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

/// Sign a message
///
/// The combination of both public and private key must be provided.
/// This is effectively equivalent to a keypair.
///
/// * public: UIntArray with 32 element
/// * private: UIntArray with 64 element
/// * message: Arbitrary length UIntArray
///
/// * returned vector is the signature consisting of 64 bytes.
#[wasm_bindgen]
pub fn sign(public: &[u8], private: &[u8], message: &[u8]) -> Vec<u8> {
	__sign(public, private, message).to_vec()
}

/// Verify a message and its corresponding against a public key;
///
/// * signature: UIntArray with 64 element
/// * message: Arbitrary length UIntArray
/// * pubkey: UIntArray with 32 element
#[wasm_bindgen]
pub fn verify(signature: &[u8], message: &[u8], pubkey: &[u8]) -> bool {
	__verify(signature, message, pubkey)
}

/// Generate a secret key (aka. private key) from a seed phrase.
///
/// * seed: UIntArray with 32 element
///
/// returned vector is the private key consisting of 64 bytes.
#[wasm_bindgen]
pub fn secret_from_seed(seed: &[u8]) -> Vec<u8> {
	__secret_from_seed(seed).to_vec()
}

/// Generate a key pair. .
///
/// * seed: UIntArray with 32 element
///
/// returned vector is the concatenation of first the private key (64 bytes)
/// followed by the public key (32) bytes.
#[wasm_bindgen]
pub fn keypair_from_seed(seed: &[u8]) -> Vec<u8> {
	__keypair_from_seed(seed).to_vec()
}

/// Perform a derivation on a secret
///
/// * secret: UIntArray with 64 bytes
/// * cc: UIntArray with 32 bytes
///
/// returned vector the derived keypair as a array of 96 bytes
#[wasm_bindgen]
pub fn soft_derive_keypair(pair: &[u8], cc: &[u8]) -> Vec<u8> {
	__soft_derive_keypair(pair, cc).to_vec()
}

/// Perform a derivation on a publicKey
///
/// * pubkey: UIntArray with 32 bytes
/// * cc: UIntArray with 32 bytes
///
/// returned vector is the derived publicKey as a array of 32 bytes
#[wasm_bindgen]
pub fn soft_derive_public(pubkey: &[u8], cc: &[u8]) -> Vec<u8> {
	__soft_derive_public(pubkey, cc).to_vec()
}

/// Perform a derivation on a secret
///
/// * secret: UIntArray with 64 bytes
/// * cc: UIntArray with 32 bytes
///
/// returned vector the derived secret as a array of 64 bytes
#[wasm_bindgen]
pub fn soft_derive_secret(secret: &[u8], cc: &[u8]) -> Vec<u8> {
	__soft_derive_secret(secret, cc).to_vec()
}

#[cfg(test)]
pub mod tests {
	extern crate wasm_bindgen_test;
	extern crate rand;
	extern crate schnorrkel;

	use hex_literal::{hex, hex_impl};
	use wasm_bindgen_test::*;
	use super::*;
	use schnorrkel::{SIGNATURE_LENGTH, KEYPAIR_LENGTH, SECRET_KEY_LENGTH};


	// to enable browser tests
	// wasm_bindgen_test_configure!(run_in_browser);

	fn generate_random_seed() -> Vec<u8> {
		(0..32).map(|_| rand::random::<u8>() ).collect()
	}

	#[wasm_bindgen_test]
	fn can_create_keypair() {
		let seed = generate_random_seed();
		let keypair = keypair_from_seed(seed.as_slice());
		assert!(keypair.len() == KEYPAIR_LENGTH);
	}

	#[wasm_bindgen_test]
	fn can_create_secret() {
		let seed = generate_random_seed();
		let secret = secret_from_seed(seed.as_slice());
		assert!(secret.len() == SECRET_KEY_LENGTH);
	}

	#[wasm_bindgen_test]
	fn can_sign_message() {
		let seed = generate_random_seed();
		let keypair = keypair_from_seed(seed.as_slice());
		let private = &keypair[0..SECRET_KEY_LENGTH];
		let public = &keypair[SECRET_KEY_LENGTH..KEYPAIR_LENGTH];
		let message = b"this is a message";
		let signature = sign(public, private, message);
		assert!(signature.len() == SIGNATURE_LENGTH);
	}

	#[wasm_bindgen_test]
	fn can_verify_message() {
		let seed = generate_random_seed();
		let keypair = keypair_from_seed(seed.as_slice());
		let private = &keypair[0..SECRET_KEY_LENGTH];
		let public = &keypair[SECRET_KEY_LENGTH..KEYPAIR_LENGTH];
		let message = b"this is a message";
		let signature = sign(public, private, message);
		assert!(verify(&signature[..], message, public));
	}

	#[wasm_bindgen_test]
	#[test]
	fn soft_derives_public_keys() {
		let public = hex!("46ebddef8cd9bb167dc30878d7113b7e168e6f0646beffd77d69d39bad76b47a");
		let cc = [12, 0x66, 0x6f, 0x6f, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]; // "foo" with compact length added
		let expected = hex!("40b9675df90efa6069ff623b0fdfcf706cd47ca7452a5056c7ad58194d23440a");
		assert_eq!(soft_derive_public(&public, &cc), expected);
	}

	#[wasm_bindgen_test]
	#[test]
	fn soft_derives_pairs() {
		let seed = hex!("fac7959dbfe72f052e5a0c3c8d6530f202b02fd8f9f5ca3580ec8deb7797479e");
		let keypair = keypair_from_seed(&seed);
		let cc = [12, 0x66, 0x6f, 0x6f, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]; // "foo" with compact length added
		let expected = hex!("40b9675df90efa6069ff623b0fdfcf706cd47ca7452a5056c7ad58194d23440a");
		let derived = soft_derive_keypair(&keypair, &cc);
		let public = &derived[SECRET_KEY_LENGTH..KEYPAIR_LENGTH];
		assert_eq!(public, expected);
	}
}
