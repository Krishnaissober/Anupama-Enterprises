# Reference catalogue inventory

## Latest source review

The actual 31-page PDF has now been reviewed. Use [catalogue-product-inventory.csv](catalogue-product-inventory.csv) for 57 source product occurrences and [catalogue-page-text.json](catalogue-page-text.json) for raw per-page text. The unmodified PDF is retained at `content/source/PnP Booklet_7709.pdf`; its SHA-256 matches the user-provided original. See [completed catalogue analysis](../docs/phase-1/03-catalogue-analysis.md) for evidence, full page coverage and verification issues.

The sections below describe the earlier brief-only inventory and prior extraction plan. Those 55 brief mentions remain historical and are not silently overwritten with catalogue data. Catalogue presence and current business approval remain separate.

## Evidence boundary

`reference-catalogue-inventory.csv` transcribes **55 product/reference mentions from the written brief**, not from the missing PDF. Eight broad category headings are represented in category mappings. Counts are reference mentions, not confirmed products/SKUs/current range. Some mentions overlap; retain them until source/owner review rather than silently merging.

All rows are INFORMATION REQUIRING CONFIRMATION. Source page, size, dimension, material and specifications are CONTENT REQUIRED because the written brief provides no actual measurements/spec values. Names containing Paper, Plastic or BOPP are preserved verbatim, but composition is not inferred into material fields. “Customised” names are not verification of available custom services.

Category mappings are PROPOSED DESIGN, especially Rigid Boxes, Silver Pouches, Napkin and Transparent BOPP Bags. Source section is preserved separately. These are internal content records only, never production seeds or public copy.

## PDF extraction procedure — pending

1. Obtain original PnP Booklet.pdf; record filename, edition/date, checksum and actual page count. Keep inherited source privately; public download requires rebranding/rights approval.
2. Inspect every page visually and extract text/tables. Record PDF page index and printed page number separately. Review OCR against visuals if text is scanned.
3. Log each product/variant/size with exact terminology, raw dimensions, units/order, material/specification wording, customisation wording and source page.
4. Record imagery references, branding/trademark content and usage-right status separately; do not automatically publish catalogue artwork.
5. Add discrepancy IDs for typos, conflicting size tables, unclear units, inconsistent names/categories and duplicate mentions. Preserve source wording; never silently repair.
6. Owner confirms normalization, current range, manufacturing/trading, availability, MOQ/pricing language, custom options and imagery rights per launch record.
7. Reconcile every page against inventory, identify non-product pages and resolve discrepancies. Retain rejected/unverified records privately. Only approved data enters public content.

## Known verification questions from the brief

- Bubble Wrap versus Bubble Roll; Stretch Film versus Stretch Film Roll: duplicate/synonym or distinct product?
- Carry Bags appears as both additional product and explicit variant list: family versus generic mention?
- Office Stationery versus Stationery Products: umbrella category versus specific range?
- Corrugated Boxes and Rigid Boxes: distinct architecture and category placement require approval.
- Transparent BOPP Bags “multiple sizes”: no actual sizes supplied; no size row can be extracted yet.
- W-Cut Paper Carry Bags and marketplace-specific names: preserve wording and verify actual products/rights.
- Shrink Wrap, Honeycomb Wrap, Corrugated Sheet Roll and other additional mentions: confirm current offering and original source pages.

These are questions, not findings of PDF errors. Page-level discrepancies cannot be asserted until the PDF is read.
