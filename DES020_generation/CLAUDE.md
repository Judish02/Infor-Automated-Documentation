# DES-020 Generation — Project Context

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
- **Tooling preference:** **No Python.** Use the `docx` Claude skill via its Node.js path.

## Project goal

Given a set of technical inputs (WRICEF ID, functional specification or scope description,
system topology, component list, and physical deliverable files exported from the DEV
environment), produce a **DES-020 (Technical Design Specification)** `.docx` — a complete
technical design document describing the architecture, components, data flows, and
configuration of an Infor M3 / ION customisation.

The output must be consistent with the reference examples in `01_Reference_Examples/` and
ready for hand-off to the operations / deployment team.

## Folder structure

```
DES020_generation/
├── 01_Reference_Examples/         # Read-only ground-truth DES-020 examples (one folder per WRICEF)
│   ├── 001_OUT_E .../             # Each subfolder contains:
│   │   ├── DES-020_*.docx         #   - the reference technical design spec
│   │   └── DES020_Composants/     #   - the physical deliverable files
│   ├── 002_IN_A/
│   ├── 008_OUT_A/
│   └── ...                        # (see DES020_generation/01_Reference_Examples for full list)
│
├── 02_Current_Target/             # Active work — input(s) and output go here
│   └── DES020_*.docx              #   - the generated technical design spec
│
├── workflow/
│   └── workflow.md                # The step-by-step generation procedure
│
├── CLAUDE.md                      # This file — project context only
└── skill.md                       # The des020-generator skill definition + runtime rules
```

> **Note on reference examples:** The full set of reference pairs (DES-020 + DES-030 +
> deliverables) lives under `./01_Reference_Examples/`. Point to that
> folder when borrowing structure, style, or content for DES-020 generation.
