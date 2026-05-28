# DES-030 Generation — Project Context

This file is **project context only** — who the user is, what we produce, where files
live, and the project vocabulary.

- **For the skill identity and runtime rules** → see [`./skill.md`](./skill.md).
- **For the step-by-step generation procedure** → see [`./workflow/workflow.md`](./workflow/workflow.md).
- **For `.docx` generation patterns** (page sizes, headers, tables, lists, etc.) → see
  [`../.claude/skills/docx/SKILL.md`](../.claude/skills/docx/SKILL.md).

Do not duplicate content from those files here — point to them.

---

## About the user

- **Role:** Infor M3 / ION technical consultant at Spoon Consulting.
- **Working context:** Horizon Project Methodology — CloudSuite implementations for end
  clients (WRICEFs across ION Desk, MEC, Event Hub, XtendM3 / Ariane).
- **Working language:** communicates in English; **deliverables are written in French**
  (technical body) with English headers / metadata.
- **Tooling preference:** **No Python.** The legacy Python generators in this folder are
  deprecated — do not run, edit, or extend them. Use the `docx` Claude skill via its
  Node.js path.

## Project goal

Given a **DES-020 (Technical Design Specification)** `.docx` plus a set of physical
deliverables (Object Schemas, Document Flows, Mappings, MEC Mappers, Event Analytics,
XtendM3 packages, Ariane configs, etc.) exported from the DEV environment, produce a
**DES-030 (Deployment & Promotion Guide)** `.docx` — a step-by-step migration playbook
matching the project standard verified across the reference examples in
`01_Reference_Examples/`. The output must be ready for hand-off to operations without
further editing.

## Folder structure

```
DES030_generation/
├── 01_Reference_Examples/         # Read-only ground-truth pairs of past DES-020 + DES-030 + deliverables
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
├── 02_Current_Target/             # Active work — input(s) and output go here
│   ├── DES020_*.docx              #   - the spec to process
│   └── DES030_*.docx              #   - the generated deployment guide
│
├── workflow/
│   └── workflow.md                # The step-by-step generation procedure
│
├── CLAUDE.md                      # This file — project context only
└── skill.md                       # The des030-generator skill definition + runtime rules
```
