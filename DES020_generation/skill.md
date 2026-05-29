---
name: des020-generator
description: >
  Generate DES-020 (Technical Design Specification) Word documents for Infor M3/ION WRICEF
  interfaces and XtendM3 custom APIs. Use this skill whenever the user wants to create a DES-020
  document, mentions a WRICEF interface or XtendM3 API, asks to generate design or technical
  documentation from an ANA-050, or says things like "generate the DES020", "create the design
  spec", or "document this interface / API". Also trigger when the user uploads or references
  an ANA-050 file and asks to produce any output document from it.
---

# DES-020 Generator Skill

Generates DES-020 (Spécification de Conception) Word documents for Infor M3/ION WRICEF
interfaces, based on an ANA-050 analysis specification.

## Context

- **WRICEF**: Workflow, Report, Interface, Conversion, Enhancement, or Form.
- **ANA-050**: Functional analysis spec — business objectives, field mapping, business rules.
- **DES-020**: Technical design spec — triggers, connection points, document flows, MEC Mapper, APIs, BOD structure, error handling.

Documents are written primarily in **French**, output as **Word (.docx)** files.

---

## Generation mode — confirm before doing anything else

The DES-020 can be produced at two points in the project lifecycle. **Always confirm the mode with the user if it is not explicitly stated.**

| Mode | When | Purpose | Inputs available |
|------|------|---------|-----------------|
| **Proposal** | Before development starts | Present the proposed technical solution to the client for sign-off | ANA-050 only — no exported deliverable files exist yet |
| **Documentation** | After development is complete | Formally document what was built for hand-off and archive | ANA-050 + all exported deliverable files (`.zap`, `.xml`, `.zip`, source) |

If the mode is not stated, ask before proceeding:
> "Est-ce un DES-020 de proposition (avant développement) ou de documentation (après développement) ?"

### How mode affects generation

**Proposal mode:**
- Populate all sections from the ANA-050 alone.
- Deliverable filenames are proposed names, not confirmed exported filenames.
- Sections requiring actual artefacts (BOD structure, example file, error screenshots) use `<< à compléter >>` — this is **expected and correct**, not a gap.
- The document is sent to the client for review and approval before development begins.

**Documentation mode:**
- Read every exported deliverable file present before generating.
- Use actual filenames and technical details from the exported files, not proposed ones.
- `<< à compléter >>` only where a specific file was genuinely not provided.

---

## Step 1 — Require Extension Type from User

**Before doing anything else**, the user MUST explicitly state the extension type in their prompt. Claude must NOT infer or guess it from the ANA-050 alone.

Accepted values (case-insensitive):
| What user says | Extension type | Template to use |
|---------------|---------------|----------------|
| "interface IN" / "inbound" | Interface — Inbound | Pattern_DataFlow_In template |
| "interface OUT" / "outbound" | Interface — Outbound | OUT_A or OUT_E sample (ask if not uploaded) |
| "XtendM3" / "xtend" / "custom API" | XtendM3 Custom API | XtendM3 DES-020 template |

**If the user does NOT specify the extension type**, ask before proceeding:
> "Quel est le type d'extension pour ce DES-020 ? Interface (IN ou OUT) ou XtendM3 ?"

**If the XtendM3 template has not been uploaded yet**, ask the user to upload it before generating.

---

## Step 1b — Accept Supporting Extension Components

In addition to the ANA-050, the user may optionally provide **supporting technical files** that allow Claude to populate sections more accurately instead of leaving them blank or using placeholders.

### Supported file types and what to extract from each

| File type | Extension | What to extract |
|-----------|-----------|----------------|
| **MEC/IEC Mapper** | `.zap` | Unzip and read XML inside. Extract: API names called, field mappings (source → target), transformation rules, BOD name, agreement name, mapper name |
| **Document Flow** | `.xml` (ION DF export) | Parse XML. Extract: Document Flow name, Connection Point names, application connections, BOD name, file paths, trigger conditions |
| **BOD / Object Schema** | `.zip`, `.xsd`, `.xml` | Unzip if needed. Extract: BOD noun name, namespace, field names, field types, structure (header/lines), custom fields added |
| **ANA-050** | `.docx` | `extract-text`. Extract: all interface details as per Step 4 |
| **DES-020 sample** | `.docx` | `unpack.py`. Use as template base — extract sectPr, styles, header/footer |
| **H5 Script** | `.js`, `.ts` | Read source. Extract: program code (e.g. MMS025), sort order, button labels, API calls made, field names manipulated |
| **XtendM3 source** | `.groovy`, `.java` | Read source. Extract: transaction name, input/output parameters, APIs called, validation logic, error messages |

