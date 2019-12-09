import argparse
import base64
import hashlib
import json
import logging
import os
import subprocess
import sys
from typing import Dict, List

import requests
from Crypto import Random
from Crypto.Cipher import AES

logging.basicConfig(level=logging.INFO)

# --- global constants
LOGGER = logging.getLogger("Monkey")
PARAMS = {"repo": "", "username": "", "ssh": False, "repo_folder_name": ""}
BLOCK_SIZE = 16
CONFIG_PATH = os.path.expanduser("~/.monkey")
CONFIG_FILE = "monkey.json"
PASSWORD_FILE = "passwords.json"

# -------------------- UTIL FUNCTIONS


def _read_config() -> None:
    global PARAMS
    config_path = _fuzzy_take("monkey.json", _list_config_dir(full=True))

    if config_path:
        with open(config_path, "r") as params:
            PARAMS = json.load(params)
    else:
        _handle_error("Couldn't find file in that path")


def _update_config(key: str, value: str) -> None:
    global PARAMS
    config_path = _fuzzy_take("monkey.json", _list_config_dir(full=True))

    if config_path:
        with open(config_path, "r+") as params:
            data = json.load(params)
            data[key] = value
            params.seek(0)
            json.dump(data, params, indent=4)
            PARAMS = data
            params.truncate()
    else:
        _handle_error("Couldn't find file in that path")


def _take(needle: str, haystack: List[str]) -> str or None:
    for strand in haystack:
        if needle == strand:
            return needle

    return None


def _fuzzy_take(needle: str, haystack: List[str]) -> str or None:
    for strand in haystack:
        if needle in strand:
            return needle

    return None


# -------------------- END UTIL FUNCTIONS

# -------------------- CRYPTO FUNCTIONS


def _pad_bytes(s: str):
    return s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * chr(
        BLOCK_SIZE - len(s) % BLOCK_SIZE
    )


def _unpad_bytes(s: str):
    return s[: -ord(s[len(s) - 1 :])]


def _encrypt(password: str, encryption_password: str):
    private_key = hashlib.sha256(encryption_password.encode("utf-8")).digest()
    raw = _pad_bytes(password)
    iv = Random.new().read(AES.block_size)
    cipher = AES.new(private_key, AES.MODE_CBC, iv)
    return base64.b64encode(iv + cipher.encrypt(raw))


def _decrypt(enc: str, encryption_password: str):
    private_key = hashlib.sha256(encryption_password.encode("utf-8")).digest()
    enc = base64.b64decode(enc)
    iv = enc[:16]
    cipher = AES.new(private_key, AES.MODE_CBC, iv)
    return _unpad_bytes(cipher.decrypt(enc[16:]))


# ------------------- END CRYPTO FUNCTIONS

# ------------------- GITHUB FUNCTIONS


def _check_repo_status():
    """
    This function sucks.
    """
    out = _pipe_subprocess(["git", "status"])
    if "Changes not staged for commit" in out:
        print("Pending changes found, committing")
        _pipe_subprocess(["git", "add", "."])
        _pipe_subprocess(["git", "commit", f"-m 'Update {PASSWORD_FILE}'"])
        _pipe_subprocess(["git", "push"])
        return True
    elif "Your branch is up to date with" in out:
        return False


def _clone_repo():
    if "@" not in PARAMS.repo:
        print("You should really be using ssh for your repositories...")
        start = f"https://github.com/{PARAMS.username}/"
        PARAMS.repo_folder_name = PARAMS.repo[len(start) :].replace(".git", "")
    else:
        start = f"git@github.com:{PARAMS.username}"
        PARAMS.repo_folder_name = PARAMS.repo[len(start) :].replace(".git", "")

    print(f"Repo folder name configured as: {PARAMS.repo_folder_name}")

    out = _pipe_subprocess(["git", "clone", PARAMS.repo, CONFIG_PATH])

    print("Repository cloned successfully")

    if "ERROR: Repository not found." in out:
        _handle_error("No repo found by this name")


