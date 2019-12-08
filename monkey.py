import argparse
import logging
import git
import requests
import os
import subprocess
import sys
from typing import Dict, List

logging.basicConfig(level=logging.INFO)
LOGGER = logging.getLogger("Monkey")

PARAMS = {}


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


def _pipe_subprocess(cmd: List[str] or str):
    proc = subprocess.check_output(cmd)

    return str(proc)


def _parse_url(url: str) -> str:
    contains_http_starter = url.startswith("https://")
    # Probably good if you have this
    if contains_http_starter and "github.com" in url:
        return url

    if "github.com" not in url:
        raise ValueError("This is not a valid git URL")

    if not contains_http_starter:
        return "https://" + url


def _handle_error(e: str) -> None:
    """
    calls __repr__ on an error since we know what the
    stack trace will be already
    """
    print(f"{str(e)}, exiting program")
    sys.exit(1)


def _check_repo_status():
    out = _pipe_subprocess(["git", "status"])
    print(out)
    if "Changes not staged for commit" in out:
        print("Pending changes found, committing")
        _pipe_subprocess(["git", "add", "."])
        _pipe_subprocess(["git", "commit",  "-m 'Update password.banana'"])
        _pipe_subprocess(["git", "push"])
    elif "Your branch is up to date with" in out:
        print("No changes found")


def _change_password():
    pass


def _take(needle: str, haystack: List[str]) -> str or None:
    for strand in haystack:
        if needle == strand:
            return needle

    return None


def _list_config_dir(full: bool = False):
    path = os.path.expanduser("~/.monkey")

    try:
        if not full:
            files = os.listdir(path)
            return files
        else:
            return sorted(
                [os.path.join(path, file) for file in os.listdir(path)],
                key=os.path.getctime,
            )
    except Exception as e:
        _handle_error(e)


def read_config_file() -> Dict[str, str]:
    config_file_params = []

    file = _take("monkey.banana", _list_config_dir())

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


def wipe() -> bool:
    print("Warning, this will require you to reconfigure your monkey")
    proceed = input("Continue? (y/N)")

    if not proceed:
        sys.exit(0)

    if proceed == "y" or proceed == "Y":
        files = _list_config_dir(full=True)

        for file in files:
            print(f"Removing: {file}")
            try:
                os.remove(file)
            except Exception:
                print(f"Failed to remove: {file}, for some reason")

    return True


def map_args():
    args = parse_args()

    if args.setup:
        pass

    if args.wipe:
        pass

    if args.repo:
        fetch_git(args.repo)


if __name__ == "__main__":
    # sys.exit(0 if map_args() else 1)
    _check_repo_status()
