use std::fs;
use std::io::{self, Write};
use std::path::{Path, PathBuf};

use ansi_term::Colour::*;
use rpassword::read_password;
use toml::{map::Map, Value};

use crate::internal::handlers::utils::{
    exec_on_home, git_clone, is_dir, is_empty, str_to_path_buf, CloneArgs,
};
use crate::{print_error, print_error_and_exit};

pub fn init() -> bool {
    let dot_monkey: &Path = Path::new(".monkey");
    let base_path: PathBuf = exec_on_home(&dot_monkey).unwrap();

    let dir_exists = is_dir(base_path.as_path());

    if dir_exists && !is_empty(base_path.as_path()) {
        return false;
    } else if dir_exists && is_empty(base_path.as_path()) {
        let res = scaffold(&base_path).unwrap();

        if !res {
            panic!("{}", Red.paint("Failed to scaffold git repo!"));
        }
    } else {
        fs::create_dir(base_path.clone()).unwrap();

        if !is_dir(base_path.as_path()) {
            panic!("{}", Red.paint("Failed to create path!"));
        }

        let res = scaffold(&base_path).unwrap();

        if !res {
            panic!("{}", Red.paint("Failed to scaffold git repo!"));
        }
    }

    true
}

fn scaffold(base_path: &PathBuf) -> Result<bool, &'static str> {
    // Create config file
    let mut configs = Map::new();

    // Get the repo url
    print!("Please enter the full http git path: ");
    io::stdout().flush().unwrap();

    let mut repo_url_buffer = String::new();
    io::stdin().read_line(&mut repo_url_buffer).unwrap();

    print!("Please enter the github repo name: ");
    io::stdout().flush().unwrap();

    let mut repo_name_buffer = String::new();
    io::stdin().read_line(&mut repo_name_buffer).unwrap();

    print!("Please enter your full ssh key path (default $HOME/.ssh/id_rsa): ");
    io::stdout().flush().unwrap();

    let mut ssh_key_path_buffer = String::new();
    io::stdin().read_line(&mut ssh_key_path_buffer).unwrap();

    let repo_url = match repo_url_buffer.trim_end() {
        "" => panic!(Red.paint("Error! No repo provided!")),
        url => url,
    };

    let repo_name = match repo_name_buffer.trim_end() {
        "" => panic!(Red.paint("Error! No repo name provided!")),
        name => name,
    };

    let ssh_key_path = match ssh_key_path_buffer.trim_end() {
        "" => exec_on_home(Path::new(".ssh")).unwrap(),
        path => str_to_path_buf(path.to_owned()).unwrap(),
    };

    println!("{}", Cyan.paint("Cloning github repository"));
    let clone_args = CloneArgs {
        url: repo_url.to_owned(),
        base_path: base_path.to_str().unwrap().to_owned(),
        ssh_key_path: ssh_key_path.to_str().unwrap().to_owned(),
        repo_name: repo_name.to_owned(),
    };

    match git_clone(&clone_args) {
        Ok(()) => println!("{}", Green.paint("Cloned successfully")),
        Err(e) => print_error_and_exit!("{}: {}", Red.paint("Failed to clone"), e),
    }

    configs.insert("clone_url".into(), Value::String(clone_args.url));
    configs.insert(
        "clone_path".into(),
        Value::String(clone_args.base_path.clone()),
    );
    configs.insert("repo_name".into(), Value::String(repo_name.into()));
    configs.insert(
        "ssh_key_path".into(),
        Value::String(ssh_key_path.as_path().to_str().unwrap().into()),
    );

    let configs_value = Value::Table(configs);
    let config_string = toml::to_string(&configs_value).expect("Could not encode TOML");
    let config_path: PathBuf = [&clone_args.base_path, "monkey.toml"].iter().collect();

    fs::write(config_path, config_string).expect("Could not write to file!");

    let password_storage_path: PathBuf = [&clone_args.base_path, "passwords.toml"].iter().collect();
    fs::File::create(password_storage_path).expect("Failed to make password file");

    println!("{}", Green.paint("All initialized!"));

    Ok(true)
}
