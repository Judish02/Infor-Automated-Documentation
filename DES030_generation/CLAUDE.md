# DES-030 Generation — Project Guide

## About the user

- **Role:** Infor M3 / ION technical consultant at Spoon Consulting.
- **Working context:** Horizon Project Methodology — CloudSuite implementations for end clients (WRICEFs across ION Desk, MEC, Event Hub, XtendM3 / Ariane).
- **Working language:** Communicates in English; **deliverables are written in French** (technical body) with English headers/metadata.
- **Tooling preference:** **No Python.** The legacy Python generators in this folder are deprecated — do not run, edit, or extend them. Use the `docx` Claude skill via its Node.js path.

## Project goal

Given:
1. A **DES-020 (Technical Design Specification)** `.docx` describing how a WRICEF is built.
2. A set of **physical deliverables** (Object Schemas, Document Flows, Mappings, MEC Mappers, Event Analytics, XtendM3 packages, Ariane configs, etc.) exported from the DEV environment.

Produce:
- A **DES-030 (Deployment & Promotion Guide)** `.docx` — a step-by-step migration playbook that follows the project standard verified across the reference examples in `01_Reference_Examples/`.

The output must be ready for hand-off to operations without further editing.

## Folder structure

```
DES030_generation/
├── 01_Reference_Examples/         # Ground-truth pairs of past DES-020 + DES-030 + deliverables
│   ├── 001_OUT_E .../             # Each subfolder = one completed WRICEF, contains:
│   │   ├── DES-020_*.docx         #   - the input technical spec
│   │   ├── DES-030_*.docx         #   - the matching deployment guide (style/structure target)
│   │   └── DES030_Composants/     #   - the actual deliverable files that were promoted
│   ├── 002_IN_A/
│   ├── 008_OUT_A/
│   ├── 5057_TecCom_Orders.../
│   ├── 5286-IE-MVX-01-Image.../
│   ├── 5296_Doyen_RFO.../
│   ├── U-005 Workflow validation POA/
│   ├── U-009 Reventillation frais/
│   ├── U-010 Recalcul frais OA/
│   ├── U-012 Fluidification Cockpit/
│   ├── U-016 Livraison_Directe/
│   ├── U-020 Integration_Packing_List/
│   ├── U-022 - Batch lancement en prélèvement/
│   └── U002 - Gestion Franco/
│
├── 02_Current_Target/             # Active work
│   ├── DES020_*.docx              # Input(s) — the spec to process
│   └── DES030_*.docx              # Output — write the generated DES-030 here
│
├── 03_Claude_Prompts/             # Skill / prompt definitions
│   └── SKILL.md                   # The des030-generator skill (architecture, sections, rules)
│
└── CLAUDE.md                      # This file — read first when working in this folder
```

### Reference example naming convention

The prefix indicates the flow class — use it to pick the closest reference when generating:

| Prefix pattern | Class | Meaning |
|---|---|---|
| `NNN_OUT_E ...` | A · ION WRICEF | Outbound, Event-triggered |
| `NNN_OUT_A ...` | A · ION WRICEF | Outbound, File / scheduled |
| `NNN_IN_A ...` | A · ION WRICEF | Inbound, File / scheduled |
| `NNNN_<Vendor>_<Process>` | A · ION WRICEF | Numbered interface (e.g. `5057_TecCom_Orders`) |
| `U-NNN ...` / `U0NN ...` | B · Pure XtendM3 / Ariane | Custom extension or workflow |

## Workflow

1. **Identify inputs** — look in `02_Current_Target/` for the active DES-020 `.docx`. There may also be a partially completed DES-030 to update.
2. **Read the DES-020** with `pandoc --track-changes=all input.docx -o spec.md` (no Python).
3. **Detect architectural class** automatically from the DES-020 content:
   - **Class A · ION WRICEF** — mentions of MEC, ION Desk, Event Hub, Document Flow, Object Schema → ION-based deployment.
   - **Class B · Pure XtendM3 / Ariane** — mentions of XtendM3 extensions, API transactions, pack/unpack scripts → M3 Business Engine extension layer.
4. **Pick the closest reference** in `01_Reference_Examples/` matching the flow class and direction. Read its DES-030 to mirror tone, section structure, table layouts, and the level of detail expected. Read its `DES030_Composants/` (or `Delivery Components/`) folder to see the deliverable filename conventions.
5. **Inventory deliverables** — list every physical component file present in the workspace; map each to its Infor Component Category (Object Schema, Document Flow, Mapping, MEC Mapper, Event Analytics, XtendM3 package, Ariane config, etc.) and Platform Tool.
6. **Generate the DES-030** as `.docx` using the `docx` skill (Node.js / `docx-js`). See the section schema below.
7. **Write the output** to `02_Current_Target/` named `DES-030_[WRICEF_ID]_[System]_[Name]_V1_0.docx`.
8. **Validate** by opening the file in Word, or `pandoc out.docx -o /dev/null` to catch malformed content.

### Fallback when deliverables are missing

If no deliverable component files are visible in the workspace, halt and ask the user in French — exactly:

