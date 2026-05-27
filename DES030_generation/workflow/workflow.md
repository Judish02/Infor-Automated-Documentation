# DES-030 Generation Workflow

End-to-end procedure for producing a DES-030 (Deployment & Promotion Guide) from a DES-020.
No Python — Pandoc reads input, `docx-js` writes output.

---

## Step 0 — Prerequisites (once per machine)

- Node.js installed, then `npm install -g docx`
- Pandoc installed (https://pandoc.org/installing.html)
- `docx` Claude skill available

---

## Step 1 — Locate inputs

- Look in `../02_Current_Target/` for the active `DES020_*.docx`.
- Note whether a partial `DES030_*.docx` already exists there (update vs. create).
- Confirm the deliverable component files are present (a `Composants` / `Delivery Components` folder, or loose `.zap`/`.xml`/etc.).

If no deliverables are visible, **halt** and ask the user in French:
> *"Quels sont les composants délivrables pour cette interface ? (Object Schema, Document Flow, Mapping, MEC Mapper, Event Analytics, XtendM3, etc.)"*

---

## Step 2 — Read & parse the DES-020

```bash
pandoc --track-changes=all "../02_Current_Target/DES020_<name>.docx" -o spec.md
```

Read `spec.md` and extract the attribute matrix:

| Attribute | Where |
|---|---|
| WRICEF ID & Name | filename + document control block |
| Flow Direction | `IN` (Entrant) / `OUT` (Sortant) |
| Flow Type code | `A` File · `E` Event · `X` XtendM3 |
| System Topology | Source + Target systems |
| Author | DES-020 control block |
| Date | today (`YYYY-MM-DD`) |

---

## Step 3 — Detect architectural class

- **Class A · ION WRICEF** → mentions MEC, ION Desk, Event Hub, Document Flow, Object Schema.
- **Class B · Pure XtendM3 / Ariane** → mentions XtendM3 extensions, API transactions, pack/unpack scripts.

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

Read its `DES-030_*.docx` for tone, section structure, table layouts, and depth.
Read its `DES030_Composants/` (or `Delivery Components/`) for deliverable filename conventions.

---

## Step 5 — Inventory deliverables

List every physical component file in the workspace and map each:

| File | Infor Component Category | Platform Tool |
|---|---|---|
| ... | Object Schema / Document Flow / Mapping / MEC Mapper / Event Analytics / XtendM3 package / Ariane config | ION Desk / MEC / Event Hub / XtendM3 IDE |

This feeds DES-030 Section 4.

---

## Step 6 — Generate the DES-030 (.docx)

Use the `docx` skill in Node.js / `docx-js` mode. Build all 9 sections in order:

1. CONTROLE DU DOCUMENT (version + reviewers/approvers tables)
2. INTRODUCTION & OBJECTIF
3. PREREQUIS ET DEPENDANCES SYSTEME (Event Hub → add `CMS042` / `CMS045` checks)
4. OBJETS LIVRABLES ET EXTENSIONS (deliverable table from Step 5)
5. INSTRUCTIONS DE DEPLOIEMENT ET D'INSTALLATION (branch by class)
6. VALIDATION & TESTS POST-DEPLOYMENT
7. PROCESSUS DE PROMOTION (DEV → TEST → PROD)
8. PROCEDURE DE ROLLBACK
9. APPROBATIONS & SIGNATURES

Formatting: French body / English metadata, Arial, A4, WRICEF ID + version in header/footer, real Word tables (DXA widths).

Generate the full document in one pass — do not truncate.

---

## Step 7 — Write output

Save to `../02_Current_Target/` as:
```
DES-030_[WRICEF_ID]_[System]_[Name]_V1_0.docx
```

---

## Step 8 — Validate

- Open in Word, or
- `pandoc "../02_Current_Target/DES-030_<name>.docx" -o NUL` to catch malformed content.

Confirm: all 9 sections present, tables render, header/footer carry WRICEF ID + version, body is French.

---

## Hard rules

- No Python. Ignore `gen_5058*.py` and `generate_des030_ariane.py`.
- `01_Reference_Examples/` is read-only ground truth — never modify.
- Use `[Insérer ...]` placeholders only when the source genuinely lacks the info.
- See `../CLAUDE.md` for full project context and `../03_Claude_Prompts/SKILL.md` for the skill definition.
