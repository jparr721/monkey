#[macro_use]
mod internal;

mod app;

use std::env;

use ansi_term::Colour::Red;

use crate::internal::{
    opts::MonkeyOptions,
    handlers::init::init,
};

fn main() {
    println!();
    print!("AYYEEE WE MADE IT CUZ");
    println!();
    init();
    // let matches = app::build_app().get_matches();

    // if matches.is_present("init") {
    //     let succeeded = init();

    //     if !succeeded {
    //         panic!("{}", Red.paint("Initialization failed!"));
    //     }
    // }
}
