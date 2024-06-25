import zipfile
import sys
import os
import json
from PIL import Image, ImageFilter

# Set absolute directory for the temporary file path where we unzip and augment images
temporary_file_path = r"E:\TauriEDrive\ProjectGenisis\src-tauri\Temporary_image_folder"

# Create subdirectory for extraction
subfolder_name = "Subfolder"
temporary_file_path_subfolder = os.path.join(temporary_file_path, subfolder_name)
os.makedirs(temporary_file_path_subfolder, exist_ok=True)

# Path to the zipped images
zipped_images_path = r"E:\TauriEDrive\ProjectGenisis\src-tauri\uploads\uploaded_files.zip"

try:
    # Extract images to subfolder within temporary path
    with zipfile.ZipFile(zipped_images_path, 'r') as zip_ref:
        zip_ref.extractall(temporary_file_path_subfolder)
    print(f"Extracted the images and placed in {subfolder_name} folder")
except Exception as e:
    print(f"Error extracting images: {e}")

def user_wants():
    # Default parameters
    rotation_angle = 90
    scaling_factor = 0.5  # Example scaling factor (50%)
    blur_radius = 2       # Example blur radius
    
    # Assuming data is passed as a JSON string via command line argument
    data_str = sys.argv[1]
    data_2 = sys.argv[2]
    user_chosen_path = sys.argv[0]
    
    print(f"data_str:", data_str)
    print(f"data_2:", data_2)
    print(f"User chosen path", user_chosen_path)
    
    try:
        # Convert JSON string to Python dictionary
        data = json.loads(data_str)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return

    # Retrieve processing options
    rotation = data.get("Rotation", False)
    scaling = data.get("Scaling", False)
    blur = data.get("Blur", False)

    # Process rotation if enabled
    if rotation:
        print("Rotation is enabled")
        for filename in os.listdir(temporary_file_path_subfolder):
            file_path = os.path.join(temporary_file_path_subfolder, filename)
            # Check if the file is an image
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif')):
                try:
                    with Image.open(file_path) as img:
                        # Rotate image
                        rotated_img = img.rotate(rotation_angle, expand=True)
                        # Save the rotated image
                        rotated_img.save(os.path.join(user_chosen_path, filename))
                        print(f"Rotated {filename} by {rotation_angle} degrees")
                except Exception as e:
                    print(f"Error rotating image {filename}: {e}")

    # Process scaling if enabled
    if scaling:
        print("Scaling is enabled")
        for filename in os.listdir(temporary_file_path_subfolder):
            file_path = os.path.join(temporary_file_path_subfolder, filename)
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif')):
                try:
                    with Image.open(file_path) as img:
                        # Calculate new dimensions
                        new_width = int(img.width * scaling_factor)
                        new_height = int(img.height * scaling_factor)
                        # Resize image
                        scaled_img = img.resize((new_width, new_height), Image.ANTIALIAS)
                        # Save the scaled image
                        scaled_img.save(os.path.join(user_chosen_path, filename))
                        print(f"Scaled {filename} by a factor of {scaling_factor}")
                except Exception as e:
                    print(f"Error scaling image {filename}: {e}")

    # Process blur if enabled
    if blur:
        print("Blur is enabled")
        for filename in os.listdir(temporary_file_path_subfolder):
            file_path = os.path.join(temporary_file_path_subfolder, filename)
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif')):
                try:
                    with Image.open(file_path) as img:
                        # Apply blur
                        blurred_img = img.filter(ImageFilter.GaussianBlur(blur_radius))
                        # Save the blurred image
                        blurred_img.save(os.path.join(user_chosen_path, filename))
                        print(f"Applied blur to {filename} with radius {blur_radius}")
                except Exception as e:
                    print(f"Error applying blur to image {filename}: {e}")

if __name__ == "__main__":
    user_wants()
