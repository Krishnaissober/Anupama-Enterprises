from pathlib import Path
from pypdf import PdfReader
import hashlib, json

source = Path('content/source/PnP Booklet_7709.pdf')
reader = PdfReader(source)
output = Path('public/assets/images/catalogue')
output.mkdir(parents=True, exist_ok=True)
selection = [('paper',5,0),('boxes',8,0),('labels',14,0),('office',16,0),('tapes',18,0),('protective',24,1),('carry',28,1)]
records = {}
for key, page, index in selection:
    image = list(reader.pages[page-1].images)[index]
    filename = f'{key}-page-{page:02}{Path(image.name).suffix}'
    (output / filename).write_bytes(image.data)
    records[key] = dict(src=f'/assets/images/catalogue/{filename}', width=image.image.width, height=image.image.height,
                        page=page, embeddedName=image.name, sha256=hashlib.sha256(image.data).hexdigest(), approved=False,
                        status='TEMPORARY CATALOGUE IMAGE — OWNER APPROVAL REQUIRED')
Path('content/homepage-image-provenance.json').write_text(json.dumps(dict(source=str(source),sourceSHA256=hashlib.sha256(source.read_bytes()).hexdigest(),images=records), indent=2), encoding='utf-8')
runtime = Path('src/data/catalogue-images.json')
if runtime.exists():
    previous = json.loads(runtime.read_text(encoding='utf-8'))
    if previous.get('carry', {}).get('sourceKind') == 'generated-illustration':
        records['carry'] = previous['carry']
runtime.write_text(json.dumps(records, indent=2), encoding='utf-8')
print(json.dumps(records, indent=2))
