#!/usr/bin/env python3
"""
Restructure ERP UI into:
  src/modules/<module>/{pages,components,hooks,services,types,schemas,constants,utils,data,stores}
  src/shared/{components,layout,lib,hooks,services,stores,utils,contexts,i18n,translations,styles,assets,pages,types}
  src/routes/  (unchanged location; imports updated)
"""

from __future__ import annotations

import os
import posixpath
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path("/workspace")
SRC = ROOT / "src"

MODULES = [
    "core",
    "crm",
    "finance",
    "hr",
    "inventory",
    "procurement",
    "file",
    "plandev",
    "project",
    "vacancy",
    "settings",
    "list",
    "notification",
    "profile",
    "dashboard",
    "task",
    "auth",
]

LAYER_DIRS = [
    "pages",
    "components",
    "hooks",
    "services",
    "types",
    "schemas",
    "constants",
    "utils",
    "data",
    "stores",
]

# Explicit move rules: (source_relative_to_src, dest_relative_to_src)
MOVE_RULES: list[tuple[str, str]] = [
    # --- modules: standard layers ---
    ("pages/core", "modules/core/pages"),
    ("components/core", "modules/core/components"),
    ("services/core", "modules/core/services"),
    ("types/core", "modules/core/types"),
    ("data/usermgmt", "modules/core/data/usermgmt"),

    ("pages/crm", "modules/crm/pages"),
    ("components/crm", "modules/crm/components"),
    ("services/crm", "modules/crm/services"),
    ("types/crm", "modules/crm/types"),

    ("pages/finance", "modules/finance/pages"),
    ("components/finance", "modules/finance/components"),
    ("services/finance", "modules/finance/services"),
    ("types/finance", "modules/finance/types"),
    ("hooks/finance", "modules/finance/hooks"),
    ("constants/finance", "modules/finance/constants"),
    ("utils/finance", "modules/finance/utils"),

    ("pages/hr", "modules/hr/pages"),
    ("components/hr", "modules/hr/components"),
    ("services/hr", "modules/hr/services"),
    ("types/hr", "modules/hr/types"),
    ("hooks/hr", "modules/hr/hooks"),
    ("schemas/hr", "modules/hr/schemas"),
    ("stores/hr", "modules/hr/stores"),
    ("data/hr", "modules/hr/data"),

    ("pages/inventory", "modules/inventory/pages"),
    ("components/inventory", "modules/inventory/components"),
    ("services/inventory", "modules/inventory/services"),

    ("pages/procurement", "modules/procurement/pages"),
    ("components/procurement", "modules/procurement/components"),
    ("services/procurement", "modules/procurement/services"),
    ("types/procurement", "modules/procurement/types"),
    ("hooks/procurement", "modules/procurement/hooks"),
    ("constants/procurement", "modules/procurement/constants"),

    ("pages/File", "modules/file/pages"),
    ("components/file", "modules/file/components"),
    ("services/file", "modules/file/services"),
    ("services/fileManagement", "modules/file/services/fileManagement"),
    ("types/file", "modules/file/types"),
    ("constants/file", "modules/file/constants"),
    ("utils/file", "modules/file/utils"),
    ("data/file", "modules/file/data"),

    ("pages/plandev", "modules/plandev/pages"),
    ("services/plandev", "modules/plandev/services"),
    ("types/plandev", "modules/plandev/types"),

    ("pages/projectmanagement", "modules/project/pages"),

    ("pages/vacancy", "modules/vacancy/pages"),
    ("components/vacancy", "modules/vacancy/components"),

    ("pages/settings", "modules/settings/pages"),
    ("components/settings", "modules/settings/components"),

    ("components/List", "modules/list/components"),
    ("services/List", "modules/list/services"),
    ("types/List", "modules/list/types"),
    ("types/NameList", "modules/list/types/NameList"),
    ("data/list", "modules/list/data"),

    ("components/Notification", "modules/notification/components"),
    ("services/notification", "modules/notification/services"),

    ("components/profile", "modules/profile/components"),
    ("services/profile", "modules/profile/services"),
    ("types/profile", "modules/profile/types"),
    ("stores/profile", "modules/profile/stores"),

    ("components/Dashboard", "modules/dashboard/components"),
    ("services/task", "modules/task/services"),

    ("services/auth", "modules/auth/services"),
    ("types/auth", "modules/auth/types"),

    # --- module dashboards from pages/modules ---
    ("pages/modules/HR.tsx", "modules/hr/pages/ModuleDashboard.tsx"),
    ("pages/modules/Core.tsx", "modules/core/pages/ModuleDashboard.tsx"),
    ("pages/modules/Finance.tsx", "modules/finance/pages/ModuleDashboard.tsx"),
    ("pages/modules/CRM.tsx", "modules/crm/pages/ModuleDashboard.tsx"),
    ("pages/modules/Inventory.tsx", "modules/inventory/pages/ModuleDashboard.tsx"),
    ("pages/modules/Procurement.tsx", "modules/procurement/pages/ModuleDashboard.tsx"),
    ("pages/modules/File.tsx", "modules/file/pages/ModuleDashboard.tsx"),
    ("pages/modules/PlanDev.tsx", "modules/plandev/pages/ModuleDashboard.tsx"),
    ("pages/modules/ProjectManagement.tsx", "modules/project/pages/ModuleDashboard.tsx"),

    # --- loose pages into modules ---
    ("pages/profile.tsx", "modules/profile/pages/ProfilePage.tsx"),
    ("pages/NotificationSettings.tsx", "modules/notification/pages/NotificationSettings.tsx"),
    ("pages/TaskManagement.tsx", "modules/task/pages/TaskManagement.tsx"),
    ("pages/EditTaskPage.tsx", "modules/task/pages/EditTaskPage.tsx"),
    ("pages/SignInPage.tsx", "modules/auth/pages/SignInPage.tsx"),
    ("pages/Setup.tsx", "modules/auth/pages/Setup.tsx"),

    # --- shared ---
    ("components/ui", "shared/components/ui"),
    ("components/magicui", "shared/components/magicui"),
    ("components/ProtectedRoute.tsx", "shared/components/ProtectedRoute.tsx"),
    ("components/ErrorBoundary.tsx", "shared/components/ErrorBoundary.tsx"),
    ("components/login-form.tsx", "shared/components/login-form.tsx"),
    ("components/modal.tsx", "shared/components/modal.tsx"),
    ("components/Calender.tsx", "shared/components/Calender.tsx"),
    ("components/Honeycomb.tsx", "shared/components/Honeycomb.tsx"),
    ("components/Honeycomb.css", "shared/components/Honeycomb.css"),
    ("components/ModulesSection.tsx", "shared/components/ModulesSection.tsx"),
    ("layout", "shared/layout"),
    ("lib", "shared/lib"),
    ("contexts", "shared/contexts"),
    ("i18n", "shared/i18n"),
    ("translations", "shared/translations"),
    ("styles", "shared/styles"),
    ("assets", "shared/assets"),
    ("services/cache", "shared/services/cache"),
    ("services/api.ts", "shared/services/api.ts"),
    ("services/auth.api.ts", "shared/services/auth.api.ts"),
    ("services/signalr.service.ts", "shared/services/signalr.service.ts"),
    ("services/routingService.ts", "shared/services/routingService.ts"),
    ("services/employeeService.ts", "modules/hr/services/employeeService.ts"),
    ("pages/NotFoundPage.tsx", "shared/pages/NotFoundPage.tsx"),
    ("pages/Modules.tsx", "shared/pages/Modules.tsx"),
    ("pages/TestMenuTreePage.tsx", "shared/pages/TestMenuTreePage.tsx"),
    ("pages/public", "shared/pages/public"),
    ("stores/auth.store.ts", "shared/stores/auth.store.ts"),
    ("stores/theme.store.ts", "shared/stores/theme.store.ts"),
    ("stores/sidebar.store.ts", "shared/stores/sidebar.store.ts"),
    ("stores/permissionStore.ts", "shared/stores/permissionStore.ts"),
    ("stores/module.store.ts", "shared/stores/module.store.ts"),
    ("stores/companyConfig.store.ts", "shared/stores/companyConfig.store.ts"),
    ("utils/token.utils.ts", "shared/utils/token.utils.ts"),
    ("utils/jwt.utils.ts", "shared/utils/jwt.utils.ts"),
    ("utils/format-date.ts", "shared/utils/format-date.ts"),
    ("utils/dateUtils.ts", "shared/utils/dateUtils.ts"),
    ("utils/auth.utils.ts", "modules/auth/utils/auth.utils.ts"),
    ("utils/amharic-regex.ts", "shared/utils/amharic-regex.ts"),
    ("types/enum.ts", "shared/types/enum.ts"),

    # root types that belong to modules
    ("types/vacancy.ts", "modules/vacancy/types/vacancy.ts"),
    ("types/jobgrade.ts", "modules/hr/types/jobgrade.ts"),
    ("types/fiscalYear.ts", "modules/core/types/fiscalYear.ts"),
    ("types/employee.ts", "modules/hr/types/employee.ts"),
    ("types/department.ts", "modules/core/types/department.ts"),
    ("types/crm.ts", "modules/crm/types/crm.ts"),
    ("types/coreTypes.ts", "modules/core/types/coreTypes.ts"),
    ("types/candidate.ts", "modules/hr/types/candidate.ts"),
    ("types/campaign.ts", "modules/crm/types/campaign.ts"),
    ("types/branches.ts", "modules/core/types/branches.ts"),

    # root data
    ("data/fiscalYear.ts", "modules/core/data/fiscalYear.ts"),
    ("data/dummybranches.ts", "modules/core/data/dummybranches.ts"),
    ("data/department.ts", "modules/core/data/department.ts"),
    ("data/data.ts", "shared/data/data.ts"),
    ("data/crmMockData.ts", "modules/crm/data/crmMockData.ts"),
    ("data/company.ts", "modules/core/data/company.ts"),
    ("data/company-branches.ts", "modules/core/data/company-branches.ts"),

    # shared/root hooks
    ("hooks/useDebounce.ts", "shared/hooks/useDebounce.ts"),
    ("hooks/useMediaQuery.ts", "shared/hooks/useMediaQuery.ts"),
    ("hooks/useToast.ts", "shared/hooks/useToast.ts"),
    ("hooks/useGenericPaginatedData.ts", "shared/hooks/useGenericPaginatedData.ts"),
    ("hooks/useDataScope.ts", "shared/hooks/useDataScope.ts"),
    ("hooks/useUserScope.ts", "shared/hooks/useUserScope.ts"),
    ("hooks/useReportExport.ts", "shared/hooks/useReportExport.ts"),
    ("hooks/useNotifications.ts", "modules/notification/hooks/useNotifications.ts"),
    ("hooks/useCrmData.ts", "modules/crm/hooks/useCrmData.ts"),
    ("hooks/useCRMSettings.ts", "modules/crm/hooks/useCRMSettings.ts"),
    ("hooks/useEmployees.ts", "modules/hr/hooks/useEmployees.ts"),
    ("hooks/usePaginatedEmployees.ts", "modules/hr/hooks/usePaginatedEmployees.ts"),
    ("hooks/usePeriodClosing.ts", "modules/finance/hooks/usePeriodClosing.ts"),
]

