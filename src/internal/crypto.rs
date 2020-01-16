use hex;

/// This is a shitty cipher. Could you brute force it? Yeah, but it would
/// take a lot of work to first: log into your machine, then: see that you
/// use this random ass tool. Then, somehow know how it's configured?
///
/// Security through obscurity :)
pub fn shitty_cipher(password: &[u8], key: &[u8]) -> String {
    let mut encrypted_pw = String::new();

    for i in 0..password.len() {
        let c_num = key[i % key.len()] + password[i];

        encrypted_pw.push(c_num as char);
    }

    hex::encode(encrypted_pw)
}

pub fn shitty_decryptor(ciphertext: String, key: &[u8]) -> String {
    let decoded = String::from_utf8(hex::decode(ciphertext).unwrap()).unwrap();
    let mut decoded_pw = String::new();

    for (i, c) in decoded.chars().enumerate() {
        let c_num = c as u8 - key[i % key.len()];

        decoded_pw.push(c_num as char);
    }

    decoded_pw
}
