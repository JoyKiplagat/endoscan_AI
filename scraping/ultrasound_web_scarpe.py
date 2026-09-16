#! pip install tqdm
import os
import re
import time
import hashlib
from pathlib import Path
from urllib.parse import urlparse

import requests
from tqdm import tqdm


# ============================================================
# CONFIGURATION
# ============================================================

OUTPUT_DIR = Path("endometriosis_ultrasound")

# Search terms aimed specifically at positive endometriosis TVUS.
SEARCH_TERMS = [
    "endometriosis ultrasound",
    "endometriosis transvaginal ultrasound",
    "deep endometriosis ultrasound",
    "deep infiltrating endometriosis ultrasound",
    "endometrioma ultrasound",
    "rectosigmoid endometriosis ultrasound",
    "uterosacral ligament endometriosis ultrasound",
]

# File types we actually want.
IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".tif",
    ".tiff",
    ".webp",
    ".dcm",       # DICOM
    ".nii",
    ".nii.gz",
    ".mha",
    ".mhd",
    ".nrrd",
}

VIDEO_EXTENSIONS = {
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
}

# Archives are useful when a dataset packages images together.
ARCHIVE_EXTENSIONS = {
    ".zip",
    ".tar",
    ".gz",
    ".tgz",
    ".7z",
}

# Maximum file size.
# Increase this if you expect very large ultrasound videos.
MAX_FILE_SIZE_GB = 20

MAX_FILE_SIZE = MAX_FILE_SIZE_GB * 1024 ** 3

REQUEST_TIMEOUT = 60

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 "
        "(Endometriosis-Ultrasound-Research-Downloader)"
    )
}


# ============================================================
# HELPERS
# ============================================================

def safe_filename(name: str) -> str:
    """Make a filename safe for Windows/Linux/macOS."""
    name = name.replace("\\", "").replace("/", "")
    name = re.sub(r'[<>:"|?*]', "_", name)
    name = re.sub(r"\s+", " ", name).strip()

    if not name:
        name = "downloaded_file"

    return name


def get_extension(filename: str) -> str:
    """
    Handles .nii.gz correctly.
    """
    filename = filename.lower()

    if filename.endswith(".nii.gz"):
        return ".nii.gz"

    return Path(filename).suffix.lower()


def is_downloadable_file(filename: str) -> bool:
    ext = get_extension(filename)

    return (
        ext in IMAGE_EXTENSIONS
        or ext in VIDEO_EXTENSIONS
        or ext in ARCHIVE_EXTENSIONS
    )


def file_hash(path: Path) -> str:
    """SHA256 hash for duplicate detection."""
    sha = hashlib.sha256()

    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            sha.update(chunk)

    return sha.hexdigest()


def download_file(url: str, destination: Path):
    """
    Stream-download a file with a progress bar.
    """

    destination.parent.mkdir(parents=True, exist_ok=True)

    if destination.exists():
        print(f"[SKIP] Already exists: {destination}")
        return False

    try:
        with requests.get(
            url,
            headers=HEADERS,
            stream=True,
            timeout=REQUEST_TIMEOUT,
            allow_redirects=True,
        ) as response:

            response.raise_for_status()

            content_length = response.headers.get("Content-Length")

            if content_length:
                size = int(content_length)

                if size > MAX_FILE_SIZE:
                    print(
                        f"[SKIP] File too large: "
                        f"{size / 1024**3:.2f} GB"
                    )
                    return False

            with open(destination, "wb") as f:

                total = int(content_length) if content_length else None

                with tqdm(
                    total=total,
                    unit="B",
                    unit_scale=True,
                    desc=destination.name[:50],
                ) as progress:

                    for chunk in response.iter_content(
                        chunk_size=1024 * 1024
                    ):

                        if chunk:
                            f.write(chunk)
                            progress.update(len(chunk))

        print(f"[DOWNLOADED] {destination}")

        return True

    except Exception as e:

        print(f"[ERROR] {url}")
        print(f"        {e}")

        if destination.exists():
            destination.unlink()

        return False


