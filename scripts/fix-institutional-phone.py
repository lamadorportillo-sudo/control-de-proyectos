#!/usr/bin/env python3
"""Corrige el teléfono institucional en todos los formatos Word del repositorio.

- DOCX: revisa todos los XML del paquete y corrige texto aun cuando el número
  esté dividido entre varios nodos w:t.
- DOC legado: reemplaza la cadena en ANSI y UTF-16LE conservando exactamente
  la longitud binaria del archivo.

El proceso es idempotente y no altera archivos que ya están correctos.
"""
from __future__ import annotations

import io
import os
import sys
import tempfile
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SCAN_DIRS = (ROOT / "templates", ROOT / "assets" / "formats")
WRONG = "9865-2258"
CORRECT = "9864-2006"
WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
TEXT_TAG = f"{{{WORD_NS}}}t"


def replace_across_text_nodes(xml_bytes: bytes) -> tuple[bytes, int]:
    """Reemplaza WRONG en el texto lógico concatenado de nodos w:t."""
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        count = xml_bytes.count(WRONG.encode("utf-8"))
        return xml_bytes.replace(WRONG.encode("utf-8"), CORRECT.encode("utf-8")), count

    nodes = [node for node in root.iter() if node.tag == TEXT_TAG]
    if not nodes:
        count = xml_bytes.count(WRONG.encode("utf-8"))
        return xml_bytes.replace(WRONG.encode("utf-8"), CORRECT.encode("utf-8")), count

    changed = 0
    while True:
        text = "".join(node.text or "" for node in nodes)
        pos = text.find(WRONG)
        if pos < 0:
            break
        end = pos + len(WRONG)
        cursor = 0
        start_idx = end_idx = None
        start_off = end_off = 0
        for idx, node in enumerate(nodes):
            value = node.text or ""
            nxt = cursor + len(value)
            if start_idx is None and pos >= cursor and pos < nxt:
                start_idx, start_off = idx, pos - cursor
            if end > cursor and end <= nxt:
                end_idx, end_off = idx, end - cursor
                break
            cursor = nxt
        if start_idx is None or end_idx is None:
            break
        if start_idx == end_idx:
            value = nodes[start_idx].text or ""
            nodes[start_idx].text = value[:start_off] + CORRECT + value[end_off:]
        else:
            first = nodes[start_idx].text or ""
            last = nodes[end_idx].text or ""
            nodes[start_idx].text = first[:start_off] + CORRECT
            for idx in range(start_idx + 1, end_idx):
                nodes[idx].text = ""
            nodes[end_idx].text = last[end_off:]
        changed += 1

    if not changed:
        # Algunos productores Word pueden dejar el texto fuera de w:t.
        raw_count = xml_bytes.count(WRONG.encode("utf-8"))
        if raw_count:
            return xml_bytes.replace(WRONG.encode("utf-8"), CORRECT.encode("utf-8")), raw_count
        return xml_bytes, 0

    ET.register_namespace("w", WORD_NS)
    out = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    return out, changed


def patch_docx(path: Path) -> int:
    total = 0
    with zipfile.ZipFile(path, "r") as zin:
        entries: list[tuple[zipfile.ZipInfo, bytes]] = []
        for info in zin.infolist():
            data = zin.read(info.filename)
            if info.filename.lower().endswith(".xml"):
                data, count = replace_across_text_nodes(data)
                total += count
            entries.append((info, data))
    if not total:
        return 0

    fd, tmp_name = tempfile.mkstemp(prefix=path.stem + "-", suffix=".docx", dir=str(path.parent))
    os.close(fd)
    tmp = Path(tmp_name)
    try:
        with zipfile.ZipFile(tmp, "w") as zout:
            for info, data in entries:
                clone = zipfile.ZipInfo(info.filename, info.date_time)
                clone.compress_type = info.compress_type
                clone.comment = info.comment
                clone.extra = info.extra
                clone.internal_attr = info.internal_attr
                clone.external_attr = info.external_attr
                clone.create_system = info.create_system
                clone.flag_bits = info.flag_bits
                zout.writestr(clone, data)
        # Validación mínima de integridad antes de sustituir el original.
        with zipfile.ZipFile(tmp, "r") as check:
            bad = check.testzip()
            if bad:
                raise RuntimeError(f"DOCX inválido después de corregir {path}: {bad}")
            if "[Content_Types].xml" not in check.namelist():
                raise RuntimeError(f"DOCX sin [Content_Types].xml: {path}")
        tmp.replace(path)
    finally:
        if tmp.exists():
            tmp.unlink()
    return total


def patch_legacy_doc(path: Path) -> int:
    data = path.read_bytes()
    count = 0
    for encoding in ("ascii", "utf-16le"):
        wrong = WRONG.encode(encoding)
        correct = CORRECT.encode(encoding)
        hits = data.count(wrong)
        if hits:
            # Ambas cadenas tienen la misma longitud: no cambia offsets internos.
            if len(wrong) != len(correct):
                raise RuntimeError("El reemplazo binario debe conservar la longitud.")
            data = data.replace(wrong, correct)
            count += hits
    if count:
        path.write_bytes(data)
    return count


def main() -> int:
    files: list[Path] = []
    for folder in SCAN_DIRS:
        if not folder.exists():
            continue
        files.extend(p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in {".doc", ".docx"})

    changed_files: list[tuple[Path, int]] = []
    failures: list[tuple[Path, str]] = []
    for path in sorted(files):
        try:
            count = patch_docx(path) if path.suffix.lower() == ".docx" else patch_legacy_doc(path)
            if count:
                changed_files.append((path, count))
        except Exception as exc:  # noqa: BLE001
            failures.append((path, str(exc)))

    print(f"Formatos Word revisados: {len(files)}")
    print(f"Archivos corregidos: {len(changed_files)}")
    print(f"Reemplazos realizados: {sum(count for _, count in changed_files)}")
    for path, count in changed_files:
        print(f"  CORREGIDO {path.relative_to(ROOT)} ({count})")

    if failures:
        for path, message in failures:
            print(f"  ERROR {path.relative_to(ROOT)}: {message}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
