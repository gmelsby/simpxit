from PIL import Image #type: ignore
import numpy as np #type: ignore
from pathlib import Path

image_path = 'images/S03E22_295585.webp'

with Image.open(image_path, 'r').convert('L') as image:
  img_arr = np.array(image)
  # gets dimensions of image
  pixel_count = len(img_arr) * len(img_arr[0])
  # filters for pictures with greyscale value < 10
  dark_pixels = np.count_nonzero(img_arr < 10)

  print(f'{round(dark_pixels / pixel_count * 100, 2)}% dark pixels')