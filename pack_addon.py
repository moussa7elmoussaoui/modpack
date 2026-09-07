import os
import sys
import zipfile
from pathlib import Path


def pack():
    base = Path(__file__).resolve().parent
    output = base / "modpack.mcaddon"
    folders = ("BP", "RP")

    missing = [f for f in folders if not (base / f).is_dir()]
    if missing:
        sys.exit(f"Error: missing required folder(s): {', '.join(missing)}")

    files = []
    for folder in folders:
        for root, _, filenames in os.walk(base / folder):
            for name in filenames:
                files.append(Path(root, name))

    if not files:
        sys.exit("Error: no files found in BP/RP — nothing to pack.")

    total = len(files)
    bar_width = 30

    def draw(i):
        filled = bar_width * i // total
        bar = "#" * filled + "-" * (bar_width - filled)
        print(f"\r[{bar}] {i}/{total} files", end="", flush=True)

    try:
        with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as zf:
            for i, file in enumerate(files, 1):
                zf.write(file, file.relative_to(base))
                draw(i)
    except PermissionError:
        print()
        output.unlink(missing_ok=True)
        sys.exit(f"Error: permission denied writing '{output.name}'.")
    except KeyboardInterrupt:
        print()
        output.unlink(missing_ok=True)
        sys.exit("Cancelled — removed incomplete archive.")
    except OSError as e:
        print()
        output.unlink(missing_ok=True)
        sys.exit(f"Error: failed to create '{output.name}': {e}")

    print(f"\nDone — packed {total} files into {output.name}")


if __name__ == "__main__":
    pack()
