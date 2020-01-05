use lscolors::LsColors;

pub struct MonkeyOptions {
    /// See passwords
    pub see: Option<String>,

    /// List all passwords
    pub all: bool,

    /// Copy the password to clipboard
    pub cp: String,

    /// Init monkey on your filesystem
    pub init: bool,

    /// Add password to list
    pub add: (String, String),

    /// Sync passwords upstream
    pub sync: bool,

    /// Delete a password
    pub delete: String,

    /// Delete without confirming
    pub no_confirm: bool,

    /// Wipe monkey instance from filesystem
    pub forest_fire: bool,

    /// Use LS_COLORS
    pub ls_colors: Option<LsColors>,
}
