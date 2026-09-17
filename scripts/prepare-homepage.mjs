import { readFile, mkdir, writeFile } from 'node:fs/promises';

// Build-time curation only. The complete inherited source is never bundled.
function parseCsv(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(field); field = ''; }
    else if (c === '\n' && !quoted) { row.push(field.replace(/\r$/, '')); if (row.some(Boolean)) rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (quoted) throw new Error('Unterminated CSV field');
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...data] = rows;
  return data.map(values => Object.fromEntries(header.map((key, i) => [key.replace(/^\uFEFF/, ''), values[i]])));
}

const inventory = parseCsv(await readFile(new URL('../content/catalogue-product-inventory.csv', import.meta.url), 'utf8'));
const selection = [
  ['CAT-001', 'paper', 'Paper courier bags', 'Paper', '01'],
  ['CAT-006', 'boxes', 'Corrugated boxes', 'Boxes', '02'],
  ['CAT-016', 'labels', 'Labels', 'Labels', '03'],
  ['CAT-023', 'tapes', 'Tapes', 'Tapes', '04'],
  ['CAT-038', 'protective', 'Protective packaging', 'Wrap', '05'],
  ['CAT-044', 'carry', 'Carry bags', 'Carry', '06'],
  ['CAT-022', 'office', 'Stationery reference', 'Office', '07'],
];
const curated = selection.map(([id, category, navigationLabel, imageLabel, ordinal]) => {
  const source = inventory.find(item => item.catalogue_id === id);
  if (!source || source.presence_status !== 'PRESENT IN CATALOGUE') throw new Error(`Invalid catalogue reference: ${id}`);
  return { id, category, navigationLabel, imageLabel, ordinal, name: source.product_verbatim, sourcePage: Number(source.catalogue_page),
    presence: source.presence_status, businessStatus: source.current_business_status, approvedOffering: false,
    searchableText: `${source.product_verbatim} ${source.category_verbatim} ${navigationLabel}`.toLowerCase() };
});
await mkdir(new URL('../src/generated/', import.meta.url), { recursive: true });
await writeFile(new URL('../src/generated/homepage-data.json', import.meta.url), JSON.stringify(curated, null, 2) + '\n');

const t = JSON.parse(await readFile(new URL('../docs/phase-2/design-tokens.json', import.meta.url), 'utf8'));
const variables = Object.entries(t.color).map(([k,v]) => `--${k.replace(/[A-Z]/g, c => '-'+c.toLowerCase())}:${v}`);
variables.push(`--font-brand:${t.typography.family}`,`--max-width:${t.layout.maxWidthPx/16}rem`,
  `--control-height:${t.control.heightPx/16}rem`,`--focus-width:${t.control.focusWidthPx}px`,`--focus-offset:${t.control.focusOffsetPx}px`,
  `--panel-shadow:${t.shadow.panel}`,`--hover-duration:${t.motion.hoverMs}ms`,`--image-hover-scale:${t.motion.imageScaleMax}`,
  `--arrow-shift:${t.motion.arrowShiftMaxPx}px`,`--body-line:${t.typography.lineHeight.body}`,`--display-line:${t.typography.lineHeight.display}`,
  `--display-track:${t.typography.letterSpacingEm.display}em`,`--heading-track:${t.typography.letterSpacingEm.heading}em`,
  `--control-radius:${t.radiusPx.button}px`,`--card-radius:${t.radiusPx.card}px`, `--hero-desktop-cap:${t.typography.heroSizePx.desktop/16}rem`);
for (const s of t.spacingPx) variables.push(`--space-${s}:${s/16}rem`);
variables.push(`--hero-lead:${t.motion.heroLeadMs}ms`, `--float-duration:${t.motion.floatMs}ms`, `--float-distance:${t.motion.floatDistancePx}px`);
variables.push(`--secondary-float-duration:${t.motion.secondaryFloatMs}ms`, `--secondary-float-distance:${t.motion.secondaryFloatDistancePx}px`);
variables.push(`--panel-duration:${t.motion.panelMs}ms`, `--reveal-duration:${t.motion.revealMs}ms`, `--cinematic-duration:${t.motion.cinematicMs}ms`, `--reveal-distance:${t.motion.revealDistancePx}px`, `--stagger:${t.motion.staggerMs}ms`, `--reveal-ease:${t.motion.revealEasing}`, `--pointer-max:${t.motion.pointerMaxPx}px`);
function responsive(mode) {
  return `--gutter:${t.layout.gutterPx[mode]/16}rem;--section-space:${t.layout.sectionSpacingPx[mode]/16}rem;--hero-type:${t.typography.heroSizePx[mode]/16}rem;--section-type:${t.typography.sectionSizePx[mode]/16}rem;--feature-type:${t.typography.featureSizePx[mode]/16}rem;--header-height:${t.layout.headerHeightPx[mode==='mobile'?'mobile':'desktop']/16}rem`;
}
const css = `/* Generated from docs/phase-2/design-tokens.json. Do not edit. */\n:root{${variables.join(';')};${responsive('mobile')}}\n@media(min-width:${t.breakpointMinPx.tablet}px){:root{${responsive('tablet')}}}\n@media(min-width:${t.breakpointMinPx.desktop}px){:root{${responsive('desktop')}}}\n@media(min-width:${t.breakpointMinPx.large}px){:root{--hero-type:${t.typography.heroSizePx.large/16}rem}}\n@media(max-width:359px){:root{--gutter:${t.layout.gutterPx.smallMobile/16}rem}}\n`;
await writeFile(new URL('../src/generated/tokens.css', import.meta.url), css);
console.log(`Prepared ${curated.length} explicitly unapproved homepage catalogue references and shared design tokens.`);