### Processing rules
1. **Always read all provided files** before generating — do not skip any attachment.
2. **For `.zap` files**: rename to `.zip` and unzip. Navigate to the mapper XML files inside.
3. **For `.xml` Document Flow files**: parse with Python's `xml.etree.ElementTree`. Extract all `<ConnectionPoint>`, `<Application>`, `<BOD>`, `<DocumentFlow>` elements.
4. **For `.zip` BOD packages**: unzip and look for `.xsd` or `namespace.xml` files to extract field definitions.
5. **Cross-reference** across files: the BOD name in the ANA-050 should match the mapper file name; the Connection Point in the DF should match the CP in the DES-020 section 3.2.
6. **If a file type is not listed above** or cannot be read, note it and proceed with what is available.

### What gets populated from each file

| DES-020 section | Populated from |
|----------------|----------------|
| 3.1 Event Analytics | ANA-050 + Document Flow XML |
| 3.2 Point de Connexion | Document Flow XML (CP name, directory, type) |
| 3.3 Flux de Document | Document Flow XML (DF name, steps, frequency) |
| 3.4 MEC Mapping | `.zap` mapper (agreement name, mapper name, BOD name, logic) |
| 3.5 Détails des APIs | `.zap` mapper (exact APIs called with parameters) |
| 3.6 Manipulation de données | `.zap` mapper (transformation rules, transcos) |
| 4. Structure BOD | BOD `.zip`/`.xsd` (field list, structure, namespaces) |
| 5. Exemple fichier | ANA-050 data structure table + sample values |
| 6. Gestion des erreurs | ANA-050 + XtendM3 source (error messages) |

---

## CRITICAL — Mandatory Field Rules (apply to EVERY generated DES-020, no exceptions)

> **AUTHOR MUST ALWAYS BE BLANK.** This is non-negotiable.
> - In Python generators: `i0_dr(["Auteur", ""], ...)` / `pr("Auteur", "", W)` — always empty string `""`
> - **NEVER** populate Auteur from the ANA-050, from user input, or from any other source
> - **NEVER** use a placeholder like `<< à compléter >>` for Auteur — it must be literally empty
> - This applies to **both** the cover property table **and** all rows in the modification history table
> - Before writing any generator code, verify: every Auteur cell emits `""`

> **DATE MUST ALWAYS BE TODAY'S DATE — computed dynamically.**
> - Always use `import datetime` and set `DATE = datetime.date.today().strftime("%d/%m/%Y")`
> - **NEVER** hardcode a date string like `DATE = "28/05/2025"` — it will go stale
> - Use `DATE` for: cover Date de Création, cover Dernière Mise à jour, and the first row of the modification history table

> **MODIFICATION HISTORY — ONE ROW ONLY (initial document).**
> - The DES-020 is always an initial creation — include **exactly one row**: `[DATE, "", VERSION, "Création"]`
> - **NEVER** copy ANA-050 version history rows (e.g. "V1.0 Première version", "V2.0 Mise à jour") — those belong to the ANA-050, not the DES-020
> - Leave empty filler rows below with `i0_er()` / `er()`

| Field | Rule |
|-------|------|
| **Auteur** | **ALWAYS BLANK** — empty string `""` — no exceptions |
| **Date** | **ALWAYS TODAY** — `datetime.date.today().strftime("%d/%m/%Y")` — never hardcoded |
| **Modification history** | **ONE ROW ONLY** — `[DATE, "", "V1.0", "Création"]` — never copy ANA-050 history |
| Doc Ref | Always from ANA-050 `Référence du Document` — never from template |
| Version | Always `V1.0` — never copy from ANA-050 version |

---

## Step 2 — Gather Inputs

