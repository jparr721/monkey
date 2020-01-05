#[macro_use]
mod internal;

mod app;

use std::env;

use crate::internal::opts::MonkeyOptions;

fn main() {
    let matches = app::build_app().get_matches();

    if matches.is_present("init") {

    }
}