# ============================================================
# MENDELEY
# ============================================================

def mendeley_dataset_id_from_url(url: str):
    """
    Extracts a Mendeley dataset short ID.

    Example:
        https://data.mendeley.com/datasets/n6h9ptxxmg/1

    returns:
        n6h9ptxxmg
    """

    match = re.search(
        r"data\.mendeley\.com/datasets/([a-zA-Z0-9]+)",
        url,
    )

    return match.group(1) if match else None


def get_mendeley_dataset(dataset_id: str):
    """
    Retrieve public Mendeley dataset metadata.

    Mendeley's public API exposes published dataset metadata
    including files and download information.
    """

    url = f"https://api.mendeley.com/datasets/{dataset_id}"

    headers = {
        **HEADERS,
        "Accept": "application/vnd.mendeley-public-dataset.1+json",
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=REQUEST_TIMEOUT,
    )

    response.raise_for_status()

    return response.json()


def download_mendeley_dataset(dataset_url: str):

    dataset_id = mendeley_dataset_id_from_url(dataset_url)

    if not dataset_id:
        print(f"[Mendeley] Could not parse: {dataset_url}")
        return

    print("\n" + "=" * 70)
    print(f"MENDELEY: {dataset_id}")
    print("=" * 70)

    try:
        dataset = get_mendeley_dataset(dataset_id)

    except Exception as e:
        print(f"[Mendeley] Could not retrieve dataset: {e}")
        return

    print("Name:", dataset.get("name"))
    print("Description:", dataset.get("description"))
    print("Licence:", dataset.get("data_licence", {}).get("short_name"))

    files = dataset.get("files", [])

    if not files:
        print("[Mendeley] No public files exposed by API.")
        return

    for file_info in files:

        filename = (
            file_info.get("filename")
            or file_info.get("name")
            or "unknown"
        )

        if not is_downloadable_file(filename):
            continue

        content_details = file_info.get("content_details", {})

        download_url = content_details.get("download_url")

        if not download_url:
            print(f"[Mendeley] No download URL for {filename}")
            continue

        destination = (
            OUTPUT_DIR
            / "mendeley"
            / safe_filename(filename)
        )

        download_file(download_url, destination)


# ============================================================
# ZENODO
# ============================================================

def search_zenodo(query, size=20):

    url = "https://zenodo.org/api/records"

    params = {
        "q": query,
        "status": "published",
        "size": size,
    }

    response = requests.get(
        url,
        params=params,
        headers=HEADERS,
        timeout=REQUEST_TIMEOUT,
    )

    response.raise_for_status()

    return response.json()


def download_zenodo_record(record):

    record_id = record.get("id")

    title = record.get(
        "metadata",
        {}
    ).get(
        "title",
        "unknown"
    )

    print("\n" + "=" * 70)
    print(f"ZENODO: {record_id}")
    print(f"TITLE: {title}")
    print("=" * 70)

    files = record.get("files", [])

    for file_info in files:

        filename = file_info.get("key") or file_info.get("filename")

        if not filename:
            continue

        if not is_downloadable_file(filename):
            continue

        links = file_info.get("links", {})

        download_url = (
            links.get("self")
            or links.get("download")
        )

        if not download_url:
            continue

        destination = (
            OUTPUT_DIR
            / "zenodo"
            / str(record_id)
            / safe_filename(filename)
        )

        download_file(download_url, destination)


def search_and_download_zenodo():

    for query in SEARCH_TERMS:

        print("\n" + "#" * 70)
        print(f"ZENODO SEARCH: {query}")
        print("#" * 70)

        try:

            data = search_zenodo(query)

            hits = data.get(
                "hits",
                {}
            ).get(
                "hits",
                []
            )

            print(f"Found {len(hits)} records.")

            for record in hits:

                download_zenodo_record(record)

                time.sleep(0.5)

        except Exception as e:

            print(f"[Zenodo] Search failed: {e}")


# ============================================================
# GITHUB
# ============================================================