def _parse_url(url: str) -> str:
    contains_http_starter = url.startswith("https://")
    # Probably good if you have this
    if contains_http_starter and "github.com" in url:
        return url

    if "github.com" not in url:
        raise ValueError("This is not a valid git URL")

    if not contains_http_starter:
        return "https://" + url


# ------------------- END GITHUB FUNCTIONS


def _pipe_subprocess(cmd: List[str] or str):
    proc = subprocess.check_output(cmd)

    return str(proc)


def _handle_error(e: str) -> None:
    """
    calls __repr__ on an error since we know what the
    stack trace will be already
    """
    print(f"{str(e)}, exiting program")
    sys.exit(1)


def _change_password(key: str, password: str = None):
    path = os.path.expanduser(f"~/.monkey/monkey_crypt/{PASSWORD_FILE}")

    if not password:
        password = input("No password passed, please enter it here: ")
        proceed = input(f"Password is: {password}, is this correct?: (Y/n)")

        if proceed == "n" or proceed == "N":
            _handle_error("Password not accepted, no changes made")

    with open(path, "r+") as passwords:
        data = json.load(passwords)
        if key in data:
            data[key] = _encrypt(password)
        passwords.seek(0)
        json.dump(data, passwords, indent=4)
        passwords.truncate()


def _list_config_dir(full: bool = False):
    try:
        if not full:
            files = os.listdir(CONFIG_PATH)
            return files
        else:
            return sorted(
                [
                    os.path.join(CONFIG_PATH, file)
                    for file in os.listdir(CONFIG_PATH)
                ],
                key=os.path.getctime,
            )
    except Exception as e:
        _handle_error(e)


def read_config_file() -> Dict[str, str]:
    config_file_params = []

    file = _take("CONFIG_FILE", _list_config_dir())

    if not file:
        _handle_error("No config file found, did you run setup?")

    with open(file) as f:
        content = f.readlines()
        config_file_params = [x.strip() for x in content]

    # Parse out those parameters
    return {key: value for key, value in config_file_params}


def fetch_git(url: str):
    try:
        # Ping to make sure it's a valid git url
        valid_url = requests.get(_parse_url(url)).ok

        if not valid_url:
            _handle_error("Url is valid, but returns a non 200 response code")

    except Exception as e:
        _handle_error(e)


def setup() -> bool:
    if _take("CONFIG_FILE", _list_config_dir()) is not None:
        _handle_error("Config file found, please run --wipe first")

    print("Making config directory")
    os.mkdir(CONFIG_PATH)

    print("Setting up configs")
    repo = input("Which github repository is this?: ")
    if not repo:
        _handle_error("wtf bro")

    if repo.startswith("git@github.com"):
        PARAMS.ssh = True

    username = input("What is your github username?: ")
    if not username:
        _handle_error("WTF bro")

    with open(f"{CONFIG_PATH}/{CONFIG_FILE}") as cfg:
        json.dump(PARAMS, cfg)

    print("Config file created, downloading github repository")


def wipe() -> bool:
    print("Warning, this will require you to reconfigure your monkey")
    proceed = input("Continue? (y/N)")

    if not proceed:
        sys.exit(0)

    if proceed == "y" or proceed == "Y":
        try:
            os.rmdir(CONFIG_PATH)
        except Exception:
            print(f"Failed to remove: {CONFIG_PATH}, for some reason")

    return True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="The non-criminal password manager"
    )

    parser.add_argument("repo", action="store", help="Password storage repo")
    parser.add_argument(
        "--setup", action="store_true", help="Configure environment"
    )
    parser.add_argument(
        "--wipe", action="store_true", help="Throw away local cred storage"
    )


def map_args():
    args = parse_args()

    if args.setup:
        setup()

    if args.wipe:
        wipe()

    if args.repo:
        fetch_git(args.repo)


if __name__ == "__main__":
    sys.exit(0 if map_args() else 1)
