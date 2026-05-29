# DES-020 Generation Workflow

End-to-end procedure for producing a DES-020 (Spécification de Conception) `.docx` for
Infor M3 / ION interfaces (IN/OUT) or XtendM3 custom APIs.

This file is the **single procedural source of truth**. Skill identity and runtime rules
live in `../skill.md`. Project context lives in `../CLAUDE.md`.

---

## When is a DES-020 produced?

The DES-020 can be written at two different points in the project lifecycle. The mode
determines what inputs are available and how placeholders are used.

| Mode | Timing | Purpose | What is available |
|------|--------|---------|------------------|
| **Proposal** | Before development starts | Show the client the proposed technical solution for sign-off | ANA-050 only (no deliverable files yet) |
| **Documentation** | After development is complete | Formally document what was built for hand-off, review, and archive | ANA-050 + all exported deliverable files |

**If the user does not specify the mode**, ask:
> "Est-ce un DES-020 de proposition (avant développement) ou de documentation (après développement) ?"

### Proposal mode — key differences
- All technical component sections (section 3.x) are populated from the ANA-050 alone.
- Deliverable filenames are **proposed names**, not confirmed filenames from exported files.
- Sections that require actual exported artefacts (BOD structure, example file, error screenshots) use `<< à compléter >>` placeholders — this is expected and correct.
- The document is presented to the client for review and approval before development begins.

### Documentation mode — key differences
- All available exported deliverable files (`.zap`, `.xml`, `.zip`, source code) are read and cross-referenced.
- Filenames and technical details are taken from the actual exported files, not proposed.
- `<< à compléter >>` placeholders are used only when a specific file was not provided.

> **Generation strategy (both modes):** Template injection — copy the closest reference
> `.docx`, unpack it with `unpack.py`, replace its `<w:body>` with Python-built XML,
> repack with `pack.py`. Never build a document from scratch with `docx-js`.

---

## Step 0 — Prerequisites

- Python 3 available in the environment.
- `unpack.py` and `pack.py` from `.claude/skills/docx/scripts/office/` are on the path.
- The `.docx` skill is loaded (`.claude/skills/docx/SKILL.md`).
- A matching reference template is available (see Step 3).

---

## Step 1 — Require extension type from the user

**Before reading any file**, the user must explicitly state which type of development is
being documented. Claude must NOT infer or guess it.

| What the user says | Extension type |
|--------------------|---------------|
| "interface IN" / "inbound" | Interface — Inbound |
| "interface OUT" / "outbound" | Interface — Outbound |
| "XtendM3" / "xtend" / "custom API" | XtendM3 Custom API |

If not stated, ask:
> "Quel est le type d'extension pour ce DES-020 ? Interface (IN ou OUT) ou XtendM3 ?"

---

## Step 2 — Collect inputs

Place all inputs in `../02_Current_Target/` before starting.

### Mandatory input (both modes)
| File | Purpose |
|------|---------|
| `ANA-050_*.docx` | Functional analysis — business objectives, field mapping, business rules |

### Supporting files — Documentation mode only
These files are exported from the DEV environment after development is complete.
In Proposal mode they do not exist yet — their sections use `<< à compléter >>`.

| File type | Extension | What Claude extracts |
|-----------|-----------|---------------------|
| MEC/IEC Mapper | `.zap` | Rename → `.zip`, unzip. API calls, field mappings, BOD name, agreement name |
| Document Flow | `.xml` | Connection Point names, application connections, BOD name, trigger conditions |
| BOD / Object Schema | `.zip`, `.xsd`, `.xml` | BOD noun, namespace, field list, structure |
| H5 Script | `.js`, `.ts` | Program code, button labels, API calls, field names |
| XtendM3 source | `.groovy`, `.java` | Transaction name, input/output params, validation logic, error messages |

**Read every file present before generating.** More files = fewer `<< à compléter >>` placeholders in the output.

---

## Step 3 — Pick the reference template

Choose by extension type and flow direction:

| Development type | Reference template |
|------------------|--------------------|
| Interface IN (file / scheduled) | `DES-020_002_IN_A_*.docx` in `./01_Reference_Examples/002_IN_A/` |
| Interface OUT — Batch (MBM Initiator) | `DES-020_008_OUT_A_*.docx` in `./01_Reference_Examples/008_OUT_A/` |
| Interface OUT — Event (table-driven EA) | `DES-020_001_OUT_E_*.docx` in `./01_Reference_Examples/001_OUT_E .../` |
| XtendM3 Custom API (English, WS family) | User-uploaded `DES020_WS_*.docx` sample |
| XtendM3 + H5 Script (French, Extension family) | User-uploaded `DES-020_*Extension*.docx` sample |

If a closer match already exists in `../02_Current_Target/` for the same WRICEF, use that instead.

The chosen template is **read-only** — always copy before editing.

---

## Step 4 — Analyse the ANA-050

Unpack the ANA-050 and extract all attributes needed to populate the DES-020:

```powershell
Copy-Item "..\02_Current_Target\ANA-050_*.docx" "$env:TEMP\ana050.zip" -Force
Expand-Archive "$env:TEMP\ana050.zip" "$env:TEMP\ana050_unpacked" -Force
Get-Content "$env:TEMP\ana050_unpacked\word\document.xml" -Raw
```

### Extraction matrix