def github_search_repositories(query, per_page=20):

    url = "https://api.github.com/search/repositories"

    params = {
        "q": query,
        "per_page": per_page,
    }

    response = requests.get(
        url,
        params=params,
        headers={
            **HEADERS,
            "Accept": "application/vnd.github+json",
        },
        timeout=REQUEST_TIMEOUT,
    )

    response.raise_for_status()

    return response.json()


def github_get_tree(owner, repo, branch):

    url = (
        f"https://api.github.com/repos/"
        f"{owner}/{repo}/git/trees/{branch}"
    )

    params = {
        "recursive": "1"
    }

    response = requests.get(
        url,
        params=params,
        headers={
            **HEADERS,
            "Accept": "application/vnd.github+json",
        },
        timeout=REQUEST_TIMEOUT,
    )

    response.raise_for_status()

    return response.json()


def download_github_repository(repo_info):

    full_name = repo_info["full_name"]

    owner, repo = full_name.split("/", 1)

    branch = repo_info.get(
        "default_branch",
        "main"
    )

    print("\n" + "=" * 70)
    print(f"GITHUB: {full_name}")
    print("=" * 70)

    try:

        tree = github_get_tree(
            owner,
            repo,
            branch,
        )

    except Exception as e:

        print(f"[GitHub] Could not retrieve tree: {e}")
        return

    if tree.get("truncated"):
        print(
            "[GitHub] Repository tree was truncated. "
            "Some files may not be visible."
        )

    files = tree.get("tree", [])

    for item in files:

        if item.get("type") != "blob":
            continue

        path = item.get("path", "")

        filename = Path(path).name

        if not is_downloadable_file(filename):
            continue

        # Raw GitHub URL.
        download_url = (
            f"https://raw.githubusercontent.com/"
            f"{owner}/{repo}/{branch}/{path}"
        )

        destination = (
            OUTPUT_DIR
            / "github"
            / safe_filename(repo)
            / path
        )

        download_file(download_url, destination)


def search_and_download_github():

    for query in SEARCH_TERMS:

        github_query = f"{query} in:name,description,readme"

        print("\n" + "#" * 70)
        print(f"GITHUB SEARCH: {github_query}")
        print("#" * 70)

        try:

            data = github_search_repositories(
                github_query
            )

            repositories = data.get(
                "items",
                []
            )

            print(
                f"Found {len(repositories)} repositories."
            )

            for repo in repositories:

                download_github_repository(repo)

                time.sleep(0.5)

        except Exception as e:

            print(f"[GitHub] Search failed: {e}")


# ============================================================
# KNOWN MENDELEY DATASET
# ============================================================

def download_known_mendeley_dataset():

    # The public Mendeley dataset we identified earlier.
    url = (
        "https://data.mendeley.com/"
        "datasets/n6h9ptxxmg/1"
    )

    download_mendeley_dataset(url)


# ============================================================
# MAIN
# ============================================================

def main():

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    print(
        """
============================================================
ENDOMETRIOSIS ULTRASOUND IMAGE DOWNLOADER
============================================================

This program downloads publicly accessible imaging files from:

    Mendeley Data
    Zenodo
    GitHub

Only image/video/medical-imaging/archive files are downloaded.

It does NOT:
    - bypass authentication
    - access private repositories
    - bypass dataset restrictions
    - download papers or metadata as training images
============================================================
"""
    )

    # --------------------------------------------------------
    # 1. Known Mendeley dataset
    # --------------------------------------------------------

    download_known_mendeley_dataset()

    # --------------------------------------------------------
    # 2. Search Zenodo
    # --------------------------------------------------------

    search_and_download_zenodo()

    # --------------------------------------------------------
    # 3. Search GitHub
    # --------------------------------------------------------

    search_and_download_github()

    print("\n" + "=" * 70)
    print("DONE")
    print("=" * 70)

    print(
        f"\nFiles have been saved under:\n"
        f"    {OUTPUT_DIR.resolve()}"
    )


if __name__ == "__main__":
    main()