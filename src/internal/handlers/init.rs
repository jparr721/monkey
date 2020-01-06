use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use ansi_term::Colour::*;
use toml::{map::Map, Value};

use crate::internal::handlers::utils::{exec_on_home, git_clone, is_dir, is_empty, CloneArgs};

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
    let mut configs = Map::new();

    // Get the repo url
    print!("Please enter the full http git path: ");
    let mut repo_url_buffer = String::new();
    io::stdin().read_line(&mut repo_url_buffer).unwrap();

    println!();
    print!("Please enter the github repo name: ");
    let mut repo_name_buffer = String::new();
    io::stdin().read_line(&mut repo_name_buffer).unwrap();

    let repo_url = match repo_url_buffer.trim_end() {
        "" => panic!(Red.paint("Error! No repo provided!")),
        url => url,
    };

    let repo_name = match repo_name_buffer.trim_end() {
        "" => panic!(Red.paint("Error! No repo name provided!")),
        name => name,
    };

    println!("{}", Cyan.paint("Cloning github repository"));
    let clone_args = CloneArgs {
        url: repo_url.to_owned(),
        path: base_path.to_str().unwrap().to_owned(),
    };

    match git_clone(&clone_args) {
        Ok(()) => println!("{}", Green.paint("Cloned successfully")),
        Err(e) => panic!(e),
    }

    configs.insert("clone_url".into(), Value::String(clone_args.url));
    configs.insert("clone_path".into(), Value::String(clone_args.path));
    configs.insert("repo_name".into(), Value::String(repo_name.into()));

    Ok(true)
}
