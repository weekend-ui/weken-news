"""Generate logo.png and og-default.png brand assets for weken.news."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

PUBLIC = Path(__file__).resolve().parent.parent / 'public'

WK_GOLD = (245, 197, 24)      # #F5C518
WK_DARK = (31, 41, 55)         # #1F2937
WK_CREAM = (255, 253, 245)     # #FFFDF5

def find_font(prefer=['msjhbd.ttc', 'msjh.ttc', 'NotoSansCJKtc-Bold.otf', 'arialbd.ttf']):
    fonts_dir = Path('C:/Windows/Fonts')
    for name in prefer:
        p = fonts_dir / name
        if p.exists():
            return str(p)
    return None

font_path = find_font()
print(f'Using font: {font_path}')


def gen_logo():
    """512x512 brand logo - dark square with gold "wk" text."""
    size = 512
    img = Image.new('RGB', (size, size), WK_DARK)
    d = ImageDraw.Draw(img)
    if font_path:
        font = ImageFont.truetype(font_path, 240)
    else:
        font = ImageFont.load_default()
    text = 'wk'
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1]
    d.text((x, y), text, fill=WK_GOLD, font=font)
    img.save(PUBLIC / 'logo.png', optimize=True)
    print(f'logo.png saved: {size}x{size}')


def gen_og():
    """1200x630 OG image - cream background, brand wordmark + tagline."""
    W, H = 1200, 630
    img = Image.new('RGB', (W, H), WK_CREAM)
    d = ImageDraw.Draw(img)

    if font_path:
        title_font = ImageFont.truetype(font_path, 110)
        sub_font = ImageFont.truetype(font_path, 38)
        meta_font = ImageFont.truetype(font_path, 28)
    else:
        title_font = ImageFont.load_default()
        sub_font = ImageFont.load_default()
        meta_font = ImageFont.load_default()

    # Top left brand block
    d.rectangle([(80, 80), (96, 230)], fill=WK_GOLD)
    d.text((130, 80), 'weken.news', fill=WK_DARK, font=title_font)

    # Subtitle
    d.text((130, 230), '週末哥的第一手數據記錄', fill=WK_DARK, font=sub_font)

    # Tags row
    tags = ['台灣電商', 'AI 自動化', 'Meta 廣告', 'AEO 建站']
    x = 130
    y = 320
    for tag in tags:
        bbox = d.textbbox((0, 0), tag, font=sub_font)
        tw = bbox[2] - bbox[0]
        d.rounded_rectangle([(x, y - 8), (x + tw + 32, y + 50)], radius=8,
                             outline=WK_GOLD, width=2)
        d.text((x + 16, y), tag, fill=WK_DARK, font=sub_font)
        x += tw + 56

    # Bottom right meta
    d.text((130, 510), 'weken.news', fill=WK_GOLD, font=meta_font)
    d.text((130, 550), '@wk.change · Threads', fill=WK_DARK, font=meta_font)

    # Right side accent block
    d.rectangle([(W - 60, 0), (W, H)], fill=WK_GOLD)

    img.save(PUBLIC / 'og-default.png', optimize=True)
    print(f'og-default.png saved: {W}x{H}')


if __name__ == '__main__':
    gen_logo()
    gen_og()
