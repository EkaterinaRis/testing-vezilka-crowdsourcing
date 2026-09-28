import easyocr

reader = easyocr.Reader(['en'])

image_path = "macedoniantext.jpg"

results = reader.readtext(image_path)

for bbox, text, confidence in results:
    print(f"{text} (confidence: {confidence:.2f})")