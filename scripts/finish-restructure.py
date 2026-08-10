#!/usr/bin/env python3
"""Continue partial restructure: finish moves, then rewrite imports."""

from __future__ import annotations

import importlib.util
import shutil
import subprocess
from pathlib import Path

ROOT = Path("/workspace")
SRC = ROOT / "src"

# Load helpers / rules from main script
SPEC = importlib.util.spec_from_file_location(
    "restructure", ROOT / "scripts/restructure-to-modules.py"
)
assert SPEC and SPEC.loader
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)


def safe_mv(src: Path, dest: Path) -> None:
    if not src.exists():
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        if src.is_dir() and dest.is_dir():
            for child in list(src.iterdir()):
                safe_mv(child, dest / child.name)
            try:
                src.rmdir()
            except OSError:
                shutil.rmtree(src, ignore_errors=True)
            return
        if src.is_file() and dest.is_file():
            # Keep destination; drop duplicate source if same name collision
            # Prefer the types/hr/* version over root types/* for HR domain files.
            print(f"CONFLICT skip existing dest, remove src after backup check: {src} vs {dest}")
            # If src is under leftover types/hr and dest came from root types/, replace dest with src
            src_rel = src.relative_to(SRC).as_posix()
            if src_rel.startswith("types/hr/") or src_rel.startswith("hooks/hr/") or src_rel.startswith("data/hr/"):
                bak = dest.with_suffix(dest.suffix + ".from_root_bak")
                if not bak.exists():
                    dest.rename(bak)
                    print(f"  renamed dest -> {bak.name}, moving src into place")
                    result = subprocess.run(
                        ["git", "mv", str(src), str(dest)],
                        cwd=ROOT,
                        capture_output=True,
                        text=True,
                    )
                    if result.returncode != 0:
                        shutil.move(str(src), str(dest))
                else:
                    src.unlink()
            else:
                # keep dest, remove src
                src.unlink()
            return
        raise FileExistsError(f"Cannot merge {src} -> {dest}")
    result = subprocess.run(
        ["git", "mv", str(src), str(dest)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        shutil.move(str(src), str(dest))
    print(f"MOVED {src.relative_to(SRC)} -> {dest.relative_to(SRC)}")


REMAINING = [
    ("hooks/hr", "modules/hr/hooks"),
    ("types/hr", "modules/hr/types"),
    ("data/hr", "modules/hr/data"),
    ("layout", "shared/layout"),
    ("lib", "shared/lib"),
    ("contexts", "shared/contexts"),
    ("i18n", "shared/i18n"),
    ("styles", "shared/styles"),
    ("assets", "shared/assets"),
]


def rebuild_full_path_map() -> dict[str, str]:
    """Rebuild path map from original MOVE_RULES using path-map.txt if present,
    otherwise reconstruct from rules + current tree via scripts/path-map.txt."""
    map_file = ROOT / "scripts/path-map.txt"
    mapping: dict[str, str] = {}
    if map_file.exists():
        for line in map_file.read_text(encoding="utf-8").splitlines():
            if " => " not in line:
                continue
            old, new = line.split(" => ", 1)
            mapping[old.strip()] = new.strip()
    # Ensure remaining leftovers are represented
    for src_rel, dest_rel in REMAINING + list(mod.MOVE_RULES):
        src_path = SRC / src_rel
        # For already-moved sources, skip
        if not src_path.exists():
            continue
        files = mod.collect_files(src_path)
        for f in files:
            old_rel = f.relative_to(SRC).as_posix()
            # old_rel is CURRENT path for leftovers; we need ORIGINAL old path.
            # For leftovers still in old locations, current == original.
            if src_path.is_file():
                mapping[old_rel] = dest_rel
            else:
                suffix = f.relative_to(src_path).as_posix()
                mapping[old_rel] = f"{dest_rel}/{suffix}" if suffix != "." else dest_rel
    return mapping


def main() -> None:
    # Resolve known conflict first: prefer types/hr/employee.ts over root employee.ts
    conflict_dest = SRC / "modules/hr/types/employee.ts"
    conflict_src = SRC / "types/hr/employee.ts"
    if conflict_dest.exists() and conflict_src.exists():
        bak = SRC / "modules/hr/types/employee.basic.ts"
        if not bak.exists():
            conflict_dest.rename(bak)
            print("Renamed modules/hr/types/employee.ts -> employee.basic.ts")
        safe_mv(conflict_src, conflict_dest)

    # Same for jobgrade if needed
    jg_dest = SRC / "modules/hr/types/jobgrade.ts"
    jg_src = SRC / "types/hr/jobgrade.ts"
    if jg_dest.exists() and jg_src.exists():
        bak = SRC / "modules/hr/types/jobgrade.basic.ts"
        if not bak.exists():
            jg_dest.rename(bak)
            print("Renamed modules/hr/types/jobgrade.ts -> jobgrade.basic.ts")
        safe_mv(jg_src, jg_dest)

    for src_rel, dest_rel in REMAINING:
        src = SRC / src_rel
        dest = SRC / dest_rel
        if src.exists():
            print(f"Finishing {src_rel} -> {dest_rel}")
            safe_mv(src, dest)

    # Clean empty old dirs
    mod.cleanup_empty()

    # Rebuild map and rewrite
    path_map = rebuild_full_path_map()
    # Conflict resolutions
    if (SRC / "modules/hr/types/employee.basic.ts").exists():
        path_map["types/employee.ts"] = "modules/hr/types/employee.basic.ts"
    if (SRC / "modules/hr/types/jobgrade.basic.ts").exists():
        path_map["types/jobgrade.ts"] = "modules/hr/types/jobgrade.basic.ts"
    path_map["types/hr/employee.ts"] = "modules/hr/types/employee.ts"
    if (SRC / "modules/hr/types/jobgrade.ts").exists():
        path_map["types/hr/jobgrade.ts"] = "modules/hr/types/jobgrade.ts"
    print(f"Path map entries: {len(path_map)}")
    n = mod.rewrite_all(path_map)
    print(f"Rewrote {n} files")
    mod.update_components_json()

    # Second pass: simple prefix replacements for any imports still using old paths
    PREFIX_REPLACEMENTS = sorted(
        [
            ("@/components/ui/", "@/shared/components/ui/"),
            ("@/components/magicui/", "@/shared/components/magicui/"),
            ("@/lib/", "@/shared/lib/"),
            ("@/layout/", "@/shared/layout/"),
            ("@/contexts/", "@/shared/contexts/"),
            ("@/i18n", "@/shared/i18n"),
            ("@/stores/", "@/shared/stores/"),
            ("@/services/api", "@/shared/services/api"),
            ("@/services/auth.api", "@/shared/services/auth.api"),
            ("@/services/cache/", "@/shared/services/cache/"),
            ("@/hooks/useDebounce", "@/shared/hooks/useDebounce"),
            ("@/hooks/useToast", "@/shared/hooks/useToast"),
            ("@/hooks/useMediaQuery", "@/shared/hooks/useMediaQuery"),
            ("@/hooks/useGenericPaginatedData", "@/shared/hooks/useGenericPaginatedData"),
            ("@/hooks/useDataScope", "@/shared/hooks/useDataScope"),
            ("@/hooks/useUserScope", "@/shared/hooks/useUserScope"),
            ("@/hooks/useReportExport", "@/shared/hooks/useReportExport"),
            ("@/pages/finance/", "@/modules/finance/pages/"),
            ("@/pages/hr/", "@/modules/hr/pages/"),
            ("@/pages/crm/", "@/modules/crm/pages/"),
            ("@/pages/core/", "@/modules/core/pages/"),
            ("@/pages/inventory/", "@/modules/inventory/pages/"),
            ("@/pages/procurement/", "@/modules/procurement/pages/"),
            ("@/pages/File/", "@/modules/file/pages/"),
            ("@/pages/file/", "@/modules/file/pages/"),
            ("@/pages/plandev/", "@/modules/plandev/pages/"),
            ("@/pages/projectmanagement/", "@/modules/project/pages/"),
            ("@/pages/settings/", "@/modules/settings/pages/"),
            ("@/pages/vacancy/", "@/modules/vacancy/pages/"),
            ("@/components/finance/", "@/modules/finance/components/"),
            ("@/components/hr/", "@/modules/hr/components/"),
            ("@/components/crm/", "@/modules/crm/components/"),
            ("@/components/core/", "@/modules/core/components/"),
            ("@/components/inventory/", "@/modules/inventory/components/"),
            ("@/components/procurement/", "@/modules/procurement/components/"),
            ("@/components/file/", "@/modules/file/components/"),
            ("@/components/settings/", "@/modules/settings/components/"),
            ("@/components/vacancy/", "@/modules/vacancy/components/"),
            ("@/components/profile/", "@/modules/profile/components/"),
            ("@/components/Dashboard/", "@/modules/dashboard/components/"),
            ("@/components/Notification/", "@/modules/notification/components/"),
            ("@/components/List/", "@/modules/list/components/"),
            ("@/services/finance/", "@/modules/finance/services/"),
            ("@/services/hr/", "@/modules/hr/services/"),
            ("@/services/crm/", "@/modules/crm/services/"),
            ("@/services/core/", "@/modules/core/services/"),
            ("@/services/inventory/", "@/modules/inventory/services/"),
            ("@/services/procurement/", "@/modules/procurement/services/"),
            ("@/services/file/", "@/modules/file/services/"),
            ("@/services/fileManagement/", "@/modules/file/services/fileManagement/"),
            ("@/services/plandev/", "@/modules/plandev/services/"),
            ("@/services/auth/", "@/modules/auth/services/"),
            ("@/services/profile/", "@/modules/profile/services/"),
            ("@/services/task/", "@/modules/task/services/"),
            ("@/services/notification/", "@/modules/notification/services/"),
            ("@/services/List/", "@/modules/list/services/"),
            ("@/types/finance/", "@/modules/finance/types/"),
            ("@/types/hr/", "@/modules/hr/types/"),
            ("@/types/crm/", "@/modules/crm/types/"),
            ("@/types/core/", "@/modules/core/types/"),
            ("@/types/procurement/", "@/modules/procurement/types/"),
            ("@/types/file/", "@/modules/file/types/"),
            ("@/types/plandev/", "@/modules/plandev/types/"),
            ("@/types/auth/", "@/modules/auth/types/"),
            ("@/types/profile/", "@/modules/profile/types/"),
            ("@/hooks/finance/", "@/modules/finance/hooks/"),
            ("@/hooks/hr/", "@/modules/hr/hooks/"),
            ("@/hooks/procurement/", "@/modules/procurement/hooks/"),
            ("@/constants/finance/", "@/modules/finance/constants/"),
            ("@/constants/procurement/", "@/modules/procurement/constants/"),
            ("@/constants/file/", "@/modules/file/constants/"),
        ],
        key=lambda x: len(x[0]),
        reverse=True,
    )

    fixed = 0
    for path in SRC.rglob("*"):
        if not path.is_file() or path.suffix not in {".ts", ".tsx", ".js", ".jsx"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        new = text
        for old, newp in PREFIX_REPLACEMENTS:
            if old in new:
                new = new.replace(old, newp)
        if new != text:
            path.write_text(new, encoding="utf-8")
            fixed += 1
    print(f"Prefix-fixed {fixed} files")
    print("Done finishing restructure.")


if __name__ == "__main__":
    main()
