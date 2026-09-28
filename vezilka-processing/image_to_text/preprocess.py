from PIL import Image, ImageOps, ImageFilter, ImageEnhance

def preprocess(img: Image.Image) -> Image.Image:
    img = img.convert("L")
    
    img = ImageOps.autocontrast(img, cutoff=0.5)
    
    img = ImageEnhance.Sharpness(img).enhance(1.05)
    
    stat = img.getextrema()
    midpoint = (stat[0] + stat[1]) / 2
    img = img.point(lambda p: 255 if p > midpoint else 0)
    
    img = img.filter(ImageFilter.MinFilter(3))
    img = img.filter(ImageFilter.MedianFilter(3))

    # processed_path = "./data/preprocessed_debug.png"
    # img.save(processed_path)
    return img