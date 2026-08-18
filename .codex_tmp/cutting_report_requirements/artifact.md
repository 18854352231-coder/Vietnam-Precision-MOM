# Template execution contract

## Reference

- Path: `C:\Users\ptn_z\Desktop\挤压生产报表需求分析书.docx`
- SHA-256: `e6450c96a87602b130f010963bf4e170f1e5640a54c86eca72f287a716de5a1e`
- One US Letter portrait section; page count unresolved because soffice is unavailable.
- Evidence: current-turn paragraph/table inventory, section audit and prior template geometry audit.

## Page and typography system

- 8.5 x 11 inches, portrait; 1 inch margins; header/footer distance 0.492 inch.
- Normal: Calibri 11 pt, `202124`, 6 pt after, 1.10 line spacing; Microsoft YaHei Chinese fallback.
- Title: 23 pt bold, `1F4D78`, 8 pt after.
- Heading 1: 16 pt bold, `2E74B5`, 16 pt before, 8 pt after.
- Heading 2: 13 pt bold, `2E74B5`, 12 pt before, 6 pt after.
- Reuse the source's real List Bullet and List Number styles.
- Preserve the empty header and `第 [PAGE] 页` footer.

## Tables

- Table Grid; header fill `F2F4F7`, 8 pt bold `1F4D78`, centered.
- Query matrix grid `[1581, 1113, 5215]` DXA.
- Field/method matrices use compact two-column grid `[1538, 2160]` DXA.
- Table indent 120 DXA; exact `tblW`, `tblGrid`, `tcW`; repeating header rows; no fixed row height.

## Content flow and slots

1. Replace title with `裁切生产报表需求分析书`.
2. Rewrite purpose and construction goals for the cutting report.
3. Rewrite numbered target data flow for completed cutting records only.
4. Replace query matrix with the six current filters.
5. Replace field sections with schedule/frame, source traceability, cutting results, and time/status groups.
6. Add summary/export formulas and a concise current-data-boundary section.

## Preservation and fidelity

- Preserve styles, theme, numbering, settings, section geometry, header/footer, relationships and source visual language.
- Editable: document body and core metadata.
- Remove all extrusion-report-specific prose and rows.
- Reference must remain byte-for-byte unchanged.
- Rendering may be skipped only because soffice is unavailable; accessibility and table geometry audits are mandatory.
