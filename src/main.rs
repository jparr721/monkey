#[macro_use]
extern crate hex_literal;

#[macro_use]
mod internal;

mod app;

use std::env;

use ansi_term::Colour::{Blue, Red};

use crate::internal::{handlers::add::add, handlers::init::init, opts::MonkeyOptions};

fn main() {
    let mut opt_selected = false;
    let matches = app::build_app().get_matches();

    if matches.is_present("init") {
        opt_selected = true;
        let succeeded = init();

        if !succeeded {
            panic!("{}", Red.paint("Initialization failed!"));
        }
    }

    if matches.is_present("add") {
        opt_selected = true;
        let passwords = matches.values_of("add").unwrap().collect::<Vec<_>>();

        if passwords.len() % 2 != 0 {
            print_error_and_exit!(
                "{}: invalid key value pair found, {}: {:?}",
                Red.paint("Error"),
                Blue.paint("Keys"),
                passwords,
            );
        }

        add(passwords);
    }

    if !opt_selected {
        println!("{}", Red.paint("No options selected"));
    }
}
