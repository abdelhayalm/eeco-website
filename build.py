"""Build the portable eeco page from editable source. No external build dependencies."""
from pathlib import Path
import base64,json,re
ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/'source'
def uri(name,mime):
 return 'data:'+mime+';base64,'+base64.b64encode((SOURCE/'assets'/name).read_bytes()).decode('ascii')
assets={
 'carmen':uri('carmen.svg','image/svg+xml'),
 'alquimia':uri('alquimia.png','image/png'),
 'kemet':uri('kemet.png','image/png'),
 'eeco-wordmark':uri('eeco-wordmark.png','image/png'),
 'eeco-emblem':uri('eeco-emblem.png','image/png'),
 'eeco-lockup':uri('eeco-lockup.png','image/png'),
 'quicksand-regular':uri('fonts/Quicksand-Regular.woff2','font/woff2'),
 'quicksand-bold':uri('fonts/Quicksand-Bold.woff2','font/woff2'),
 'arabic-regular':uri('fonts/NotoSansArabic-Regular.woff2','font/woff2'),
 'arabic-bold':uri('fonts/NotoSansArabic-Bold.woff2','font/woff2'),
}
for stage in ('caterpillar', 'cocoon', 'butterfly'):
 assets[f'story-{stage}']=(SOURCE/'assets'/'story'/f'{stage}.svg').read_text().strip()
for photo in ('forest', 'palms', 'face-painting'):
 assets[f'founder-{photo}']=uri(f'founder/{photo}.webp','image/webp')
copy=json.loads((SOURCE/'copy.json').read_text())
assert set(copy)=={'en','pt','ar'}
keys=set(re.findall(r'data-i="([^"]+)"',(SOURCE/'template.html').read_text()))
for lang,words in copy.items():
 assert keys<=words.keys(),(lang,keys-words.keys())
script=(SOURCE/'main.js').read_text().replace('__COPY__',json.dumps(copy,ensure_ascii=False,separators=(',',':')))
style=(SOURCE/'style.css').read_text()
html=(SOURCE/'template.html').read_text().replace('__STYLE__',style).replace('__SCRIPT__',script)
license_paths = sorted((SOURCE/'assets'/'fonts').glob('*OFL.txt'))
license_paths.append(SOURCE/'assets'/'story'/'LICENSE.txt')
licenses='\n\n'.join(p.read_text() for p in license_paths)
html=html.replace('</head>','<!-- Third-party asset licenses\n'+licenses.replace('--','—')+'\n-->\n</head>')
html=html.replace('</head>','<noscript><style>.service-tabs,.language-switch,.language-select{display:none!important}.service-panel[hidden]{display:grid!important}.service-panel{margin-bottom:20px}</style></noscript></head>')
for key,value in assets.items():html=html.replace('{{'+key+'}}',value)
assert not re.search(r'\{\{[a-z-]+\}\}',html),'Unresolved asset'
assert '__COPY__' not in html
(ROOT/'dist').mkdir(exist_ok=True)
(ROOT/'dist'/'index.html').write_text(html)
print('Built dist/index.html:',len(html.encode()),'bytes; all 3 languages verified.')
