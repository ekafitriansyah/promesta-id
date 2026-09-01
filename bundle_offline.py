import os
import json
import re

def bundle_offline():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Remove the download offline HTML button from the standalone offline version
    html = re.sub(r'<!-- OFFLINE_DOWNLOAD_BUTTON_START -->[\s\S]*?<!-- OFFLINE_DOWNLOAD_BUTTON_END -->', '', html)
    html = re.sub(r'<a\b[^>]*id=["\']btn-download-offline["\'][\s\S]*?</a>', '', html)

    with open('styles.css', 'r', encoding='utf-8') as f:
        css = f.read()

    with open('app.js', 'r', encoding='utf-8') as f:
        js = f.read()

    with open('capaian_pembelajaran_bskap_046_2025.json', 'r', encoding='utf-8') as f:
        cp_json = f.read()

    lucide_path = 'node_modules/lucide/dist/umd/lucide.min.js'
    if os.path.exists(lucide_path):
        with open(lucide_path, 'r', encoding='utf-8') as f:
            lucide_js = f.read()
    else:
        lucide_js = ''

    xlsx_path = 'xlsx.full.min.js'
    if os.path.exists(xlsx_path):
        with open(xlsx_path, 'r', encoding='utf-8') as f:
            xlsx_js = f.read()
    else:
        xlsx_js = ''

    # Replace external stylesheet with inline CSS
    html = html.replace('<link rel="stylesheet" href="./styles.css">', f'<style>\n{css}\n</style>')

    # Escape closing script tags to prevent HTML parser syntax breaks
    def safe_script_content(content):
        return content.replace('</script>', '<\\/script>').replace('<!--', '<\\!--')

    xlsx_safe = safe_script_content(xlsx_js)
    lucide_safe = safe_script_content(lucide_js)
    js_safe = safe_script_content(js)
    cp_json_safe = safe_script_content(cp_json)

    # Inline XLSX library
    html = re.sub(
        r'<script src="[^"]*xlsx[^"]*"(?:[^>]*)></script>',
        lambda m: f'<script>\n{xlsx_safe}\n</script>',
        html
    )

    # Inline Lucide icons library
    html = re.sub(
        r'<script src="[^"]*lucide[^"]*"(?:[^>]*)></script>',
        lambda m: f'<script>\n{lucide_safe}\n</script>',
        html
    )

    # Inline CP Database and main application script
    embedded_script = f'''
    <script>
    window.BSKAP_046_DATA = {cp_json_safe};
    </script>
    <script>
    {js_safe}
    </script>
    '''

    html = html.replace('<script type="module" src="./app.js"></script>', embedded_script)

    os.makedirs('public', exist_ok=True)
    with open('public/promesta-offline.html', 'w', encoding='utf-8') as f:
        f.write(html)

    if os.path.exists('dist'):
        with open('dist/promesta-offline.html', 'w', encoding='utf-8') as f:
            f.write(html)

    print(f'Successfully bundled 100% self-contained public/promesta-offline.html ({len(html):,} bytes)')

if __name__ == '__main__':
    bundle_offline()
