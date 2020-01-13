use std::io::{self, Write};
use std::path::Path;

use ansi_term::Colour::*;
use openssl::aes::{aes_ige, AesKey};
use openssl::symm::Mode;
use rpassword;
use toml::{map::Map, Value};

use crate::internal::handlers::utils::{exec_on_home, is_dir, is_empty, vec_to_string};
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

        let secure_password = vec_to_string(
            &encrypt(password.as_bytes(), global_password.as_bytes()),
            None,
        );
        passwords.insert(key.to_owned(), Value::String(secure_password));
    }

    let passwords_string = toml::to_string(&passwords).expect("Could not encode passwords");
    println!("{}", passwords_string);
    let v = decrypt(
        passwords.get("key").unwrap().as_str().unwrap().to_owned(),
        global_password.as_bytes(),
    )
    .unwrap();
    println!("{:?}", v);
    let s = String::from_utf8(v).unwrap();
    println!("{}", s);
    // fs::write(base_path, passwords_string).unwrap();

    true
}

fn encrypt(password: &[u8], key: &[u8]) -> Vec<u8> {
    // If key too short, pad it out
    let key_string = match key.len() % 16 == 0 {
        true => key.to_vec(),
        false => key_to_next_highest_base16(key),
    };

    let password_string = match password.len() % 16 == 0 {
        true => password.to_vec(),
        false => key_to_next_highest_base16(password),
    };

    let enc_key = AesKey::new_encrypt(&key_string[..]).unwrap();
    println!("{}", Green.paint("Key generated"));
    let mut iv = (0u8..32u8).map(|x| x + 97u8).collect::<Vec<_>>();
    let mut output = vec![0u8; password_string.len()];

    aes_ige(
        &password_string[..],
        &mut output,
        &enc_key,
        &mut iv,
        Mode::Encrypt,
    );
    println!("{}", Green.paint("Encoding complete"));

    output
}

fn decrypt(pw_value: String, password_key: &[u8]) -> Result<Vec<u8>, &'static str> {
    let mut plain_pw_vec = pw_value
        .split(",")
        .collect::<Vec<&str>>();
    plain_pw_vec.remove(plain_pw_vec.len() - 1);
    let plain_pw_str = plain_pw_vec.join("");
    let mut iv = (0u8..32u8).map(|x| x + 97u8).collect::<Vec<_>>();
    let mut output = vec![0u8; plain_pw_str.len()];
    let enc_key = match password_key.len() % 16 == 0 {
        true => AesKey::new_encrypt(password_key).unwrap(),
        false => AesKey::new_encrypt(key_to_next_highest_base16(password_key).as_slice()).unwrap(),
    };
    println!("{}", plain_pw_str.len());
    println!("{}", plain_pw_str);

    aes_ige(
        plain_pw_str.as_bytes(),
        &mut output,
        &enc_key,
        &mut iv,
        Mode::Decrypt,
    );

    Ok(output)
}

fn ask_for_password() -> Result<String, &'static str> {
    print!("Please enter your password: ");
    io::stdout().flush().unwrap();

    Ok(rpassword::read_password().unwrap())
}

fn key_to_next_highest_base16(key: &[u8]) -> Vec<u8> {
    if key.len() > 32 {
        print_error_and_exit!("{}: password is too long!", Red.paint("Error"));
    }

    let key_string = if key.len() < 16 {
        pad_vec(key, 16 - key.len())
    } else if key.len() > 16 && key.len() < 24 {
        pad_vec(key, 24 - key.len())
    } else if key.len() > 16 && key.len() < 32 {
        pad_vec(key, 32 - key.len())
    } else {
        pad_vec(key, 128)
    };

    key_string
}

fn pad_vec(vec: &[u8], size: usize) -> Vec<u8> {
    let mut padding = vec![97u8; size];

    let mut v = vec.to_vec();
    v.append(&mut padding);
    v
}
