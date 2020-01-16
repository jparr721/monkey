use std::fs;
use std::io::{self, Write};
use std::path::Path;

use aes_soft::{Aes128, Aes192, Aes256};
use ansi_term::Colour::*;
use block_modes::block_padding::Pkcs7;
use block_modes::{BlockMode, Cbc};
use rpassword;
use toml::{map::Map, Value};

use crate::internal::crypto;
use crate::internal::handlers::utils::{bytes_to_hex, exec_on_home, is_dir, is_empty};
use crate::{print_error, print_error_and_exit};

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

        let secure_password = crypto::shitty_cipher(password.as_bytes(), global_password.as_bytes());
        passwords.insert(key.to_owned(), Value::String(secure_password));
    }

    let passwords_string = toml::to_string(&passwords).expect("Could not encode passwords");

    let mut fd = fs::OpenOptions::new().write(true).append(true).open(base_path).unwrap();

    fd.write_all(passwords_string.as_bytes()).expect("Couldn't write passwords!");

    true
}

fn ask_for_password() -> Result<String, &'static str> {
    print!("Please enter your password: ");
    io::stdout().flush().unwrap();

    Ok(rpassword::read_password().unwrap())
}