> *"Quels sont les composants délivrables pour cette interface ? (Object Schema, Document Flow, Mapping, MEC Mapper, Event Analytics, XtendM3, etc.)"*

Do not invent deliverables.

## Required DES-030 section schema

Generate in this exact order. Section titles are in French.

1. **CONTROLE DU DOCUMENT**
   - Table 1: `Version | Date | Author | Description of Change` (English header keys, French content).
   - Table 2: `Reviewers | Approvers` with role.
2. **INTRODUCTION & OBJECTIF** — French summary of the DEV → TEST/PROD migration objective for this WRICEF.
3. **PREREQUIS ET DEPENDANCES SYSTEME** — environmental prerequisites. If Event Hub composite events are used, inject explicit verification sub-steps for `CMS042` and `CMS045`.
4. **OBJETS LIVRABLES ET EXTENSIONS** — table of every physical deliverable, mapped to Infor Component Category and Platform Tool.
5. **INSTRUCTIONS DE DEPLOIEMENT ET D'INSTALLATION** — chronological deployment steps, branched by class:
   - **Class A · ION WRICEF** — file import sequence into ION Desk, activation order, connection-string updates, document-flow publishing.
   - **Class B · Pure XtendM3 / Ariane** — pack/unpack script execution, configuration loading, compilation and activation in the M3 Business Engine extension layer.
6. **VALIDATION & TESTS POST-DEPLOYMENT** — verification that the component is online, listening, and processing a test payload without structural errors.
7. **PROCESSUS DE PROMOTION** — DEV → TEST → PROD promotion workflow with sign-off gates.
8. **PROCEDURE DE ROLLBACK** — recovery procedure if deployment fails.
9. **APPROBATIONS & SIGNATURES** — sign-off table.

## Attribute extraction matrix

Pull these from the DES-020 header / metadata block:

| Attribute | Source |
|---|---|
| **WRICEF ID & Name** | Filename + document control block (e.g. `5058-IE-TDX-01-CDV`, `U002 - Gestion Franco`) |
| **Flow Direction** | `IN` (Entrant) or `OUT` (Sortant) |
| **Flow Type code** | `A` File/Scheduled · `E` Event-Triggered · `X` XtendM3 Extension |
| **System Topology** | Source system + Target system named explicitly in DES-020 |
| **Architectural Class** | `A` ION WRICEF or `B` Pure XtendM3 (auto-detected from content) |
| **Author** | Exact name from the DES-020 document control block |
| **Date** | Today's date (`YYYY-MM-DD`) |

## Language & formatting rules

- **Body text:** French, formally precise, technical, imperative voice (e.g. *"Importer le fichier...", "Vérifier la présence de..."*).
- **Document control / system attributes:** English keys (Version, Date, Author, etc.) with French values where natural.
- **Output format:** `.docx` only. No `.doc`, no PDF.
- **Font:** Arial — the `docx` skill's default; do not change unless a reference example clearly does.
- **Page size:** A4 (this is a French / EU project — the skill default of A4 is correct here; do not override to US Letter).
- **Headers / footers:** include WRICEF ID and version on every page.
- **Tables:** use real Word tables (`docx-js` `Table` / `TableRow` / `TableCell`) with explicit DXA widths — never percentages, never unicode-art tables.

## Critical runtime rules

- Generate the entire document in a single pass. Do not truncate sections or stop early to ask the user about formatting.
- Use `[Insérer ...]` (French) placeholders only when the source genuinely lacks the information.
- Architectural class detection is **automatic from DES-020 content** — do not ask the user to pick A or B.
- Match the verified layout of the reference examples (`U002`, `001_OUT_E`, `002_IN_A`, etc.). When the input is closest to a numbered ION interface, follow `001_OUT_E` / `002_IN_A` / `5057_*`. When it's a custom `U-xxx` workflow, follow the `U002` / `U-005` / `U-009` series.
- Do not delete or modify files in `01_Reference_Examples/` — they are read-only ground truth.
- Do not invoke `gen_5058.py`, `gen_5058_v2.py`, or `generate_des030_ariane.py`. Treat them as legacy artifacts pending deletion.

## Tooling

| Need | Tool | Install |
|---|---|---|
| Generate `.docx` | Node.js + `docx-js` | `npm install -g docx` |
| Read input `.docx` | Pandoc | https://pandoc.org/installing.html |
| Claude skill | `docx` (already installed) | n/a |

No Python interpreter required for any step.

## Glossary

- **WRICEF** — Workflow, Report, Interface, Conversion, Enhancement, Form. The unit of work.
- **DES-020** — Technical Design Specification (the *how-it's-built* document).
- **DES-030** — Deployment & Promotion Guide (the *how-it-ships* document — generated here).
- **ION Desk** — Infor's integration management UI.
- **MEC** — M3 Enterprise Collaborator (mapping / transformation layer).
- **Event Hub** — Infor's publish/subscribe event bus; composite events often involve `CMS042` / `CMS045`.
- **XtendM3** — In-process Java/Groovy extension framework inside the M3 Business Engine.