| Input | How to get it |
|-------|--------------|
| ANA-050 | Uploaded .docx — extract with `extract-text` |
| Extension type | **Explicitly stated by user** (Interface IN / Interface OUT / XtendM3) |
| WRICEF ID & name | From ANA-050 header (e.g. `002_OUT_E`, `REFLEX Attendu de Réception`) |
| Direction | IN (inbound) or OUT (outbound) — for interfaces only |
| Type code | See trigger type table below — for interfaces only |
| Source/Target systems | From ANA-050 (e.g. M3 → REFLEX, REFLEX → M3) |
| Author | **ALWAYS BLANK** — empty string `""` — never copy from ANA-050 |
| Creation Date | Always use today's date |
| Doc Ref | Always from ANA-050 `Référence du Document` field — never from template |
| Version | Always `V1.0` — never copy from ANA-050 version |

---

## Step 3 — Identify the Trigger Type (Interfaces only)

This is the most important classification — it determines section 3.1 entirely.

### OUTBOUND trigger types

| Type | Trigger mechanism | How to recognise in ANA-050 |
|------|------------------|-----------------------------|
| **OUT — Batch (scheduled)** | MBM Initiator fired by a scheduler. Configured in **MNS260** (job schedule) and/or **SHS010** (job definition). No human action required — runs automatically at a set time (e.g. every day at 06:00). | ANA-050 mentions a schedule (daily, weekly, at HH:MM), MNS260, SHS010, or "déclenchement automatique". EA document = `MBMInitiator`, operation = `Request`, criteria filters on `Program == 'XXX'` |
| **OUT — Event (table-driven)** | Event Analytics rule fires on a M3 table change (INSERT / UPDATE / DELETE). Human action in M3 (e.g. confirming a PO) triggers it indirectly. | ANA-050 mentions a table (MPLINE, OCLINE, CUGEX1…) and a status/field change condition (e.g. PUSL → 35). EA document = table name or composite event name, operations = UPDATE/CREATE/DELETE |

Both types use **Event Analytics** in ION + **MEC Mapper** + **Document Flow**. The difference is only in *what fires the EA rule*:
- **Batch**: a scheduler fires MBM Initiator → EA rule → MEC → BOD
- **Event**: a table change fires EA rule directly → MEC → BOD

### INBOUND trigger types

| Type | Trigger mechanism |
|------|------------------|
| **IN — File (event)** | REFLEX (or other system) drops a fixed-length file in a directory. MEC File Listener detects it and processes it. |

---

## Step 4 — Analyse the ANA-050

Extract:
- **Direction & trigger type** (see table above)
- **Systems**: source → target
- **BOD name**: Abbreviated, no accents/spaces, add Custom suffix.
  - Good: `REFLEXAttendReceptCustom`, `IPPMvmtsPalettesCustom`
  - Bad: `REFLEXAttenduDeRéceptionCustom`, `IPPMouvementsDePalettesCustom`
- **APIs**: exact names from ANA-050. For date-filtered queries on MPCKLT use `EXPORTMI_Select` not `MWS081MI_LstPacLdgTra`
- **For Batch OUT**: MBM Initiator name, schedule (time, frequency), MNS260/SHS010 program code
- **For Event OUT**: EA rule name, session name, subscribed table/composite event, fields, filter criteria, IsChanged filtering, virtual fields; composite event joined tables if applicable
- **Connection point name**, **Document Flow name**, **MEC Agreement name**, **MEC Mapper name**
- **Data manipulation logic** → section 3.6 (transcos, date construction, counters, field rules). **Keep it light — see section 3.6 rules below**
- **Prerequisites**: object schemas, active EA sessions, MBM Initiator config

---

## Step 5 — Assess Available Inputs Before Generating

| File type | Sections it populates |
|-----------|----------------------|
| ANA-050 only | 1, 2, 3 (fully), 7/8 |
| BOD/XSD schema file | Section 4 (STRUCTURE FICHIER BOD) |
| Example output/input file | Section 5 (EXEMPLE FICHIER) |
| ION/MEC screenshots or error log | Section 6 (GESTION DES ERREURS — examples) |

**Rule — blank sections when no supporting file provided:**
- No BOD/XSD → Section 4: heading + `<< à compléter >>`
- No example file → Section 5: heading + `<< à compléter >>`
- No error screenshot/log → Section 6: narrative text + `<< à compléter >>` for screenshot placeholders
- **Do NOT invent content** for these sections.

---

## Step 6 — Document Structure by Type

