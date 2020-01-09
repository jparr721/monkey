pub mod add;
pub mod delete;
pub mod fire;
pub mod init;
pub mod see;
pub mod sync;
pub mod utils;

macro_rules! print_error_and_exit {
    ($($arg:tt)*) => {
        print_error!($($arg)*);
        ::std::process::exit(1);
    };
}

