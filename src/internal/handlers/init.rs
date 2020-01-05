use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use ansi_term::{Colour::*};
use toml::{map::Map, Value};

use crate::internal::handlers::utils::{is_dir, exec_on_home, is_empty, git_clone, CloneArgs};

pub fn init() -> bool {
    let dot_monkey: &Path = Path::new(".monkey");
    let base_path: PathBuf = exec_on_home(dot_monkey).unwrap();

    let dir_exists = is_dir(base_path.as_path());

    if dir_exists && !is_empty(base_path.as_path()) {
        return false;
    } else if dir_exists && is_empty(base_path.as_path()) {

    }

    true
}

fn scaffold(base_path: &Path) -> Result<bool, &'static str> {
    // Create config file
    let base_config = Map::new();

    // Get the repo url
    let mut buffer = String::new();
    io::stdin().read_line(&mut buffer).unwrap();

    let repo_url = match buffer.trim_end() {
        "" => panic!(Red.paint("Error! No repo provided!")),
        url => url
    };

    println!("{}", Green.paint("Cloning github repository"));
    let clone_args = CloneArgs {
        url: repo_url.to_owned(),
        path: base_path.to_str().unwrap().to_owned(),
    };

    match git_clone(&clone_args) {
        Ok(()) => println!("{}", Green.paint("Cloned successfully")),
        Err(e) => panic!(e),
    }

    Ok(true)
}
