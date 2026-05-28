# DES-030 Generation Workflow

End-to-end procedure for producing a DES-030 (Deployment & Promotion Guide) `.docx` from a
DES-020 Technical Specification plus physical deliverables.

This file is the **single procedural source of truth**. Skill identity and runtime rules
live in `../skill.md`. Project context (user, folders, glossary) lives in `../CLAUDE.md`.

Toolchain: **PowerShell + Node.js + `docx-js`**. No Python.

---

## Step 0 — Prerequisites (ONE-TIME SETUP, skip on every subsequent run)

Run once per machine, never again:

- Install Node.js → https://nodejs.org
- `npm install -g docx` (the `docx-js` library — installed globally; do **not** reinstall
  on each generation)
- `docx` Claude skill enabled (already installed in this workspace, pinned in
  `skills-lock.json`)

Verify the toolchain is ready (run before generating):

```bash
node --version          # expect v18+
npm ls -g docx          # expect "docx@..." (any version)
```

If both succeed, **skip Step 0 entirely on every future run** — go straight to Step 1.

---

## Step 1 — Locate inputs

- Look in `../02_Current_Target/` for the active `DES020_*.docx`.
- Note whether a partial `DES030_*.docx` already exists there (update vs. create).
- Confirm deliverable component files are present (`Composants` / `Delivery Components`
  folder, or loose `.zap` / `.xml` / `.groovy` / etc.).

If no deliverables are visible, halt and ask the user in French — exactly:

> *"Quels sont les composants délivrables pour cette interface ? (Object Schema, Document Flow, Mapping, MEC Mapper, Event Analytics, XtendM3, etc.)"*

(For non-interactive runs, apply the Emergency Contextual Deduction rule in `../skill.md`.)

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

## Step 4 — Pick the closest reference example

In `../01_Reference_Examples/`, choose the subfolder matching flow class + direction:

| Input looks like | Reference to mirror |
|---|---|
| Outbound event interface | `001_OUT_E ...` |
| Inbound file interface | `002_IN_A` |
| Outbound file interface | `008_OUT_A` |
| Numbered vendor interface | `5057_*`, `5286-*`, `5296_*` |
| Custom workflow / extension | `U002`, `U-005`, `U-009`, ... |

Read its `DES-030_*.docx` for tone, section structure, table layouts, and depth. Read its
`DES030_Composants/` (or `Delivery Components/`) for deliverable filename conventions.

---

## Step 5 — Inventory deliverables

List every physical component file in the workspace and map each:

| File | Infor Component Category | Platform Tool |
|---|---|---|
| ... | Object Schema / Document Flow / Mapping / MEC Mapper / Event Analytics / XtendM3 package / Ariane config | ION Desk / MEC / Event Hub / XtendM3 IDE |

This table feeds DES-030 Section 4 directly.

---

## Step 6 — Generate the DES-030 (`.docx`)

Use the `docx` Claude skill (Node.js / `docx-js` path). The full library reference is at
`.claude/skills/docx/SKILL.md` (page sizes, styles, lists, tables, images, headers,
footers, TOC, hyperlinks, etc.).

### 6.1 Required DES-030 section schema (9 sections, in order, French titles)

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
- **Font:** Arial (the `docx` skill's default — do not change unless a reference example
  clearly does).
- **Page size:** A4 (French / EU project — do not override to US Letter).
- **Headers / footers:** WRICEF ID + version on every page.
- **Tables:** real Word tables (`docx-js` `Table` / `TableRow` / `TableCell`) with
  explicit DXA widths — never percentages, never ASCII-art tables.

### 6.3 `docx-js` generation skeleton

Drop this into `gen.js` inside a working directory, fill in the variables, then
`node gen.js`. It wires up A4, Arial default, header/footer with WRICEF + version, and
all 9 headings — extend each section with body paragraphs and tables per the schema
above.

```javascript
// gen.js — DES-030 generation skeleton
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, LevelFormat, TabStopType, TabStopPosition,
} = require('docx');

// --- Variables from Step 2 attribute extraction --------------------------
const WRICEF_ID  = '5058-IE-TDX-01-CDV';
const NAME       = 'Orders';
const SYSTEM     = 'M3 / TecCom';
const VERSION    = 'V1.0';
const AUTHOR     = 'Judish Hurkhoo';
const TODAY      = new Date().toISOString().slice(0, 10);
const OUT_PATH   = `../02_Current_Target/DES-030_${WRICEF_ID}_${SYSTEM.replace(/\s|\//g,'_')}_${NAME}_${VERSION.replace('.','_')}.docx`;

// --- Helpers -------------------------------------------------------------
const h1 = (txt) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: txt, bold: true })] });
const p  = (txt) => new Paragraph({ children: [new TextRun(txt)] });
const border = { style: BorderStyle.SINGLE, size: 1, color: '999999' };
const borders = { top: border, bottom: border, left: border, right: border };
const cell = (txt, width, fill) => new TableCell({
  borders,
  width: { size: width, type: WidthType.DXA },
  shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
  children: [p(txt)],
});

