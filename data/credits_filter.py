from PIL import Image #type: ignore
import numpy as np #type: ignore
from pathlib import Path
import sys


def dark_pixel_percentage(image_path: str, pixel_value_cutoff: int=10) -> float:
    """
    Returns the percentage of dark pixels in the image at image_path 
    A pixel is considered dark if its greyscale value is < pixel_value_cutoff
    """
    with Image.open(image_path, 'r').convert('L') as image:
        img_arr = np.array(image)
        # gets dimensions of image
        pixel_count = len(img_arr) * len(img_arr[0])
        # filters for pictures with greyscale value < 10
        dark_pixels = np.count_nonzero(img_arr < pixel_value_cutoff)
        
        return dark_pixels / pixel_count * 100

def main(args):
    percent_threshold = int(args[1]) if len(args) > 1 else 70
    pixel_cutoff = int(args[2]) if len(args) > 2 else 10

    image_paths = Path('images').glob('*.webp')
    for image in image_paths:
        percentage = dark_pixel_percentage(image, pixel_cutoff)
        if percentage >= percent_threshold:
            print(Path(image).name)

if __name__ == '__main__':
    main(sys.argv)