### INBOUND (IN — File)
1. Cover + Document Properties
2. CONTROLE DU DOCUMENT
3. PRESENTATION GENERALE (Prérequis, Solution proposée)
4. SPECIFICATION TECHNIQUE
   - 3.1 Déclencheur (file drop trigger table)
   - 3.2 Point de Connexion
   - 3.3 Flux de Document (steps table + fréquence table)
   - 3.4 MEC Mapping : Custom BOD
   - 3.5 Détails des APIs (one h3 + table per API)
   - 3.6 Manipulation de données (if applicable)
5. STRUCTURE FICHIER BOD
6. EXEMPLE FICHIER ENTRANT
7. GESTION DES ERREURS
8. POINTS A DETERMINER

### OUTBOUND — Batch (scheduled via MBM Initiator / MNS260 / SHS010)
1. Cover + Document Properties
2. CONTROLE DU DOCUMENT
3. PRESENTATION GENERALE (Prérequis, Solution proposée)
4. SPECIFICATION TECHNIQUE
   - 3.1 Déclencheurs
     - **h3: Event ANALYTICS** — EA table with `MBMInitiator` as subscribed document, operation `Request`, criteria filtering on `Program == 'CODE'`
     - **h3: MBM Initiator** — paragraph describing the schedule: "Un MBM Initiator est configuré dans **MNS260** pour la gestion du déclencheur. Déclenchement automatique [fréquence] à [heure] (Heure Paris)." + schedule bullet
   - 3.2 Point de Connexion
   - 3.3 Flux de Document (répertoire table + fréquence table + document flow logic)
   - 3.4 MEC Mapping : Custom BOD
   - 3.5 Détails des APIs
   - 3.6 Manipulation de données
5. STRUCTURE FICHIER BOD
6. EXEMPLE FICHIER SORTANTE
7. GESTION DES ERREURS
8. POINTS A DETERMINER

### OUTBOUND — Event (table-driven via Event Analytics)
1. Cover + Document Properties
2. CONTROLE DU DOCUMENT
3. PRESENTATION GENERALE (Prérequis, Solution proposée)
4. SPECIFICATION TECHNIQUE
   - 3.1 Déclencheurs
     - **h3: Event ANALYTICS** — one EA table per rule (numbered 1ᵉʳ, 2ᵉᵐᵉ… Déclencheur)
     - **h3: Composite events** — only if a composite event joins multiple tables; describe the join and trigger condition
   - 3.2 Point de Connexion
   - 3.3 Flux de Document
   - 3.4 MEC Mapping : Custom BOD
   - 3.5 Détails des APIs
   - 3.6 Manipulation de données
5. STRUCTURE FICHIER BOD
6. EXEMPLE FICHIER SORTANTE
7. GESTION DES ERREURS
8. POINTS A DETERMINER

> **Key difference in section 3.1:**
> - Batch: EA table subscribed document = `MBMInitiator`, operation = `Request`, then MBM Initiator subsection with schedule detail
> - Event: EA table subscribed document = table name (e.g. `MPLINE`) or composite event name, operation = `UPDATE`/`CREATE`/`DELETE`, then optional Composite events subsection

---

## Section 3.6 — Manipulation de données: Content Rules

**Keep section 3.6 light.** It exists to flag non-obvious transformations only — not to exhaustively document every field.

### What to INCLUDE
- **Transcodification tables** — one compact 3-column table per transco: M3 value | Target value | Description. Truncate to key rows if > 6 rows, add a note "liste complète à définir dans CRS881/CRS882".
- **Date format conversions** — one sentence (e.g. "Les dates M3 (AAAAMMJJ) sont converties au format DD/MM/YYYY.").
- **Non-trivial business rules** — e.g. fallback logic (CFQA vs ORCA), status mapping (F1A130 → Klee), client code logic (H5N/H4N). One sentence or a small table (≤ 6 rows) per rule.
- **Sequence/counter rules** — one sentence.
- **Field truncation or concatenation** — one sentence only.

### What to EXCLUDE
- A full field-by-field mapping recap table — that belongs in the ANA-050, not the DES-020.
- API parameter details already covered in section 3.5.
- Sub-sections for trivial rules (e.g. "always = 1", direct field copy, empty field).
- Field inventories with type/length columns — keep to the rule, not the inventory.

### Format
- Maximum one h3 per distinct transformation type.
- Each h3: 1 sentence of context + optionally one small table (≤ 6 rows) OR a bullet list (≤ 4 items). Not both.
- Total section 3.6 should be readable in under 1 minute.

---

## Step 7 — Event Analytics Table Format (all OUTBOUND)

