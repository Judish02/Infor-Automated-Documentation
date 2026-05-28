# DES-030 Generation Workflow

End-to-end procedure for producing a DES-030 (Deployment & Promotion Guide) `.docx` from a
DES-020 Technical Specification plus physical deliverables.

This file is the **single procedural source of truth**. Skill identity and runtime rules
live in `../skill.md`. Project context (user, folders, glossary) lives in `../CLAUDE.md`.

> **Generation strategy (important): COPY + EDIT, do NOT build from scratch.**
> The DES-030 is produced by copying the closest reference `.docx` and making targeted
> string replacements inside its `word/document.xml`. Never use `docx-js` / `gen.js` to
> build a new document — the styling will not match the project standard.

Toolchain: **PowerShell** (`Expand-Archive` / `Compress-Archive`) + the **Edit** tool for
in-place XML string replacement. **No Node.js / docx-js. No Python.**

---

## Step 0 — Prerequisites

PowerShell (`Expand-Archive` / `Compress-Archive`) is built into Windows — nothing to
install. The `docx` Claude skill provides reference patterns for editing `.docx` XML, but
no external dependency is invoked during generation.

Skip Step 0 from Step 1 onward.

---

## Step 1 — Locate inputs

> **Convention** — *"generate the DES-030"* (or any equivalent phrasing, in EN or FR)
> always means **the DES-020 currently sitting in `../02_Current_Target/`**. Do not ask
> the user where the file is.

- Look in `../02_Current_Target/` for the active `DES020_*.docx`.
- **Exactly one** `DES020_*.docx` → use it.
- **Multiple** `DES020_*.docx` → list them and ask the user to pick one. Do not guess.
- **Zero** `DES020_*.docx` → halt and tell the user the folder is empty.
- Note whether a partial `DES030_*.docx` already exists there (update vs. create).
- Note any deliverable component files on disk (`Composants` / `Delivery Components`
  folder, or loose `.zap` / `.xml` / `.groovy` / etc.) — these supplement what Step 5
  extracts from the DES-020 body.

---

## Step 2 — Read & parse the DES-020

A `.docx` is a ZIP archive. Extract `word/document.xml` and read text directly — no Python,
no Pandoc:

```powershell
# PowerShell: copy to .zip, expand, then read the XML
Copy-Item "..\02_Current_Target\DES020_<name>.docx" "$env:TEMP\des020.zip" -Force
Expand-Archive "$env:TEMP\des020.zip" "$env:TEMP\des020_unpacked" -Force
Get-Content "$env:TEMP\des020_unpacked\word\document.xml" -Raw
```

(Optional — if Pandoc happens to be installed, `pandoc input.docx -o spec.md` is faster.)

### Attribute extraction matrix

Pull these from the DES-020 header / document control block:

| Attribute | Source |
|---|---|
| **WRICEF ID & Name** | filename + document control block (e.g. `5058-IE-TDX-01-CDV`, `U002 - Gestion Franco`) |
| **Flow Direction** | `IN` (Entrant) / `OUT` (Sortant) |
| **Flow Type code** | `A` File / Scheduled · `E` Event-Triggered · `X` XtendM3 Extension |
| **System Topology** | Source system + Target system named explicitly in the DES-020 |
| **Architectural Class** | `A` ION WRICEF / `B` Pure XtendM3 — auto-detected from content |
| **Author** | exact name from the DES-020 document control block |
| **Date** | today's date (`YYYY-MM-DD`) |

---

## Step 3 — Detect architectural class

- **Class A · ION WRICEF** — DES-020 mentions MEC, ION Desk, Event Hub, Document Flow,
  Object Schema → ION-based deployment.
- **Class B · Pure XtendM3 / Ariane** — DES-020 mentions XtendM3 extensions, API
  transactions, pack / unpack scripts → M3 Business Engine extension layer.

Detection is automatic from content. Do not ask the user to choose.

---

## Step 4 — Pick the source template (highest match first)

The output is built by **copying** this template and editing it in place. Choose the
first source that matches:

1. **An existing DES-030 in `../02_Current_Target/`** for the same WRICEF (often a prior
   version, e.g. `DES030_<WRICEF>_v2 1.docx`) — strongest match, use as template.
