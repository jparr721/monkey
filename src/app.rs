use std::collections::HashMap;

use clap::{crate_version, App, AppSettings, Arg};

struct Help {
    short: &'static str,
    long: &'static str,
}

macro_rules! doc {
    ($map:expr, $name:expr, $short:expr) => {
        doc!($map, $name, $short, $short)
    };
    ($map:expr, $name:expr, $short:expr, $long:expr) => {
        $map.insert(
            $name,
            Help {
                short: $short,
                long: concat!($long, "\n "),
            },
        );
    };
}

pub fn build_app() -> App<'static, 'static> {
    let helps = usage();
    let arg = |name| {
        Arg::with_name(name)
            .help(helps[name].short)
            .long_help(helps[name].long)
    };

    let app = App::new("monkey")
        .version(crate_version!())
        .usage("monkey [FLAGS/OPTIONS] [KEY] || [KEY-VALUE]")
        .setting(AppSettings::ColoredHelp)
        .setting(AppSettings::DeriveDisplayOrder)
        .after_help(
            "Note: `monkey -h` prints a short and concise overview while `monkey --help` \
             gives all the details.",
        )
        .arg(
            arg("see")
                .long("see")
                .short("S")
                .takes_value(true)
                .value_name("key"),
        )
        .arg(
            arg("all")
                .help("List all passwords")
                .conflicts_with("cp")
                .requires("see"),
        )
        .arg(
            arg("cp")
                .help("Copy selected password to clipboard")
                .conflicts_with("all")
                .requires("see"),
        )
        .arg(arg("init").long("init").short("I").overrides_with("init"))
        .arg(
            arg("add")
                .long("add")
                .short("A")
                .takes_value(true)
                .number_of_values(2)
                .multiple(true),
        )
        .arg(arg("sync").long("sync").short("s").overrides_with("sync"))
        .arg(
            arg("delete")
                .long("delete")
                .short("D")
                .takes_value(true)
                .number_of_values(1)
                .value_name("key"),
        )
        .arg(
            arg("no-confirm")
                .help("Brute-force delete the password by key")
                .requires("delete"),
        )
        .arg(
            arg("forest-fire")
                .long("forest-fire")
                .short("F")
                .overrides_with("forest-fire"),
        )
        .arg(arg("tutorial").long("tutorial").short("T"))
        .arg(
            arg("color")
                .long("color")
                .short("c")
                .takes_value(true)
                .value_name("when")
                .possible_values(&["never", "auto", "always"])
                .hide_possible_values(true),
        );

    app
}

#[rustfmt::skip]
fn usage() -> HashMap<&'static str, Help> {
    let mut h = HashMap::new();
    doc!(h, "see"
        , "See an encrypted password by key"
        , "Goes to the .monkey directory and prompts for a password, upon \
            successful authentication, it will print the desired password to \
            the console, use --all to list all passwords, use --cp to copy \
            to clipboard (cannot be combined with --all).");
    doc!(h, "init"
        , "Initialize the monkey app"
        , "Creates a $HOME/.monkey folder in which the git repo is referenced \
            from and where the passwords are stored to");
    doc!(h, "add"
        , "Add a new password to your list"
        , "Adds a new password to your list in the form (Key, Value)");
    doc!(h, "all"
        , "See all encrypted passwords"
        , "Use this to see all encrypted passwords (following input prompt) that are stores");
    doc!(h, "cp"
        , "Copy output of see command to clipboard"
        , "Adds the output of the see command to your clipboard");
    doc!(h, "sync"
        , "Syncs your passwords with git"
        , "Sync your passwords with the upstream git instance in case you changed \
            from another location");
    doc!(h, "delete"
        , "Delete a password from your list"
        , "Deletes a password by key from the list, you can use --no-confirm to make \
            it delete without validation");
    doc!(h, "no-confirm"
        , "Deletes via key by brute force"
        , "Removes the 'are you sure?' safeguard from a delete operation");
    doc!(h, "forest-fire"
        , "Deletes your entire monkey instance"
        , "Deleted your entire monkey instance irrecoverably, you will need to run 'init' \
            to make monkey work after doing this");
    doc!(h, "color"
        , "When to use colors: never, *auto*, always"
        , "Declare when to use color for the pattern match output:\n  \
             'auto':      show colors if the output goes to an interactive console (default)\n  \
             'never':     do not use colorized output\n  \
             'always':    always use colorized output");
    doc!(h, "tutorial"
        , "Run 'init' and then enter your git repo, then you can start adding passwords"
        , "First, run 'init'.\n Then, you want to run 'monkey add 'key' 'password', which you can do \
            multiple times if you want.\n Then, you can view with 'monkey see'");

    h
}