The EA table is a special 2-column table (widths **2410 + 6946 DXA**, indent **-10**) with:
- **White borders throughout** (`w:color="FFFFFF"`)
- **Full-width blue section header rows** (colspan=2, fill `00B0F0`, white bold centred): "Session", "Subscribed Event", "Filtering", "Published Event"
- **Data rows**: left = blue (`00B0F0`) bold white label; right = light grey (`F2F2F2`) value
- Row height: 400

### Batch EA table row values
```
[Session]
  Session         | CST_BODNameCustom
  Rules           | MBMInitiator_XXX_OUT_A
[Subscribed Event]
  Publisher       | M3
  Document        | MBMInitiator
  Operations      | Request
  Fields          | Company, Division, PrinterFile, Program, RecipientReference1_Data, ...
[Filtering]
  Criteria        | Program == 'PROGRAM_CODE'
  IsChanged Filtering |  (empty)
[Published Event]
  Publisher       | EventAnalytics
  Document        | Trigger_XXX  (or M3BEBOD)
  Operation       | Create
  Copied Fields   | PrinterFile, Program, RecipientReference1_Data
  Virtual Fields  | CONO: 'Company'  DIVI: 'Division'
```

### Event-driven EA table row values
```
[Session]
  Session         | CST_BODNameCustom
  Rules           | TABLE_UPDATE_CONDITION
[Subscribed Event]
  Publisher       | M3
  Document        | MPLINE  (or composite event name)
  Operations      | UPDATE / CREATE / DELETE
  Fields          | CONO, FIELD1, FIELD2, ...
[Filtering]
  Criteria        | FIELD = 'VALUE' AND ...
  IsChanged Filtering | FIELD
[Published Event]
  Publisher       | EventAnalytics
  Document        | M3BEBOD  (or TimeCorrelation)
  Operation       | Create  (or Update / Copy operation)
  Copied Fields   | CONO, FIELD1, ...
  Virtual Fields  | BODNoun: 'BODName'  BODVerb: 'Sync'  DIVI: 'Division'
```

---

## Step 8 — Create the Word Files

**Uses the standard `docx` skill** — see `.claude/skills/docx/SKILL.md` for full reference.
The generation path is always: **copy reference template → unpack → edit XML → repack**.
Never build from scratch with `docx-js` for DES-020s (styling would not match the project standard).

### Template selection
| Direction | Template to use |
|-----------|----------------|
| IN (any type) | `DES-020_002_IN_A_*.docx` from `./01_Reference_Examples/002_IN_A/` |
| OUT — Batch | `DES-020_008_OUT_A_*.docx` from `./01_Reference_Examples/008_OUT_A/` |
| OUT — Event | `DES-020_001_OUT_E_*.docx` from `./01_Reference_Examples/001_OUT_E .../` |
| XtendM3 WS (English) | User-uploaded `DES020_WS_*.docx` sample |
| XtendM3 Extension (French) | User-uploaded `DES-020_*Extension*.docx` sample |

If the right template is not available, ask the user to upload one. Prefer the **same type** (A for batch, E for event).

### Generation steps

**Step 1 — Unpack the reference template**
```bash
python .claude/skills/docx/scripts/office/unpack.py <reference>.docx unpacked/
```

**Step 2 — Edit XML with the Edit tool**
Use the **Edit tool** for all string replacements inside `unpacked/word/`. Do not write Python scripts for substitutions — the Edit tool shows exactly what is being changed.

Key files to edit:

| File | What to change |
|------|---------------|
| `word/document.xml` | All body content — sections, tables, bullet lists, section text |
| `word/header1.xml` | Doc Ref (from ANA-050 `Référence du Document`), date (today), version (`V1.0`) |
| `word/footer2.xml` | Interface name, file ref |
| `word/_rels/settings.xml.rels` | Remove `<Relationship ... attachedTemplate .../>` |
| `word/settings.xml` | Remove `<w:attachedTemplate .../>` |

**Header date handling** — the date is often split across multiple `<w:t>` runs. Consolidate into a single run:
```xml
<!-- Replace fragmented runs like: <w:t>01</w:t>...<w:t>/01/</w:t>...<w:t>2025</w:t> -->
<!-- With a single run: -->
<w:r><w:t>29/05/2026</w:t></w:r>
```

