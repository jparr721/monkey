#[macro_use]
mod internal;

mod app;

use std::env;

use ansi_term::Colour::Red;

use crate::internal::{handlers::init::init, opts::MonkeyOptions};

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

    if !opt_selected {
        println!("{}", Red.paint("No options selected"));
    }
}