| Attribute | Source in ANA-050 |
|-----------|------------------|
| WRICEF ID & Name | Header / document control block |
| Flow Direction | IN / OUT |
| Flow Type | `A` File·Scheduled · `E` Event-triggered · `X` XtendM3 |
| Source / Target systems | Systems topology section |
| BOD name | Abbreviated, no accents, `Custom` suffix (e.g. `REFLEXAttendReceptCustom`) |
| Trigger type | Batch (MNS260/SHS010) or Event (table + condition) |
| APIs called | Exact names — never infer; use what ANA-050 states |
| Connection Point, Document Flow, MEC Agreement, MEC Mapper names | Interface spec section |
| Data manipulation rules | Transcos, date conversions, business rules → section 3.6 |
| Doc Ref | `Référence du Document` field — used verbatim in header |

---

## Step 5 — Confirm the component inventory

Before generating, present the component list to the user as a Markdown table:

```
| Type                   | Fichier                                        |
|------------------------|------------------------------------------------|
| Custom BOD / Agreement | M3EDI_M3EDISalesOrderCustom_Load_In_2_13_0.zap |
| Object Schema          | M3EDISalesOrderCustom.zip                      |
| ION Mapping            | M3EDISalesOrderCustomLoadMapping.xml           |
| Document Flow          | Spoon_LoadM3EDISalesOrderCustom.xml            |
| Monitor                | Spoon_M3EDISalesOrderCustomNotification.xml    |
```

**Halt and wait** for confirmation (*"ok"*, *"confirmé"*, *"go"*, *"générer"*) or edits
before proceeding to Step 6.

### Component type vocabulary

| Type label | Extension | Class |
|---|---|---|
| Custom BOD / Agreement | `.zap` | A |
| Object Schema | `.zip` | A |
| Object Schema (Notification) | `.zip` | A |
| ION Mapping | `.xml` | A |
| Document Flow | `.xml` | A |
| Monitor | `.xml` | A |
| MEC Mapper | `.lson` / `.xml` | A |
| Event Analytics | `.xml` | A |
| XtendM3 Transaction | `.json` | B |
| XtendM3 Extension | `.groovy` / `.java` | B |
| Ariane Pack | `.zip` / script | B |

---

## Step 6 — Generate the DES-020 (standard docx skill: unpack → edit → repack)

Uses the standard `docx` skill — see `.claude/skills/docx/SKILL.md` for full reference.

### 6.0 Unpack the reference template

```bash
python .claude/skills/docx/scripts/office/unpack.py <reference>.docx unpacked/
```

### 6.1 Mandatory field rules

| Field | Rule |
|-------|------|
| **Auteur** | **Always blank** — empty `<w:t></w:t>` — never populate from ANA-050 or user input |
| **Date** | **Always today** in `DD/MM/YYYY` — never hardcode a date string |
| **Modification history** | **One row only** — today's date, blank author, `V1.0`, `Création` |
| Doc Ref | From ANA-050 `Référence du Document` — never from template |
| Version | Always `V1.0` |

### 6.2 Edit XML with the Edit tool

Use the **Edit tool** for all substitutions inside `unpacked/word/`. Do not write Python
scripts for XML replacements — the Edit tool is precise and shows exactly what changes.

| File | What to change |
|------|---------------|
| `word/document.xml` | All body sections — cover table, modification history, all section content |
| `word/header1.xml` | Doc Ref, date (today), version (`V1.0`) |
| `word/footer2.xml` | Interface name, file ref |
| `word/_rels/settings.xml.rels` | Remove `<Relationship ... attachedTemplate .../>` |
| `word/settings.xml` | Remove `<w:attachedTemplate .../>` |

Header date is often split across multiple `<w:t>` runs — replace the fragmented runs
with a single `<w:r><w:t>DD/MM/YYYY</w:t></w:r>`.

Follow the document structure for the extension type from `../skill.md` → Step 6.

### 6.3 Repack

```bash
python .claude/skills/docx/scripts/office/pack.py unpacked/ output.docx --original <reference>.docx
```

### 6.5 Sections left blank when no supporting file is provided

| Missing input | Section behaviour |
|---------------|------------------|
| No BOD/XSD | Section 4 STRUCTURE FICHIER BOD: heading + `<< à compléter >>` |
| No example file | Section 5 EXEMPLE FICHIER: heading + `<< à compléter >>` |
| No error log / screenshots | Section 6 GESTION DES ERREURS: narrative text + `<< à compléter >>` for screenshots |

In **Proposal mode**, all three sections above will use `<< à compléter >>` — this is
expected. The client signs off on the proposed design; these sections are completed after
development.

In **Documentation mode**, `<< à compléter >>` is used only when a specific file was not
provided. All available exported files must be read and their content used.

**Do NOT invent content** — leave the placeholder and note what the user must supply.

---

## Step 7 — Write output

Save to `../02_Current_Target/` using the naming convention:

```
DES-020_[WRICEF_ID]_[System]_[ShortName]_V1_0.docx
```

For XtendM3 WS family: `DES020_WS_[ProgramCode]_V1_0.docx`

---

## Step 8 — Validate

Run the standard docx validator before delivering:
```bash
python .claude/skills/docx/scripts/office/validate.py output.docx
```

Then visually confirm:
1. Open in Word — sections, header Doc Ref, footer, and tables render correctly.
2. Auteur cells are empty, date is today, modification history has exactly one row.
3. No leftover template WRICEF identifiers or version strings remain.

---

## Hard rules (see also `../skill.md`)

- **`01_Reference_Examples/`** (under `./`) is read-only — never edit.
- **Auteur always blank.** No exceptions.
- **Date always dynamic** — `datetime.date.today()`. Never hardcode.
- **One modification history row** — `Création` only. Never copy ANA-050 history.
- Use `<< à compléter >>` only when the source genuinely lacks the information.
- See `../CLAUDE.md` for project context and `../skill.md` for the full skill rules.
