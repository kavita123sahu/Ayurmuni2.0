from PIL import Image, ImageFilter, ImageEnhance

src = r"c:\NewProjects\AyurmuniApp\src\assets\images\ayurmuniServiceCards.png"
out_dir = r"c:\NewProjects\AyurmuniApp\src\assets\images"
img = Image.open(src).convert("RGBA")
w, h = img.size

# Tighter phone bezel crop (center device)
left, right = int(w * 0.355), int(w * 0.645)
top, bottom = int(h * 0.085), int(h * 0.915)
screen = img.crop((left, top, right, bottom))
sw, sh = screen.size

# Content area between header and bottom nav
header, footer = int(sh * 0.105), int(sh * 0.125)
body = screen.crop((int(sw * 0.04), header, int(sw * 0.96), sh - footer))
bw, bh = body.size
gap = int(bh * 0.02)
usable = bh - gap * 2
card_h = usable // 3

names = ["consult", "medicines", "delivery"]
# Illustration focus boxes within each card (left side, skip outer chrome)
art_boxes = [
    (0.00, 0.08, 0.48, 0.92),
    (0.00, 0.06, 0.50, 0.94),
    (0.00, 0.06, 0.48, 0.94),
]

for i, name in enumerate(names):
    y0 = i * (card_h + gap)
    y1 = y0 + card_h
    card = body.crop((0, y0, bw, y1))
    # Upscale full card for sharper paste
    card_hi = card.resize((card.width * 3, card.height * 3), Image.Resampling.LANCZOS)
    card_hi = ImageEnhance.Sharpness(card_hi).enhance(1.15)
    card_hi.save(f"{out_dir}\\brand_{name}_card.png")

    ax0, ay0, ax1, ay1 = art_boxes[i]
    art = card.crop(
        (int(card.width * ax0), int(card.height * ay0), int(card.width * ax1), int(card.height * ay1))
    )
    art_hi = art.resize((art.width * 4, art.height * 4), Image.Resampling.LANCZOS)
    art_hi = ImageEnhance.Sharpness(art_hi).enhance(1.2)
    art_hi.save(f"{out_dir}\\brand_{name}_art.png")
    print(name, "card", card_hi.size, "art", art_hi.size)

print("done")
