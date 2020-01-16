pub mod handlers;
pub mod opts;
pub mod crypto;

#[macro_export]
macro_rules! print_error {
    ($($arg:tt)*) => (eprintln!("[monkey error]: {}", format!($($arg)*)))
}

#[macro_export]
macro_rules! print_error_and_exit {
    ($($arg:tt)*) => {
        {
            print_error!($($arg)*);
            ::std::process::exit(1);
        }
    };
}