2. **The closest reference in `../01_Reference_Examples/`** matching flow class +
   direction:

   | Input looks like | Reference to mirror |
   |---|---|
   | Outbound event interface | `001_OUT_E ...` |
   | Inbound file interface | `002_IN_A` |
   | Outbound file interface | `008_OUT_A` |
   | Numbered vendor interface | `5057_*`, `5286-*`, `5296_*` |
   | Custom workflow / extension | `U002`, `U-005`, `U-009`, ... |

Open the chosen template and capture its existing values that you will need to replace:
old version string, old date(s), old author, old deliverable filenames. The chosen
template is **read-only** — never edit it in place. Always copy first.

---

## Step 5 — Inventory deliverables (MANDATORY confirmation gate)

This step **must complete with explicit user confirmation** before Step 6 runs.

### 5.1 Extract proposed deliverables from the DES-020

Scan the DES-020 body for every component the interface needs. Look for:

- explicit filename references (`*.zap`, `*.xml`, `*.zip`, `*.lson`, `*.json`, `*.groovy`,
  `*.java`) inside body paragraphs, tables, and figure captions;
- technical patterns implying components even when no filename is given
  (MEC mapper → `.lson` / `.xml`; ION import → `.zap`; Document Flow → `.xml`;
  Object Schema → `.zip`; XtendM3 Transaction → `.json`; Monitor → `.xml`;
  Custom BOD / Agreement → `.zap`);
- any deliverable files already on disk in `../02_Current_Target/` (treat as authoritative
  over deduced ones).

### 5.2 Present the table to the user for confirmation

Output **in the chat** (not in the `.docx` yet) a Markdown table with the exact column
headers `Type` and `Fichier`. Example shape:

```
| Type                          | Fichier                                              |
|-------------------------------|------------------------------------------------------|
| Custom BOD / Agreement        | M3EDI_M3EDISalesOrderCustom_Load_In_2_13_0.zap       |
| Object Schema                 | M3EDISalesOrderCustom.zip                            |
| ION Mapping                   | M3EDISalesOrderCustomLoadMapping.xml                 |
| Object Schema (Notification)  | M3IECNotification.zip                                |
| Document Flow                 | Spoon_LoadM3EDISalesOrderCustom.xml                  |
| Monitor                       | Spoon_M3EDISalesOrderCustomNotification.xml          |
```

Then **halt and wait**. The user may:

- **confirm** (e.g. *"ok"*, *"confirmé"*, *"go"*, *"générer"*) → proceed to Step 6;
- **modify** a row (change a `Type` or `Fichier` value) → update the table and re-display
  it for confirmation;
- **add** a row → append it and re-display;
- **delete** a row → drop it and re-display.

Do not move to Step 6 until the user issues a confirmation phrase.

### 5.3 Component type vocabulary

Use these canonical `Type` labels (extend only when the DES-020 forces it):

| Type label | Typical extension | Class |
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

The confirmed table becomes DES-030 Section 4 (*Objets Livrables et Extensions*) verbatim.

### 5.4 Non-interactive bypass

Only when the user has explicitly forced a non-interactive run (*"sans confirmation"*,
*"non-interactive"*, *"skip prompts"*) skip the wait at 5.2 and proceed directly to Step
6, marking each deduced row `[Déduit du DES-020 — à confirmer]` in Section 4.

---

## Step 6 — Generate the DES-030 (`.docx`) by COPY + EDIT

**Do not build a new document with `docx-js`.** Copy the template chosen in Step 4 and
edit its XML in place. This guarantees the styling matches the project standard exactly
(fonts, colors, header layout, Infor logo, table designs, TOC, etc.).

### 6.0 Procedure (PowerShell — runs without permission prompts in this project)

```powershell
$src = "..\02_Current_Target\<chosen-template>.docx"
$out = "..\02_Current_Target\DES-030_<WRICEF_ID>_<System>_<Name>_V<X_Y>.docx"
$work = "$env:TEMP\des030_build"

# 1. Copy the template to the output location
Copy-Item $src $out -Force

# 2. Unzip the copy into a working folder
if (Test-Path $work) { Remove-Item $work -Recurse -Force }
Copy-Item $out "$env:TEMP\des030_build.zip" -Force
Expand-Archive "$env:TEMP\des030_build.zip" $work -Force

# 3. (next: use the Edit tool on $work\word\document.xml — see 6.4)

# 4. After XML edits, re-zip and replace the .docx
Remove-Item $out -Force
Compress-Archive -Path "$work\*" -DestinationPath "$env:TEMP\des030_build.zip" -Force
Move-Item "$env:TEMP\des030_build.zip" $out -Force
```