**Step 3 — Repack**
```bash
python .claude/skills/docx/scripts/office/pack.py unpacked/ output.docx --original <reference>.docx
```
Use `--validate false` only if the template has pre-existing schema quirks.

### CRITICAL XML rules (from standard docx skill)
1. **No HTML tags inside `<w:t>`** — bold = separate `<w:r>` with `<w:rPr><w:b/></w:rPr>`
2. **Escape `<<` and `>>` inside `<w:t>`** as `&lt;&lt;` and `&gt;&gt;`
3. **Whitespace**: add `xml:space="preserve"` on `<w:t>` with leading/trailing spaces
4. **HighlightedVariable** (blue cover text): `<w:rStyle w:val="HighlightedVariable"/>` in `<w:rPr>`
5. **Element order in `<w:pPr>`**: `<w:pStyle>`, `<w:numPr>`, `<w:spacing>`, `<w:ind>`, `<w:jc>`, `<w:rPr>` last
6. **`<w:tcW>` before `<w:gridSpan>`** in `<w:tcPr>` — wrong order = schema error
7. **Use `ShadingType.CLEAR`** (not SOLID) for table cell shading — avoids black backgrounds

### Naming convention
`DES-020_[WRICEF_ID]_[System]_[ShortName]_V1_0.docx`

### Style reference
| Element | Style / colour |
|---------|---------------|
| InforTable0 header row | fill `00B0F0`, white bold text |
| InforTable0 banded rows | fill `E8E8E8` (odd) / white (even) |
| EA table section headers | fill `00B0F0`, white bold, all borders `FFFFFF` |
| EA table data rows | left fill `00B0F0` / right fill `F2F2F2`, all borders `FFFFFF` |
| Heading 1 | `Heading1` — caps, bold, page break before |
| Heading 2 | `Heading2` |
| Heading 3 | `Heading3` |
| Body text | `BodyText` — indent left 1440 |
| Bullet list | `BodyText` + `numId=2`, `ilvl=0` |
| Cover title | `Title-Major` |
| Cover subtitle | `Subject` |
| Blue highlight text | `HighlightedVariable` rStyle (colour `13A3F7`) |
| Placeholder | `<< à compléter >>` colour `888888` |
| Monospace (BOD/code) | `Courier New`, sz=16, indent 1800 |

---

## XtendM3 — Two Template Families

There are **two distinct template families** for XtendM3 DES-020s. Always identify which one applies from the uploaded template before generating.

---

### Family A — WS Templates (English, XtendM3 API only)
Used for: `DES020_WS_OIS100`, `DES020_WS_PDS051`, `DES020_WS_MWS410`, etc.

**Key identifiers**: Document is in English. Cover uses `Title-Major` + `Subject` styles. Naming: `DES020_WS_[Program]_V1_0.docx`.

#### Styles
- **Document/Property tables**: `InforTable` style, `tblW="0" type="auto"`, `tblLook="04A0"`, `tblInd=1440`
  - Header row: `cnfStyle="100000000000"` — `InforTable` firstRow tblStylePr provides blue `13A3F7` bg + white bold text automatically (no explicit fill needed)
  - Data rows: `cnfStyle` oddHBand/evenHBand for `E8E8E8` banding — no explicit shading
  - Property table value cells: colour `00B0F0`
  - Cell spacing: `w:before="60" w:after="60"`, `w:ind w:left="0" w:right="567"`
- **API field tables**: `InforTable` style, same dimensions as property tables
- **CRITICAL tcPr order**: `<w:tcW>` MUST come before `<w:gridSpan>` — wrong order = schema error
- No `<w:tblHeader/>` in `<w:trPr>` — omit entirely

#### Document sections (English)
1. Cover: TitleBar + Subject (API + transaction) + Document Properties + Approvals
2. Section 1 — Document Control: Change Record + Reviewers + High Level Estimation
3. Section 2 — Proposed Solution: Description + Input table + Output table + Diagram
4. Section 3 — Technical Specification: one h2 per transaction → Input + Output + Error Handling

#### Input/Output field table columns (Family A)
`Fields | Description of Field | Type | Length | Decimal | Mandatory`
- Exact column widths: `1535, 1879, 1245, 1445, 1546, 2410` (total 10060 dxa)
- Type: `N`=numeric, `A`=alphanumeric
- Mandatory: `Yes`/`No` (input); omit column or leave blank for output

