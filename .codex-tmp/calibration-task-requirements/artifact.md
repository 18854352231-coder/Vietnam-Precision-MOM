# Artifact contract - 校验任务需求分析书

## Reference

- Source: `D:\越南MOM\MOM\outputs\监视与测量设备管理_台账管理需求分析书.docx`
- SHA-256: `6A3CD2CA3192A2383588D79396DA64270E981C5A1378CB4E447410B05E2AF738`
- Size: 63,672 bytes
- Render evidence: `.codex-tmp\qa_measuring_ledger_requirements_v1\page-01.png` through `page-17.png`
- Audits: `.codex-tmp\calibration-task-requirements\reference-style.json`, section audit, heading audit and fields audit were reviewed.
- Page count: 17. Section count: 1. Every rendered reference page was visually inspected.

## Page system

- US Letter portrait, 8.5 x 11 inches.
- Margins: 1.0 inch on all sides; content width 6.5 inches / 9360 DXA.
- Header and footer distance: 0.492 inch.
- One continuous section; no different first page or odd/even page variants.
- Natural pagination only. Tables may split, header rows repeat, and no fixed table row heights are allowed.

## Typography and color

- Body: Calibri 11 pt; East Asian font Microsoft YaHei; color `#202124`; 0 pt before, 6 pt after, 1.10 line spacing.
- Heading 1: 16 pt bold, `#2E74B5`, 16 pt before, 8 pt after, keep with next.
- Heading 2: 13 pt bold, `#2E74B5`, 12 pt before, 6 pt after, keep with next.
- Heading 3: 12 pt bold, `#1F4D78`, 8 pt before, 4 pt after, keep with next.
- Cover title: 23 pt bold black; subtitle 15 pt bold `#667085`; kicker 10.5 pt bold `#2E74B5`.
- Table header fill: `#F2F4F7` or `#E8EEF5`; body white; thin single black grid.
- Callout fill: `#F4F6F9` with a colored left border. Blue for scope/notes, green for acceptance, orange for caution, red for risk.

## Lists and tables

- Bullet marker `•`: 720 DXA text indent, 360 DXA hanging indent, 8 pt after, 1.167 line spacing.
- Decimal list: `%1.` using the same indent and paragraph rhythm.
- Tables use fixed DXA geometry: total width 9360 DXA, indent 120 DXA, cell margins top/bottom 80 and start/end 120 DXA.
- Narrative columns are left aligned; identifiers, priority, status and short values are centered.
- Table header rows repeat across page breaks.

## Recurring components

- Header: `MOM · 监视与测量设备管理`, left aligned, 8.5 pt bold muted gray.
- Footer: `<submodule>需求分析书  |  第 {PAGE} 页`, right aligned, 8.5 pt muted gray with a real PAGE field.
- Cover: kicker, system title, submodule subtitle, five metadata lines, then one positioning callout.
- Body: numbered Heading 1 and Heading 2 sections, concise prose, real lists, comparison tables and restrained callouts.

## Content flow and editable slots

- Rewrite the complete body for the `校验任务管理` submodule while preserving the reference page system, typography, table patterns, callout patterns, header and footer structure.
- Replace cover subtitle, file number, compilation date, audience and document-positioning text.
- Replace all numbered sections with task-specific content: baseline, goals, scope, roles, workflow, functions, data, rules, interaction, integration, non-functional requirements, prototype gap, acceptance, rollout and pending decisions.
- Preserve the final appendix pattern for field dictionary and traceability notes.
- Target density: about 15-18 pages; avoid a nearly blank final page where practical.

## Package preservation

- Preserve theme, styles, font table, endnotes/footnotes parts, custom XML, app/core/custom properties structure, header relationship and footer relationship.
- `word/document.xml`, `word/numbering.xml`, `word/footer1.xml` and document metadata may change for the new content.
- No drawings or media are present. The source contains one PAGE field in `word/footer1.xml`.

## Fidelity gates

- Reference source must remain unchanged at the recorded SHA-256.
- Final document must retain one portrait Letter section, exact margins and header/footer distances.
- Header/footer furniture and visual hierarchy must remain recognizable as the same document family.
- Render every final page when a renderer is available. If LibreOffice is unavailable, perform structural audits and disclose that visual rendering could not be completed in the current environment.
