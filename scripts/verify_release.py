"""Verifica o snapshot estático e seu manifesto sem dependências externas."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import argparse
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = ROOT / 'docs/releases/v28-sha256.txt'


def require(condition, message):
    if not condition:
        raise SystemExit('FALHA: ' + message)


def runtime_files():
    paths = [ROOT / 'build.py', ROOT / 'index.html', ROOT / '.openai/hosting.json']
    for directory in ('source', 'assets', 'recycla', 'Recycla', 'dist'):
        paths.extend(p for p in (ROOT / directory).rglob('*') if p.is_file())
    return sorted(set(paths))


class Resources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.names = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('input', 'select', 'textarea'):
            self.names.add(attrs.get('name'))
        for key in ('src', 'poster'):
            if attrs.get(key):
                self.urls.append(attrs[key])
        if tag == 'link' and attrs.get('href'):
            self.urls.append(attrs['href'])
        if tag == 'a' and 'download' in attrs and attrs.get('href'):
            self.urls.append(attrs['href'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--skip-hashes', action='store_true')
    parser.add_argument('--write-manifest', type=Path)
    args = parser.parse_args()
    data = json.loads((ROOT / 'source/copy.json').read_text())
    template = (ROOT / 'source/template.html').read_text()
    keys = set(re.findall(r'data-(?:i|aria|placeholder)="([^"]+)"', template))
    for lang in ('en', 'pt', 'ar'):
        require(keys <= data[lang].keys(), f'Traduções ausentes: {lang}')
        require(bool(data[lang]['formNote']), f'Nota ausente: {lang}')
    require('fieldPrinting' not in data['en'] and 'fieldArtwork' not in data['en'], 'Campos antigos nas traduções')
    require((ROOT / 'index.html').read_bytes() == (ROOT / 'dist/index.html').read_bytes(), 'HTML raiz/dist diverge')
    require(not re.search(r'__(?:COPY|STYLE|SCRIPT)__|\{\{embedded-\d+\}\}', (ROOT / 'index.html').read_text()), 'Placeholder não resolvido')
    for file in (ROOT / 'index.html', ROOT / 'dist/index.html', ROOT / 'recycla/index.html', ROOT / 'Recycla/index.html', ROOT / 'dist/recycla/index.html', ROOT / 'dist/Recycla/index.html'):
        parsed = Resources()
        parsed.feed(file.read_text())
        base = ROOT / 'dist' if file.is_relative_to(ROOT / 'dist') else ROOT
        for value in parsed.urls:
            url = urlsplit(value)
            if url.scheme or url.netloc or not url.path:
                continue
            target = base / unquote(url.path.lstrip('/')) if url.path.startswith('/') else file.parent / unquote(url.path)
            require(target.is_file(), f'Recurso ausente em {file.relative_to(ROOT)}: {value}')
        if file.parent in (ROOT, ROOT / 'dist'):
            require(not ({'printing', 'artwork'} & parsed.names), 'Campos antigos no formulário')
            require({'customer', 'business', 'material', 'quantity', 'location', 'deadline', 'notes'} <= parsed.names, 'Campos esperados ausentes')
    for media in ('eeco-materiais-promo-final.mp4', 'eeco-materiais-promo-cover.jpg'):
        require(media in template, f'Mídia não referenciada: {media}')
    require('assets/media/eeco-materiais-promo.mp4' not in template, 'Vídeo antigo referenciado')
    for directory in ('assets', 'recycla'):
        for p in (ROOT / directory).rglob('*'):
            if p.is_file():
                q = ROOT / 'dist' / p.relative_to(ROOT)
                require(q.is_file() and p.read_bytes() == q.read_bytes(), f'Cópia dist diverge: {p.relative_to(ROOT)}')
    require((ROOT / 'recycla/index.html').read_bytes() == (ROOT / 'Recycla/index.html').read_bytes(), 'Entrada Recycla diverge')
    files = runtime_files()
    expected = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
    if args.write_manifest:
        output = ROOT / args.write_manifest
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(''.join(f'{sha}  {path}\n' for path, sha in expected.items()))
        print(f'Manifesto gravado: {output.relative_to(ROOT)} ({len(expected)} arquivos).')
    elif not args.skip_hashes:
        manifest = {}
        for line in DEFAULT_MANIFEST.read_text().splitlines():
            sha, path = line.split('  ', 1)
            manifest[path] = sha
        require(expected.keys() == manifest.keys(), 'Lista de arquivos diverge do manifesto v28')
        for path, sha in manifest.items():
            require(expected[path] == sha, f'SHA-256 diverge: {path}')
    print(f'OK: estrutura, EN/PT/AR, recursos, formulário e distribuição ({len(expected)} arquivos).')


if __name__ == '__main__':
    main()