#### Error Handling table (Family A)
`Condition | Type | RSLT / Message` — widths `3800, 1000, 3822`
- Type: `OK` or `KO`; one OK row + one KO row per validation; listed in execution order

---

### Family B — Extension Templates (French, XtendM3 + H5 Script)
Used for: `DES-020_Génération_EAN13`, custom screen extensions in MMS/PMS programs.

**Key identifiers**: Document is in French. Cover uses `Title-Major` + `Subject`. Contains both H5 Script and XtendM3 components. Naming: `DES-020_[ExtensionName]_V1_0.docx`.

#### Styles
- **Document/Property tables**: `InforTable0` style, `tblW=8903 type=dxa` or `tblW=0 type=auto`, `tblLook="04A0"`, `tblInd=1440`
  - Header row: `cnfStyle="100000000000"` — `InforTable0` firstRow provides blue `00B0F0` bg + white text
  - Data rows: `cnfStyle` oddHBand/evenHBand banding
  - Cell spacing: `w:before="60" w:after="60"`, `w:ind w:left="0" w:right="567"`
- **API field tables**: `PlainTable1` style — **different from property tables**
  - Total width: **10097 dxa** (fixed), **no tblInd** (no left indent)
  - Column widths: `1149, 1854, 817, 1231, 1455, 1514, 2077` (7 columns)
  - Header cells: explicit `fill="00B0F0"`, `Arial` font (`rFonts cs="Arial"`), white text (`color="FFFFFF" themeColor="background1"`), `line="276" lineRule="auto"`, centred, `cnfStyle` on tcPr of first column
  - Data cells: `Arial` font, `sz=20 szCs=20`, `line="360" lineRule="auto"`, centred, `b val=0 bCs val=0`
  - `tblLook="04A0"`, `cnfStyle` on trPr for banding

#### Document sections (French, Family B)
1. Cover: TitleBar + Title-Major + Subject (extension name) + Propriétés du Document + Approbation
2. Section 1 — CONTROLE DU DOCUMENT: Enregistrement des Modifications + Relecteurs
3. Section 2 — PRESENTATION GENERALE: description + Solution proposée + context bullets
4. Section 3 — SPECIFICATION TECHNIQUE:
   - 3.1 Overview — list of components (H5 Script name, XtendM3 name, MDBREADMI transaction)
   - 3.2 Prérequis — prerequisite configuration (MWS050, etc.)
   - 3.3 Diagramme du flux — full end-to-end flow diagram
   - 3.4 Extension — one h3 per component: MDBREADMI, XtendM3, H5 Script (each with description + API table)
   - 3.5 Détails des APIs — one h3 per API called, each with description + API table
5. Section 4 — GESTION DES ERREURS: error table + note
6. Section 5 — POINTS A DETERMINER: bullet list of open items

#### API field table columns (Family B — PlainTable1)
`Champs | Description | Type | Longueur | Sens | Obligatoire | Commentaire`
- Sens: `Entrant` (input) or `Sortant` (output)
- Obligatoire: `O` (oui/mandatory), `N` (non/optional), `-` (output field)

#### Diagram format (both families)
2-column table with:
- **Title row**: full-width, blue `00B0F0` bg (Family A: `13A3F7`), white bold text, centred
- **Section rows**: full-width, grey `D9D9D9` bg, bold centred — e.g. INPUT / VALIDATION / PROCESS / OUTPUT (Family A) or DÉCLENCHEUR / H5 SCRIPT / XTENDM3 / SORTIE (Family B)
- **Data rows**: left col = bold step label (D1, E1, X1, OUT...), right col = description; alternating `F2F2F2` banding
- **Arrow rows**: full-width, centred `↓`
- KO sub-rows omitted from diagram (covered in Error Handling table)
- Widths: left=1400, right=7460; `tblLook="0000"` (no banding via style — manual shading only)

#### Naming convention
- Family A: `DES020_WS_[ProgramCode]_V1_0.docx`
- Family B: `DES-020_[ExtensionName]_V1_0.docx`

#### Multiple transactions (Family A)
- Cover shows all transaction names on separate Subject lines
- Section 2 shows one diagram per transaction, labelled
- Section 3 has one h2 per transaction with its own tables

---

## Step 9 — Deliver

Present the `.docx` file. Note which sections are `<< à compléter >>` and what the user needs to supply (BOD/XSD schema, example file, ION/MEC screenshots).
