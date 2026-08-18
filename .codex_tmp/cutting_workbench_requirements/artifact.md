# Template execution contract

## Reference

- Absolute path: `C:\Users\ptn_z\Desktop\挤压生产报表需求分析书.docx`
- SHA-256: `e6450c96a87602b130f010963bf4e170f1e5640a54c86eca72f287a716de5a1e`
- Sections: 1
- Page count: unresolved because LibreOffice/soffice is not installed; structural inspection completed.
- Evidence: `template-style-evidence.json`, section audit output, table geometry audit output.

## Page system

- US Letter portrait, 8.5 x 11 inches.
- Margins: 1 inch on all sides.
- Header/footer distance: 0.492 inch.
- One section, different first page enabled, no odd/even split.
- Footer contains the source page-number pattern `第 [PAGE] 页`; header is empty.

## Typography

- Normal: Calibri 11 pt, color `202124`, 6 pt after, 1.10 line spacing.
- Title: 23 pt, bold, color `1F4D78`, 8 pt after, keep with next.
- Heading 1: 16 pt, bold, color `2E74B5`, 16 pt before, 8 pt after, keep with next.
- Heading 2: 13 pt, bold, color `2E74B5`, 12 pt before, 6 pt after, keep with next.
- Chinese fallback: Microsoft YaHei, preserving the reference's Calibri-led style.
- Lists reuse the source `List Bullet` and `List Number` styles and numbering definitions.

## Tables

- Style: Table Grid.
- Header fill `F2F4F7`; header text 8 pt, bold, color `1F4D78`, centered.
- Body text 8 pt; cells vertically centered; rows expand naturally.
- Query matrix uses the source grid `[1581, 1113, 5215]` DXA.
- Field/method matrices use the source compact two-column pattern `[1538, 2160]` DXA.
- Table indent 120 DXA; exact `tblW`, `tblGrid`, and `tcW`; repeating first row.

## Content flow and slot map

1. Title slot: replace with `裁切工作台需求分析书`.
2. Purpose paragraph: rewrite for cutting-workbench scope and current implementation boundary.
3. Construction goals: replace bullets with cutting-specific goals.
4. Target data flow: replace numbered list with issued schedule, material receiving, work reporting, pallet/box labeling, and downstream handoff.
5. Query requirements: replace the source query matrix with material-list and pallet-record searches.
6. Detail field sections: replace extrusion/sawing groups with clocking/equipment, schedules, material list, work reporting, pallet/boxing, and package flow groups.
7. Current boundary: add concise bullets identifying localStorage, in-memory data, and unused report inputs.

## Package preservation

- Preserve: styles, theme, numbering, section geometry, settings, header/footer parts, relationships, core table visual treatment.
- Editable: `word/document.xml` body content and core document metadata.
- Remove: source-specific extrusion-report prose and table rows.
- No images, comments, tracked changes, content controls, footnotes, or external relationships are present in the reference.

## Fidelity gates

- Reference file must remain byte-for-byte unchanged.
- Output must retain one section, page geometry, heading ladder, list styles, table palette, and footer pattern.
- No generic cover, metadata masthead, callout system, or alternate visual preset may be added.
- Render gate may be skipped only because soffice is missing; structural, accessibility, and table-geometry audits remain mandatory.
