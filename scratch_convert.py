import sys
import os

try:
    import fitz  # PyMuPDF
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyMuPDF"])
    import fitz

cert_dir = r"c:\Users\ADDWIN\OneDrive\Desktop\dudu\Portfolio\certificates"
for file in os.listdir(cert_dir):
    if file.lower().endswith(".pdf"):
        pdf_path = os.path.join(cert_dir, file)
        img_path = os.path.join(cert_dir, file[:-4] + ".png")
        if not os.path.exists(img_path):
            doc = fitz.open(pdf_path)
            page = doc.load_page(0)  # first page
            # Render at slightly lower dpi to keep file size small but legible
            pix = page.get_pixmap(dpi=150)
            pix.save(img_path)
            print(f"Converted {file} to PNG")
