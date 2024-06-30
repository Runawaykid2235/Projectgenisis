// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{env, fs::{self, File}, os::windows::process::CommandExt};
use tauri::api::path::document_dir;
use std::io::Write;
use zip::write::FileOptions;
use std::process::{Command, Stdio};

#[derive(serde::Deserialize, Debug)]
struct FileUpload {
    filename: String,
    data: String, // Base64 encoded file content
    test: String,
    inputvar: String,
}

#[derive(serde::Deserialize, Debug)]
struct FileUploadSuperimpose {
    filename: String,
    filename2: String,
    data: String,
    data2: String,
    amount: String,
}



#[derive(serde::Deserialize, Debug)]
struct UserChosenDirectory {
    directoryforsuperimposing: String,
    directoryforaugmentation: String,
}

#[tauri::command]
fn save_user_directories(directories: UserChosenDirectory) -> Result<(), String> {
    let save_path = document_dir().ok_or("Could not determine documents directory")?.join("directory_path.txt");

    let data = format!(
        "Superimpose Directory: {}\nAugmentation Directory: {}\n",
        directories.directoryforsuperimposing, directories.directoryforaugmentation
    );

    let mut file = File::create(save_path).map_err(|e| e.to_string())?;
    file.write_all(data.as_bytes()).map_err(|e| e.to_string())?;

    Ok(())
}


#[tauri::command]
fn superimpose_user_images(file_uploads_superimpose: Vec<FileUploadSuperimpose>) -> Result<(), String> {
    // First get user's temporary directory
    let temp_dir = env::temp_dir();
    let augment_pro_dir = temp_dir.join("AugmentPro");
    let upload_dir_superimpose = augment_pro_dir.join("Uploads_superimpose");

    // Create the directories if they don't exist
    if let Err(err) = fs::create_dir_all(&upload_dir_superimpose) {
        return Err(format!("Failed to create upload directory: {:?}", err));
    }

    // Get the path where the user wishes to save the final superimposed images to (These are later passed to the superimposer.py)
    let (superimpose_dir, _) = read_user_directories()?;

    let zip_path_superimposer = upload_dir_superimpose.join("uploaded_files_superimpose.zip");
    let zip_file_superimposer = File::create(&zip_path_superimposer)
        .map_err(|e| format!("Failed to create zip file: {:?}", e))?;
    let mut zip_superimpose = zip::ZipWriter::new(zip_file_superimposer);

    for file_upload in &file_uploads_superimpose {
        let filename_superimpose = &file_upload.filename;
        let decoded_data_fileupload = base64::decode(&file_upload.data)
            .map_err(|e| format!("Base64 decode error: {:?}", e))?;

        zip_superimpose.start_file(filename_superimpose, FileOptions::default())
            .map_err(|e| format!("Failed to start file in zip: {:?}", e))?;
        zip_superimpose.write_all(&decoded_data_fileupload)
            .map_err(|e| format!("Failed to write to zip file: {:?}", e))?;
    }

    // Do the same but for the images to superimpose onto
    let upload_random_images_to_superimpose_onto = augment_pro_dir.join("Uploads_to_superimpose_onto");

    // Create the directories if they don't exist
    if let Err(err) = fs::create_dir_all(&upload_random_images_to_superimpose_onto) {
        return Err(format!("Failed to create a directory for random images to superimpose onto: {:?}", err));
    }

    let zip_path_random_images_to_superimpose_onto = upload_random_images_to_superimpose_onto.join("uploaded_files_to_superimpose_onto.zip");
    let zip_file_random_images_to_superimpose_onto = File::create(&zip_path_random_images_to_superimpose_onto)
        .map_err(|e| format!("Failed to create zip file: {:?}", e))?;
    let mut zip_random_images_to_superimpose_onto = zip::ZipWriter::new(zip_file_random_images_to_superimpose_onto);

    for file_upload in &file_uploads_superimpose {
        let filename_superimpose_onto = &file_upload.filename2;
        let decoded_data_fileupload_onto = base64::decode(&file_upload.data2)
            .map_err(|e| format!("Base64 decode error: {:?}", e))?;

        zip_random_images_to_superimpose_onto.start_file(filename_superimpose_onto, FileOptions::default())
            .map_err(|e| format!("Failed to start file in zip: {:?}", e))?;
        zip_random_images_to_superimpose_onto.write_all(&decoded_data_fileupload_onto)
            .map_err(|e| format!("Failed to write to zip file: {:?}", e))?;
    }

    zip_superimpose.finish().map_err(|e| format!("Failed to finish zip file: {:?}", e))?;
    zip_random_images_to_superimpose_onto.finish().map_err(|e| format!("Failed to finish zip file: {:?}", e))?;

    if let Some(first_upload) = file_uploads_superimpose.first() {
        let python_executable = "python";
        let script_path = "E:\\TauriEDrive\\ProjectGenisis\\src-tauri\\src\\Superimposer.py";
        let create_no_window = 0x08000000;

        // Extract the amount from the first file upload
        let amount = &first_upload.amount;

        println!("script_path = {:?}", script_path);
        println!("superimpose_dir = {:?}", superimpose_dir);
        println!("upload_dir_superimpose = {:?}", upload_dir_superimpose);
        println!("upload_random_images_to_superimpose_onto = {:?}", upload_random_images_to_superimpose_onto);
        println!("amount = {:?}", amount);



        
        let output = Command::new(python_executable)
            .arg(script_path)
            .arg(superimpose_dir)
            .arg(upload_dir_superimpose)
            .arg(amount)  // Pass the amount to the Python script
            .arg(upload_random_images_to_superimpose_onto)  // Pass the directory with the second set of images
            .stdin(Stdio::null())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .creation_flags(create_no_window)
            .output()
            .map_err(|e| format!("Failed to execute Python script: {:?}", e))?;

        if output.status.success() {
            println!("Python script output:");
            println!("{}", String::from_utf8_lossy(&output.stdout));
        } else {
            eprintln!("Error executing Python script:");
            eprintln!("{}", String::from_utf8_lossy(&output.stderr));
        }
    }

    Ok(())
}