### 6.1 Required DES-030 section schema (must already exist in the template)

1. **CONTROLE DU DOCUMENT**
   - Table 1: `Version | Date | Author | Description of Change` (English keys, French
     content).
   - Table 2: `Reviewers | Approvers` (with role).
2. **INTRODUCTION & OBJECTIF** — French summary of the DEV → TEST / PROD migration
   objective for this WRICEF.
3. **PREREQUIS ET DEPENDANCES SYSTEME** — environmental prerequisites. If Event Hub
   composite events are used, inject explicit verification sub-steps for `CMS042` and
   `CMS045`.
4. **OBJETS LIVRABLES ET EXTENSIONS** — table of every physical deliverable, mapped to
   Infor Component Category and Platform Tool (from Step 5).
5. **INSTRUCTIONS DE DEPLOIEMENT ET D'INSTALLATION** — chronological deployment steps,
   branched by class:
   - **Class A · ION WRICEF** — file import sequence into ION Desk, activation order,
     connection-string updates, document-flow publishing.
   - **Class B · Pure XtendM3 / Ariane** — pack / unpack script execution, configuration
     loading, compilation and activation in the M3 Business Engine extension layer.
6. **VALIDATION & TESTS POST-DEPLOYMENT** — verify the component is online, listening,
   and processing a test payload without structural errors.
7. **PROCESSUS DE PROMOTION** — DEV → TEST → PROD promotion workflow with sign-off gates.
8. **PROCEDURE DE ROLLBACK** — recovery procedure if deployment fails.
9. **APPROBATIONS & SIGNATURES** — sign-off table.

### 6.2 Language & formatting rules

- **Body text:** French, formally precise, technical, imperative voice
  (*"Importer le fichier..."*, *"Vérifier la présence de..."*).
- **Document control / system attributes:** English keys (Version, Date, Author, etc.)
  with French values where natural.
- **Format:** `.docx` only. No `.doc`, no PDF.
- **Styling:** inherited from the template — do NOT override fonts, colors, header
  layout, or table designs. The template IS the style reference.

### 6.3 XML edits to apply in `$work\word\document.xml`

The template already has the correct styling, sections, and tables. Apply only the
minimal find-and-replace edits below using the **Edit** tool:

| Replace | With |
|---|---|
| Old version string (e.g. `1.0`, `V1.0`) wherever it appears in the document-control table | New version |
| Old creation date / last update date | Today's date in `DD/MM/YYYY` (FR format) |
| Old author name | New author (if different) |
| Old WRICEF ID / name | New WRICEF ID / name (if different) |
| Old deliverable filenames in Section 4 table | Confirmed Step 5 filenames |
| Old description-of-change cell | French summary of why this version exists |

Also edit `$work\word\header*.xml` and `$work\word\footer*.xml` for the same WRICEF /
version substitutions.

For uncertain values (e.g. unknown `.zap` version, missing approver name), inject a red
placeholder run inside the relevant XML cell:

```xml
<w:r><w:rPr><w:b/><w:color w:val="C00000"/></w:rPr><w:t>[À COMPLÉTER — &lt;hint&gt;]</w:t></w:r>
```

The Edit tool's exact-string replace is the right primitive — keep edits small and
targeted, never rewrite whole sections.


---

## Step 7 — Write output

Save to `../02_Current_Target/` as:

```
DES-030_[WRICEF_ID]_[System]_[Name]_V1_0.docx
```

---

## Step 8 — Validate

- Open the generated `.docx` in Word — visually confirm sections, headers, footers,
  tables match the template.
- ZIP-integrity check: `Expand-Archive` the output once; confirm `word/document.xml`
  loads without error.
- Confirm: deliverables table matches the user-confirmed Step 5 table verbatim, version
  + date are correct, no leftover template-version markers remain.

---

## Hard rules (project-wide — see also `../skill.md`)

- No Python. Ignore `gen_5058*.py` and `generate_des030_ariane.py` — they are legacy.
- `01_Reference_Examples/` is read-only ground truth — never modify.
- Use `[Insérer ...]` placeholders only when the source genuinely lacks the info.
- See `../CLAUDE.md` for project context and `../skill.md` for the skill identity and
  runtime rules.