// --- Document Control table (Section 1) ---------------------------------
const docControlTable = new Table({
  width: { size: 9026, type: WidthType.DXA },   // A4 content width: 11906 - 2 * 1440
  columnWidths: [1500, 1800, 2500, 3226],
  rows: [
    new TableRow({ children: [
      cell('Version', 1500, 'D5E8F0'),
      cell('Date',    1800, 'D5E8F0'),
      cell('Author',  2500, 'D5E8F0'),
      cell('Description of Change', 3226, 'D5E8F0'),
    ]}),
    new TableRow({ children: [
      cell(VERSION, 1500),
      cell(TODAY,   1800),
      cell(AUTHOR,  2500),
      cell('Création initiale du document de déploiement.', 3226),
    ]}),
  ],
});

// --- Document --------------------------------------------------------------
const doc = new Document({
  creator: AUTHOR,
  title: `DES-030 ${WRICEF_ID} ${NAME}`,
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } }, // 11pt body
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
        quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial' },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },   // A4 in DXA
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: { default: new Header({ children: [
      new Paragraph({
        children: [
          new TextRun({ text: `DES-030 — ${WRICEF_ID} ${NAME}`, bold: true }),
          new TextRun({ text: `\tVersion ${VERSION}` }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      }),
    ]}) },
    footers: { default: new Footer({ children: [
      new Paragraph({
        children: [
          new TextRun({ text: `${WRICEF_ID}` }),
          new TextRun({ text: `\tPage `, }),
          new TextRun({ children: [PageNumber.CURRENT] }),
          new TextRun({ text: ` / ` }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      }),
    ]}) },
    children: [
      h1('1. CONTROLE DU DOCUMENT'),
      docControlTable,
      p(''),
      h1('2. INTRODUCTION & OBJECTIF'),
      p(`Ce document décrit la procédure de déploiement de l'interface ${WRICEF_ID} (${NAME}) depuis l'environnement DEV vers les environnements TEST et PROD.`),
      h1('3. PREREQUIS ET DEPENDANCES SYSTEME'),
      p('[Insérer prérequis environnementaux — accès ION Desk, MEC, droits utilisateurs, vérifications CMS042/CMS045 si Event Hub composite.]'),
      h1('4. OBJETS LIVRABLES ET EXTENSIONS'),
      p('[Insérer tableau des composants livrables — fichier, catégorie Infor, outil plateforme.]'),
      h1("5. INSTRUCTIONS DE DEPLOIEMENT ET D'INSTALLATION"),
      p('[Insérer étapes chronologiques — branchées par classe architecturale.]'),
      h1('6. VALIDATION & TESTS POST-DEPLOYMENT'),
      p('[Insérer instructions de vérification — composant en ligne, écoute des événements, traitement d’un payload de test.]'),
      h1('7. PROCESSUS DE PROMOTION'),
      p('[Insérer flux DEV → TEST → PROD avec points de validation.]'),
      h1('8. PROCEDURE DE ROLLBACK'),
      p('[Insérer procédure de retour arrière en cas d’échec.]'),
      h1('9. APPROBATIONS & SIGNATURES'),
      p('[Insérer tableau des approbateurs et signatures.]'),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT_PATH, buf);
  console.log(`Wrote ${OUT_PATH}`);
});
```

Generate the full document in one pass — do not truncate.

---

## Step 7 — Write output

Save to `../02_Current_Target/` as:

```
DES-030_[WRICEF_ID]_[System]_[Name]_V1_0.docx
```

---

## Step 8 — Validate

- Open the generated `.docx` in Word and visually confirm all 9 sections, headers,
  footers, tables.
- Optional automated check: re-open the file with `node` + `mammoth` or
  `Expand-Archive` to confirm the ZIP is well-formed (`Test-Path` on
  `word/document.xml`).
- Confirm: 9 sections present, tables render, header / footer carry WRICEF ID +
  version, body is French.

---

## Hard rules (project-wide — see also `../skill.md`)

- No Python. Ignore `gen_5058*.py` and `generate_des030_ariane.py` — they are legacy.
- `01_Reference_Examples/` is read-only ground truth — never modify.
- Use `[Insérer ...]` placeholders only when the source genuinely lacks the info.
- See `../CLAUDE.md` for project context and `../skill.md` for the skill identity and
  runtime rules.