#[tauri::command]
fn read_user_directories() -> Result<(String, String), String> {
    let save_path = document_dir().ok_or("Could not determine documents directory")?.join("directory_path.txt");
    let content = std::fs::read_to_string(save_path).map_err(|e| e.to_string())?;

    let mut lines = content.lines();
    let superimpose_dir = lines.next().ok_or("Missing superimpose directory")?.replace("Superimpose Directory: ", "");
    let augmentation_dir = lines.next().ok_or("Missing augmentation directory")?.replace("Augmentation Directory: ", "");

    Ok((superimpose_dir, augmentation_dir))
}





#[tauri::command] // Command for image augmentation
fn files_send_from_front(file_uploads: Vec<FileUpload>) -> Result<(), String> {
    let (_, augmentation_dir) = read_user_directories()?;

    let upload_dir = format!("{}/uploads/", augmentation_dir);
    if let Err(err) = fs::create_dir_all(&upload_dir) {
        return Err(format!("Failed to create upload directory: {:?}", err));
    }

    let zip_path = format!("{}/uploaded_files.zip", upload_dir);
    let zip_file = File::create(&zip_path).map_err(|e| format!("Failed to create zip file: {:?}", e))?;
    let mut zip = zip::ZipWriter::new(zip_file);

    for file_upload in &file_uploads {
        let filename = &file_upload.filename;
        let decoded_data = base64::decode(&file_upload.data)
            .map_err(|e| format!("Base64 decode error: {:?}", e))?;

        zip.start_file(filename, FileOptions::default())
            .map_err(|e| format!("Failed to start file in zip: {:?}", e))?;
        zip.write_all(&decoded_data)
            .map_err(|e| format!("Failed to write to zip file: {:?}", e))?;
    }

    zip.finish().map_err(|e| format!("Failed to finish zip file: {:?}", e))?;

    if let Some(first_upload) = file_uploads.first() {
        let python_executable = "python";
        let script_path = "E:\\TauriEDrive\\ProjectGenisis\\src-tauri\\src\\Image_processing.py";
        let test_arg = &first_upload.test;
        let input_arg = &first_upload.inputvar;

        let output = Command::new(python_executable)
            .arg(script_path)
            .arg(test_arg)
            .arg(input_arg)
            .stdout(Stdio::piped())
            .output()
            .map_err(|e| format!("Failed to execute Python script: {:?}", e))?;

        if output.status.success() {
            println!("Python script output:");
            println!("{}", String::from_utf8_lossy(&output.stdout));
        } else {
            eprintln!("Error executing Python script:");
            eprintln!("{}", String::from_utf8_lossy(&output.stderr));
        }
    }

    Ok(())
}






fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![files_send_from_front, superimpose_user_images, save_user_directories, read_user_directories])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
