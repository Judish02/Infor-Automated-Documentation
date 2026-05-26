"""
Generate DES-030 for 5074 Ariane OrchestrationDesCommandes
Based on the Doyen DES-030 template (same interface type: XtendM3 only)
"""
import zipfile, re, os

template_path = (
    r"C:\Users\KenyMotean\OneDrive - Spoon Consulting Ltd\Desktop"
    r"\InforAutomatedDES030\01_Reference_Examples"
    r"\5296_Doyen_RFO_OrchestrationDesCommandes"
    r"\DES030_5294_Doyen_OrchestrationDesCommandes.docx"
)
output_path = (
    r"C:\Users\KenyMotean\OneDrive - Spoon Consulting Ltd\Desktop"
    r"\InforAutomatedDES030\02_Current_Target"
    r"\DES030_5074_Ariane_OrchestrationDesCommandes_V1_0.docx"
)

# ── Read all files from template ──────────────────────────────────────────────
with zipfile.ZipFile(template_path, 'r') as z_in:
    all_files = {}
    for name in z_in.namelist():
        all_files[name] = z_in.read(name)

doc_xml = all_files['word/document.xml'].decode('utf-8')

# ── Step 1: Remove unwanted version-history rows BEFORE text replacements ─────
# Row "Mise a jour et deploiement 17/06/25 sur TRN" (v1.1)
doc_xml = re.sub(
    r'<w:tr\b.*?Mise\s*a\s*jour\s*et\s*deploiement.*?</w:tr>',
    '', doc_xml, flags=re.DOTALL
)
# Row "Changement nom transaction" (v1.2)
doc_xml = re.sub(
    r'<w:tr\b.*?Changement\s*nom\s*transaction.*?</w:tr>',
    '', doc_xml, flags=re.DOTALL
)

print("Version history rows removed.")

# ── Step 2: Text replacements ─────────────────────────────────────────────────
# Transaction names (covers both strikethrough and normal text in w:t elements)
doc_xml = doc_xml.replace('RFO_DOYEN', 'RFO_ARIANE')
doc_xml = doc_xml.replace('LstRfoDOYEN', 'LstRfoARIANE')

# Subtitle / project number (safe: only replaces inside w:t element content)
doc_xml = re.sub(
    r'(<w:t\b[^>]*>)([^<]*)(5294)([^<]*)(</w:t>)',
    lambda m: m.group(1) + m.group(2) + '5074' + m.group(4) + m.group(5),
    doc_xml
)

# Dates
doc_xml = doc_xml.replace('30/05/25', '25/05/26')
doc_xml = doc_xml.replace('21/11/25', '25/05/26')

# Version number "1.2" → "1.0" (only when it is the sole content of a w:t element)
doc_xml = re.sub(r'(<w:t\b[^>]*>)1\.2(</w:t>)', r'\g<1>1.0\2', doc_xml)
# Also handle "1.1" → "1.0" (row was removed but clean up if any stray reference)
doc_xml = re.sub(r'(<w:t\b[^>]*>)1\.1(</w:t>)', r'\g<1>1.0\2', doc_xml)

print("Text replacements done.")

# ── Step 3: Update docProps/core.xml metadata ──────────────────────────────────
if 'docProps/core.xml' in all_files:
    core_xml = all_files['docProps/core.xml'].decode('utf-8')
    import re as _re
    # Update last modified date
    core_xml = _re.sub(
        r'<dcterms:modified[^>]*>.*?</dcterms:modified>',
        '<dcterms:modified xsi:type="dcterms:W3CDTF">2026-05-25T00:00:00Z</dcterms:modified>',
        core_xml
    )
    all_files['docProps/core.xml'] = core_xml.encode('utf-8')
    print("docProps/core.xml updated.")

# ── Step 4: Write new docx ────────────────────────────────────────────────────
all_files['word/document.xml'] = doc_xml.encode('utf-8')

os.makedirs(os.path.dirname(output_path), exist_ok=True)

with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as z_out:
    for name, data in all_files.items():
        z_out.writestr(name, data)

print(f"\nGenerated: {output_path}")

# Verification: show key text elements
texts = re.findall(r'<w:t[^>]*>([^<]+)</w:t>', doc_xml)
keywords = ['5074', '5294', 'ARIANE', 'DOYEN', '25/05/26', '30/05/25',
            '21/11/25', '1.0', '1.2', 'Changement nom', 'Mise a jour']
for t in texts:
    t_strip = t.strip()
    if any(kw.lower() in t_strip.lower() for kw in keywords):
        print(f"  {repr(t_strip)}")
