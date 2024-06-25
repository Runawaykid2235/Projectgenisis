import sys
import zipfile
from PIL import Image, ImageDraw
import random
import os
import shutil

print("Superimposer.py has been triggered!")
print(sys.argv[1])
print(f"Zip images to superimpose located at:", sys.argv[2])

directory_to_save = sys.argv[1]
zip_images_to_superimpose_location = sys.argv[2]
random_images_zip_location = "E:\TauriEDrive\ProjectGenisis\src-tauri\RandomImages\puppies.zip"

# Directory for images
file_path_random_images_zip = random_images_zip_location
file_path_png_images_zip = zip_images_to_superimpose_location + r'\uploaded_files_superimpose.zip'

# Unzip files
tmp_path = r'src-tauri\uploads_superimpose\tmp'

# Create paths for extracted images
file_path_random_images_unzipped = os.path.join(tmp_path, 'random_images_unzipped')
os.makedirs(file_path_random_images_unzipped, exist_ok=True)

file_path_png_unzipped = os.path.join(tmp_path, 'png_unzipped')
os.makedirs(file_path_png_unzipped, exist_ok=True)

# Unzip first 20 files from puppies.zip
with zipfile.ZipFile(file_path_random_images_zip, 'r') as zip_ref:
    # Get the first 20 image files
    first_20_files = zip_ref.namelist()[:20]
    for file_name in first_20_files:
        zip_ref.extract(file_name, file_path_random_images_unzipped)
print("extracted first 20 random images from puppies.zip")

# Unzip user-provided images
with zipfile.ZipFile(file_path_png_images_zip, 'r') as zip_ref:
    zip_ref.extractall(file_path_png_unzipped)
print("extracted user-provided images")

def random_number(limit):
    return random.uniform(0.1, limit)

png_image_files = [f for f in os.listdir(file_path_png_unzipped)]
random_image_files = [f for f in os.listdir(file_path_random_images_unzipped)]

counter = 0

for random_image_file in random_image_files:
    if counter < 20:
        print(random_image_file)
        random_image_path = os.path.join(file_path_random_images_unzipped, random_image_file)
        random_image = Image.open(random_image_path)

        #create blank mask
        mask = Image.new('L', random_image.size, 0)
        draw = ImageDraw.Draw(mask)

        #choose a random png to superimpose
        png_image_file = random.choice(png_image_files)
        png_image_path = os.path.join(file_path_png_unzipped, png_image_file)
        png_image = Image.open(png_image_path)

        #random transform and scale
        random_rotation = random_number(360)
        rotated_png = png_image.rotate(random_rotation, resample=Image.BICUBIC, expand=True)

        # Calculate maximum width and height ratios
        local_max_width_ratio = random_image.width / rotated_png.width
        local_max_height_ratio = random_image.height / rotated_png.height

        # Choose the smaller of the two ratios to preserve the original aspect ratio
        scaling_factor = random_number(min(local_max_width_ratio, local_max_height_ratio))
        
        # Resize PNG image based on scaling factor
        resized_png_image = rotated_png.resize((int(rotated_png.width * scaling_factor), int(rotated_png.height * scaling_factor)))
        
        # Calculate random position for pasting PNG image onto random image
        max_x = random_image.width - resized_png_image.width
        max_y = random_image.height - resized_png_image.height

        print(max_x, max_y)
        if max_x >= 0 and max_y >= 0:
            paste_position = (random.randint(0, max_x), random.randint(0, max_y))
            
            # Superimpose the PNG image on top of the random image
            random_image.paste(resized_png_image, paste_position, resized_png_image)
            
            # Draw the mask around the non-transparent pixels of the PNG image
            alpha = resized_png_image.convert("RGBA").split()[-1]
            mask.paste(alpha, paste_position)
        else:
            pass

        # Create directories for temporary masks and images
        mask_directory = os.path.join(tmp_path, 'temporaryMasks')
        os.makedirs(mask_directory, exist_ok=True)

        image_directory = os.path.join(tmp_path, 'temporaryImage')
        os.makedirs(image_directory, exist_ok=True)

        # Save mask and superimposed image
        mask_filename = os.path.splitext(os.path.basename(random_image_file))[0] + "_mask.png"
        mask_path = os.path.join(mask_directory, mask_filename)
        mask.save(mask_path)

        output_filename = os.path.basename(random_image_file)
        output_path = os.path.join(image_directory, f"superimposed_{output_filename}")
        random_image.save(output_path)

        # Increment counter
        counter += 1
    else:
        break

# Create a temporary directory to hold the contents of both folders
combined_tmp_path = os.path.join(tmp_path, 'combined_tmp')
os.makedirs(combined_tmp_path, exist_ok=True)

# Move the contents of temporaryMasks and temporaryImage into the combined_tmp folder
shutil.move(mask_directory, combined_tmp_path)
shutil.move(image_directory, combined_tmp_path)

# Zip the combined_tmp folder
final_zip_path = os.path.join(directory_to_save, 'mainzipfile')
shutil.make_archive(final_zip_path, 'zip', combined_tmp_path)

# Delete the combined_tmp folder
shutil.rmtree(combined_tmp_path)
shutil.rmtree(file_path_random_images_unzipped)
shutil.rmtree(file_path_png_unzipped)

print(f"Final step completed: zipped both folders into '{final_zip_path}'.")
