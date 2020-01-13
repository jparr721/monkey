use std::cell::RefCell;
use std::env::current_dir;
use std::fs;
use std::io::{self, Write};
use std::path::{Path, PathBuf};

use ansi_term::Colour::*;
use dirs::home_dir;
use git2::build::{CheckoutBuilder, RepoBuilder};
use git2::{Cred, FetchOptions, Progress, RemoteCallbacks};
use rpassword;

pub fn vec_to_string(vec: &Vec<u8>, delim: Option<char>) -> String {
    let mut vec_string = String::new();
    let delimeter = match delim {
        Some(d) => d,
        None => ',',
    };

    for value in vec {
        vec_string.push(*value as char);
        vec_string.push(delimeter);
    }

    vec_string
}

pub fn path_absolute_form(path: &Path) -> io::Result<PathBuf> {
    if path.is_absolute() {
        return Ok(path.to_path_buf());
    }

    let path = path.strip_prefix(".").unwrap_or(path);
    current_dir().map(|path_buf| path_buf.join(path))
}

pub fn absolute_path(path: &Path) -> io::Result<PathBuf> {
    let path_buf = path_absolute_form(path)?;

    #[cfg(windows)]
    let path_buf = Path::new(
        path_buf
            .as_path()
            .as_string_lossy()
            .trim_start_matches(r"\\?\"),
    )
    .to_path_buf();

    Ok(path_buf)
}

pub fn is_dir(path: &Path) -> bool {
    path.is_dir() && (path.file_name().is_some() || path.canonicalize().is_ok())
}

pub fn is_empty(path: &Path) -> bool {
    match fs::read_dir(path.to_str().unwrap()) {
        Ok(contents) => {
            let len = contents.collect::<Vec<_>>().len();

            if len == 0 {
                return true;
            } else {
                return false;
            }
        }
        Err(e) => {
            panic!("{}", e);
        }
    }
}

pub fn exec_on_home(file: &Path) -> io::Result<PathBuf> {
    let mut home_with_file = PathBuf::new();

    let home = home_dir().unwrap();

    home_with_file.push(home);
    home_with_file.push(file);

    Ok(home_with_file)
}

pub fn str_to_path_buf(s: String) -> io::Result<PathBuf> {
    let mut buf = PathBuf::new();

    buf.push(s);

    Ok(buf)
}

pub struct CloneArgs {
    pub url: String,
    pub base_path: String,
    pub ssh_key_path: String,
    pub repo_name: String,
}

pub struct GitState {
    progress: Option<Progress<'static>>,
    total: usize,
    current: usize,
    path: Option<PathBuf>,
    newline: bool,
}

fn print_git_state(state: &mut GitState) {
    let stats = state.progress.as_ref().unwrap();
    let network_pct = (100 * stats.received_objects()) / stats.total_objects();
    let index_pct = (100 * stats.indexed_objects()) / stats.total_objects();
    let co_pct = if state.total > 0 {
        (100 * state.current) / state.total
    } else {
        0
    };
    let kbytes = stats.received_bytes() / 1024;
    if stats.received_objects() == stats.total_objects() {
        if !state.newline {
            println!();
            state.newline = true;
        }
        print!(
            "Resolving deltas {}/{}\r",
            stats.indexed_deltas(),
            stats.total_deltas()
        );
    } else {
        print!(
            "net {:3}% ({:4} kb, {:5}/{:5})  /  idx {:3}% ({:5}/{:5})  \
             /  chk {:3}% ({:4}/{:4}) {}\r",
            network_pct,
            kbytes,
            stats.received_objects(),
            stats.total_objects(),
            index_pct,
            stats.indexed_objects(),
            stats.total_objects(),
            co_pct,
            state.current,
            state.total,
            state
                .path
                .as_ref()
                .map(|s| s.to_string_lossy().into_owned())
                .unwrap_or_default()
        )
    }
    io::stdout().flush().unwrap();
}

pub fn git_clone(args: &CloneArgs) -> Result<(), git2::Error> {
    let state = RefCell::new(GitState {
        progress: None,
        total: 0,
        current: 0,
        path: None,
        newline: false,
    });

    let mut cb = RemoteCallbacks::new();
    cb.credentials(|_, _, _| {
        let credentials =
            auth_ssh_key(args.ssh_key_path.clone()).expect("Failed to get ssh passphrase");
        Ok(credentials)
    });
    cb.transfer_progress(|stats| {
        let mut state = state.borrow_mut();
        state.progress = Some(stats.to_owned());
        print_git_state(&mut *state);
        true
    });

    let mut co = CheckoutBuilder::new();
    co.progress(|path, cur, total| {
        let mut state = state.borrow_mut();
        state.path = path.map(|p| p.to_path_buf());
        state.current = cur;
        state.total = total;
        print_git_state(&mut *state);
    });

    let clone_path: PathBuf = [&args.base_path, &args.repo_name].iter().collect();
    println!("Cloning into: {}", clone_path.as_path().to_str().unwrap());

    let mut fo = FetchOptions::new();
    fo.remote_callbacks(cb);
    RepoBuilder::new()
        .fetch_options(fo)
        // .with_checkout(co)
        .clone(&args.url, clone_path.as_path())?;
    println!("{}", Green.paint("Authentication succesful"));
    println!();

    Ok(())
}

fn auth_ssh_key(ssh_key_path: String) -> Result<Cred, &'static str> {
    print!("Enter passphrase for key: ");
    io::stdout().flush().unwrap();

    let passphrase_: String = rpassword::read_password().unwrap();

    let passphrase = match passphrase_.trim_end() {
        "" => None,
        phrase => Some(phrase),
    };

    let private_key_path: PathBuf = [ssh_key_path.clone(), "id_rsa".to_owned()].iter().collect();
    let public_key_path: PathBuf = [ssh_key_path.clone(), "id_rsa.pub".to_owned()]
        .iter()
        .collect();

    println!("{}", private_key_path.as_path().to_str().unwrap());

    let cred = Cred::ssh_key("git", Some(&public_key_path), &private_key_path, passphrase).unwrap();

    Ok(cred)
}
