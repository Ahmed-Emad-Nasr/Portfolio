# Requires: pip install pikepdf pillow
"""Recompress large images in the case PDFs and set clean metadata.

    npm run pdf:clean              only PDFs not cleaned yet (part of npm run prepare:assets)
    npm run pdf:clean -- --force   every PDF again

A PDF counts as cleaned when its Author and Creator are already AUTHOR and it
has no Producer entry, so a second run touches nothing. Without pikepdf the
script says how to install it and exits 0, so `npm run verify` still runs.

- Author/Creator -> Ahmed Emad Nasr (several reports carried a template
  author's name, a classmate's name, or "Un-named").
- Images over ~150 KB are downscaled to <= 2000 px on the long side and
  re-encoded as JPEG q=82, only when that is actually smaller.
- Images with transparency masks or indexed palettes are left alone.
"""
import io, sys, pathlib
# Windows consoles default to a legacy code page; never crash on a file name
sys.stdout.reconfigure(errors="replace")
try:
    import pikepdf
    from pikepdf import PdfImage, Name
    from PIL import Image
except ImportError:
    print("pdf:clean skipped: needs  pip install -r requirements.txt")
    sys.exit(0)

AUTHOR = "Ahmed Emad Nasr"
MAX_DIM = 2000

def recompress(pdf):
    saved = 0
    for raw in list(pdf.objects):
        if not isinstance(raw, pikepdf.Stream) or raw.get("/Subtype") != Name.Image:
            continue
        if True:
            try:
                if "/SMask" in raw or "/Mask" in raw:
                    continue
                before = len(raw.read_raw_bytes())
                if before < 150_000:
                    continue
                img = PdfImage(raw)
                if img.indexed:
                    continue
                pil = img.as_pil_image()
                if pil.mode not in ("RGB", "L"):
                    pil = pil.convert("RGB")
                w, h = pil.size
                scale = min(1.0, MAX_DIM / max(w, h))
                if scale < 1.0:
                    pil = pil.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
                buf = io.BytesIO()
                pil.save(buf, "JPEG", quality=82, optimize=True)
                data = buf.getvalue()
                if len(data) >= before * 0.6:
                    continue
                raw.write(data, filter=Name.DCTDecode)
                raw.Width, raw.Height = pil.size
                raw.ColorSpace = Name.DeviceGray if pil.mode == "L" else Name.DeviceRGB
                raw.BitsPerComponent = 8
                for k in ("/DecodeParms", "/Decode"):
                    if k in raw:
                        del raw[k]
                saved += before - len(data)
            except Exception as e:  # leave any image we cannot handle untouched
                print("  skip image:", e)
    return saved

def is_clean(f):
    try:
        with pikepdf.open(f) as pdf:
            d = pdf.docinfo
            return str(d.get("/Author", "")) == AUTHOR and str(d.get("/Creator", "")) == AUTHOR and "/Producer" not in d
    except Exception:
        return False

def main(root, force=False):
    total_before = total_after = 0
    skipped = 0
    for f in sorted(pathlib.Path(root).rglob("*.pdf")):
        if f.name.endswith(".tmp.pdf"):
            continue
        if not force and is_clean(f):
            skipped += 1
            continue
        size = f.stat().st_size
        tmp = f.with_suffix(".tmp.pdf")
        with pikepdf.open(f) as pdf:
            saved = recompress(pdf)
            with pdf.open_metadata(set_pikepdf_as_editor=False) as meta:
                meta["dc:creator"] = [AUTHOR]
                if "dc:title" not in meta or not str(meta.get("dc:title", "")).strip():
                    meta["dc:title"] = f.stem.replace("_", " ")
            pdf.docinfo["/Author"] = AUTHOR
            pdf.docinfo["/Creator"] = AUTHOR
            if "/Producer" in pdf.docinfo:
                del pdf.docinfo["/Producer"]
            pdf.save(tmp, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate, recompress_flate=True)
        new = tmp.stat().st_size
        tmp.replace(f)
        total_before += size
        total_after += new
        print(f"{size/1e6:6.1f} MB -> {new/1e6:6.1f} MB  {f.relative_to(root)}")
    print(f"pdf:clean: {skipped} already clean" + (f" | TOTAL {total_before/1e6:.1f} MB -> {total_after/1e6:.1f} MB" if total_before else ""))

main(sys.argv[1], force="--force" in sys.argv)