# Longest-prefix directory remaps for imports that don't hit an exact file key
PREFIX_RULES = sorted(MOVE_RULES, key=lambda x: len(x[0]), reverse=True)

# Case aliases seen in imports
CASE_ALIASES = {
    "pages/file": "pages/File",
    "components/list": "components/List",
    "services/list": "services/List",
    "types/list": "types/List",
    "components/notification": "components/Notification",
    "components/dashboard": "components/Dashboard",
}


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def git_mv(src: Path, dest: Path) -> None:
    ensure_dir(dest.parent)
    if not src.exists():
        return
    if dest.exists():
        if src.is_dir() and dest.is_dir():
            for child in list(src.iterdir()):
                git_mv(child, dest / child.name)
            try:
                src.rmdir()
            except OSError:
                shutil.rmtree(src, ignore_errors=True)
            return
        raise FileExistsError(f"Destination exists: {dest}")
    result = subprocess.run(
        ["git", "mv", str(src), str(dest)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        ensure_dir(dest.parent)
        shutil.move(str(src), str(dest))


def create_skeleton() -> None:
    for mod in MODULES:
        for layer in LAYER_DIRS:
            ensure_dir(SRC / "modules" / mod / layer)
    for sub in [
        "components/ui",
        "components/magicui",
        "layout",
        "lib",
        "hooks",
        "services",
        "stores",
        "utils",
        "contexts",
        "i18n",
        "translations",
        "styles",
        "assets",
        "pages/public",
        "types",
        "data",
    ]:
        ensure_dir(SRC / "shared" / sub)


def collect_files(base: Path) -> list[Path]:
    if not base.exists():
        return []
    if base.is_file():
        return [base]
    return [p for p in base.rglob("*") if p.is_file()]


def build_path_map() -> dict[str, str]:
    mapping: dict[str, str] = {}
    for src_rel, dest_rel in MOVE_RULES:
        src_path = SRC / src_rel
        if not src_path.exists():
            continue
        for f in collect_files(src_path):
            old_rel = f.relative_to(SRC).as_posix()
            if src_path.is_file():
                new_rel = dest_rel
            else:
                suffix = f.relative_to(src_path).as_posix()
                new_rel = f"{dest_rel}/{suffix}" if suffix != "." else dest_rel
            mapping[old_rel] = new_rel
    return mapping


def apply_moves() -> None:
    rules = sorted(MOVE_RULES, key=lambda x: len(x[0]), reverse=True)
    for src_rel, dest_rel in rules:
        src_path = SRC / src_rel
        dest_path = SRC / dest_rel
        if not src_path.exists():
            continue
        print(f"MOVE {src_rel} -> {dest_rel}")
        git_mv(src_path, dest_path)


CODE_EXTS = (".tsx", ".ts", ".jsx", ".js", ".css")


def strip_ext(rel: str) -> str:
    for ext in (".tsx", ".ts", ".jsx", ".js"):
        if rel.endswith(ext):
            return rel[: -len(ext)]
    return rel


def has_code_ext(rel: str) -> bool:
    return rel.endswith(CODE_EXTS)


def normalize_case(logical: str) -> list[str]:
    """Return logical path plus known case variants."""
    variants = [logical]
    for old, new in CASE_ALIASES.items():
        if logical == old or logical.startswith(old + "/"):
            variants.append(new + logical[len(old) :])
    return variants


def lookup_mapped(logical: str, path_map: dict[str, str]) -> str | None:
    """Map an extensionless or exact src-relative logical path to new location (usually extensionless)."""
    variants = []
    for v in normalize_case(logical):
        variants.append(v)
        # NOTE: Path(v).suffix is wrong for names like auth.store (suffix=".store")
        if not has_code_ext(v):
            variants.extend(
                [
                    v + ".ts",
                    v + ".tsx",
                    v + ".js",
                    v + ".jsx",
                    v + ".css",
                    v + "/index.ts",
                    v + "/index.tsx",
                ]
            )

    for c in variants:
        if c in path_map:
            mapped = path_map[c]
            # Preserve .css; strip code extensions for TS/JS imports
            if mapped.endswith(".css") or logical.endswith(".css"):
                return mapped
            return strip_ext(mapped)

    # Prefix remap via MOVE_RULES
    for v in normalize_case(logical):
        for src_prefix, dest_prefix in PREFIX_RULES:
            if v == src_prefix or v.startswith(src_prefix + "/"):
                suffix = v[len(src_prefix) :].lstrip("/")
                mapped = f"{dest_prefix}/{suffix}" if suffix else dest_prefix
                if mapped.endswith((".ts", ".tsx", ".js", ".jsx")) and not logical.endswith(
                    (".ts", ".tsx", ".js", ".jsx", ".css")
                ):
                    return strip_ext(mapped)
                return mapped
    return None


KNOWN_SRC_ROOTS = {
    "pages",
    "components",
    "services",
    "hooks",
    "types",
    "layout",
    "lib",
    "contexts",
    "i18n",
    "stores",
    "utils",
    "constants",
    "schemas",
    "data",
    "translations",
    "styles",
    "assets",
    "routes",
    "modules",
    "shared",
}


def resolve_logical_from_old(
    old_rel: str, import_path: str, path_map: dict[str, str] | None = None
) -> str | None:
    if import_path.startswith("@/"):
        return posixpath.normpath(import_path[2:])
    if import_path.startswith("."):
        base_dir = posixpath.dirname(old_rel)
        logical = posixpath.normpath(posixpath.join(base_dir, import_path))
        # Fallback for imports with incorrect ../ depth that still clearly
        # target a former src-root layer (pages/components/services/...).
        stripped = import_path
        while stripped.startswith("../"):
            stripped = stripped[3:]
        while stripped.startswith("./"):
            stripped = stripped[2:]
        stripped = posixpath.normpath(stripped)
        first = stripped.split("/", 1)[0]
        if first in KNOWN_SRC_ROOTS and path_map is not None:
            if lookup_mapped(logical, path_map) is None and lookup_mapped(stripped, path_map) is not None:
                return stripped
        elif first in KNOWN_SRC_ROOTS and path_map is None:
            if logical.split("/", 1)[0] not in KNOWN_SRC_ROOTS or logical.startswith(
                (
                    "components/pages/",
                    "components/services/",
                    "components/types/",
                    "components/layout/",
                    "components/data/",
                    "components/contexts/",
                    "pages/components/",
                    "pages/services/",
                    "pages/types/",
                    "pages/contexts/",
                    "pages/layout/",
                    "pages/data/",
                    "services/types/",
                    "services/services/",
                )
            ):
                return stripped
        return logical
    return None


IMPORT_PATTERNS = [
    # import/export ... from 'path' (supports multiline named imports)
    re.compile(
        r"(?P<prefix>(?:import|export)(?:\s+type)?\s+(?:type\s+)?"
        r"(?:[^'\"\n]+?|\{[\s\S]*?\})\s+from\s+)"
        r"(?P<quote>['\"])(?P<path>[^'\"]+)(?P=quote)"
    ),
    # import 'path'
    re.compile(
        r"(?P<prefix>import\s+)(?P<quote>['\"])(?P<path>[^'\"]+)(?P=quote)"
    ),
    # export * from 'path' / export {} from
    re.compile(
        r"(?P<prefix>export\s+(?:\*|\{[^}]*\})\s+from\s+)(?P<quote>['\"])(?P<path>[^'\"]+)(?P=quote)"
    ),
    # dynamic import('path') / require('path')
    re.compile(
        r"(?P<prefix>\b(?:import|require)\(\s*)(?P<quote>['\"])(?P<path>[^'\"]+)(?P=quote)"
    ),
]


def rewrite_file(path: Path, old_rel: str, path_map: dict[str, str]) -> bool:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return False

    changed = False

    def map_one(import_path: str) -> str | None:
        logical = resolve_logical_from_old(old_rel, import_path, path_map)
        if logical is None:
            return None
        mapped = lookup_mapped(logical, path_map)
        if mapped is None:
            # Extra HR leave alias used by older services
            if logical in {"types/leaverequest", "types/leaverequest.ts"}:
                mapped = "modules/hr/types/leaverequest"
            elif logical in {
                "components/TimeClockDisplay",
                "components/TimeClockDisplay.tsx",
            }:
                mapped = "modules/hr/components/attendance/TimeClockDisplay"
        if mapped is None:
            return None
        new_imp = f"@/{mapped}"
        return new_imp if new_imp != import_path else None

    def apply_pattern(pattern: re.Pattern[str], content: str) -> str:
        nonlocal changed

        def repl(m: re.Match[str]) -> str:
            nonlocal changed
            old_path = m.group("path")
            new_path = map_one(old_path)
            if new_path:
                changed = True
                return f"{m.group('prefix')}{m.group('quote')}{new_path}{m.group('quote')}"
            return m.group(0)

        return pattern.sub(repl, content)

    new_text = text
    for pattern in IMPORT_PATTERNS:
        new_text = apply_pattern(pattern, new_text)

    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        return True
    return changed


def rewrite_all(path_map: dict[str, str]) -> int:
    reverse = {v: k for k, v in path_map.items()}
    count = 0
    code_files = [
        p
        for p in SRC.rglob("*")
        if p.is_file() and p.suffix in {".ts", ".tsx", ".js", ".jsx"}
    ]
    for path in code_files:
        new_rel = path.relative_to(SRC).as_posix()
        old_rel = reverse.get(new_rel, new_rel)
        if rewrite_file(path, old_rel, path_map):
            count += 1
    return count


def cleanup_empty() -> None:
    for name in [
        "components",
        "pages",
        "services",
        "hooks",
        "types",
        "constants",
        "schemas",
        "utils",
        "data",
        "stores",
        "layout",
        "lib",
        "contexts",
        "i18n",
        "translations",
        "styles",
        "assets",
    ]:
        p = SRC / name
        if p.exists() and p.is_dir():
            for sub in sorted(p.rglob("*"), reverse=True):
                if sub.is_dir():
                    try:
                        sub.rmdir()
                    except OSError:
                        pass
            try:
                p.rmdir()
                print(f"REMOVED empty {name}/")
            except OSError:
                leftovers = [x for x in p.rglob("*") if x.is_file()]
                if leftovers:
                    print(f"KEEP {name}/ leftovers: {[x.relative_to(SRC).as_posix() for x in leftovers[:20]]}")


def update_components_json() -> None:
    path = ROOT / "components.json"
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    text = text.replace('"components": "@/components"', '"components": "@/shared/components"')
    text = text.replace('"utils": "@/lib/utils"', '"utils": "@/shared/lib/utils"')
    text = text.replace('"ui": "@/components/ui"', '"ui": "@/shared/components/ui"')
    text = text.replace('"lib": "@/lib"', '"lib": "@/shared/lib"')
    text = text.replace('"hooks": "@/hooks"', '"hooks": "@/shared/hooks"')
    path.write_text(text, encoding="utf-8")


def main() -> None:
    os.chdir(ROOT)
    print("Creating skeleton...")
    create_skeleton()
    print("Building path map (pre-move)...")
    path_map = build_path_map()
    print(f"Mapped {len(path_map)} files")
    map_file = ROOT / "scripts/path-map.txt"
    ensure_dir(map_file.parent)
    map_file.write_text(
        "\n".join(f"{k} => {v}" for k, v in sorted(path_map.items())),
        encoding="utf-8",
    )
    print("Applying moves...")
    apply_moves()
    print("Rewriting imports...")
    n = rewrite_all(path_map)
    print(f"Rewrote {n} files")
    cleanup_empty()
    update_components_json()
    print("Done.")


if __name__ == "__main__":
    main()
