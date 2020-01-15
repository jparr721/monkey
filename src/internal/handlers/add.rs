use std::fs;
use std::io::{self, Write};
use std::path::Path;

use aes_soft::Aes128;
use ansi_term::Colour::*;
use block_modes::block_padding::Pkcs7;
use block_modes::{BlockMode, Cbc};
use hex;
use rpassword;
use toml::{map::Map, Value};

use crate::internal::handlers::utils::{bytes_to_hex, exec_on_home, is_dir, is_empty};
use crate::{print_error, print_error_and_exit};

type Aes128Cbc = Cbc<Aes128, Pkcs7>;

pub fn add(options: Vec<&str>) -> bool {
    let mut base_path = exec_on_home(Path::new(".monkey")).unwrap();

    if !is_dir(base_path.as_path()) || is_empty(base_path.as_path()) {
        print_error_and_exit!("{} please initialize first!", Red.paint("Error"));
    }

    base_path.push("vault");
    base_path.push("passwords.toml");

    let global_password = ask_for_password().unwrap();
    let mut passwords = Map::new();

    for i in (0..options.len() - 1).step_by(2) {
        let key = options[i];
        let password = options[i + 1];

        let secure_password = encrypt(password.as_bytes(), global_password.as_bytes());
        passwords.insert(key.to_owned(), Value::String(secure_password));
    }

    let passwords_string = toml::to_string(&passwords).expect("Could not encode passwords");

    fs::write(base_path, passwords_string).expect("Could not write passwords!");

    true
}

// TODO(jparr721) - Move below stuff to its own module
fn encrypt(password: &[u8], key: &[u8]) -> String {
    let hex_key = bytes_to_hex(key);
    let iv = hex!("f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff");
    let cipher = Aes128Cbc::new_var(&hex_key.as_bytes(), &iv).unwrap();

    let mut buffer = [0u8; 32];
    let pos = password.len();
    buffer[..pos].copy_from_slice(password);
    let ciphertext = cipher.encrypt(&mut buffer, pos).unwrap();

    hex::encode(ciphertext)
}

fn decrypt(ciphertext: String, key: &[u8]) -> String {
    let hex_key = bytes_to_hex(key);
    let iv = hex!("f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff");

    let cipher = Aes128Cbc::new_var(&hex_key.as_bytes(), &iv).unwrap();
    let mut buf = hex::decode(ciphertext).unwrap().to_vec();
    let decrypted = cipher.decrypt(&mut buf).unwrap();

    String::from_utf8(decrypted.to_vec()).unwrap()
}

fn ask_for_password() -> Result<String, &'static str> {
    print!("Please enter your password: ");
    io::stdout().flush().unwrap();

    Ok(rpassword::read_password().unwrap())
}
