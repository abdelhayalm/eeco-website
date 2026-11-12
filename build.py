"""Build eeco from editable source, retaining the published experience."""
from pathlib import Path
import base64,json,re,shutil
ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/'source'
copy=json.loads((SOURCE/'copy.json').read_text())
template=(SOURCE/'template.html').read_text()
keys=set(re.findall(r'data-i="([^"]+)"',template))
for lang in ('en','pt','ar'):
 assert keys<=copy[lang].keys(),(lang,keys-copy[lang].keys())
script=(SOURCE/'main.js').read_text().replace('__COPY__',json.dumps(copy,ensure_ascii=False,separators=(',',':')))
html=template.replace('__STYLE__',(SOURCE/'style.css').read_text()).replace('__SCRIPT__',script)
for key,asset in json.loads((SOURCE/'assets.json').read_text()).items():
 data=(SOURCE/'assets'/asset['path']).read_bytes()
 html=html.replace('{{'+key+'}}','data:'+asset['mime']+';base64,'+base64.b64encode(data).decode('ascii'))
assert not re.search(r'\{\{embedded-\d+\}\}',html),'Unresolved embedded asset'
(ROOT/'dist').mkdir(exist_ok=True)
for target in (ROOT/'index.html',ROOT/'dist'/'index.html'):target.write_text(html)
for directory in ('assets','recycla'):
 if (ROOT/directory).exists():shutil.copytree(ROOT/directory,ROOT/'dist'/directory,dirs_exist_ok=True)
print('Built identical root and dist pages; EN/PT/AR translation keys verified.')
