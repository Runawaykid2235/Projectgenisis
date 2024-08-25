# A tauri app for augmenting images for better model performance
AugmentPro is a simple desktop application designed for image augmentation, allowing you to superimpose images or apply various augmentation techniques. 
The primary goal is to create a new dataset with synthetic data to increase variance, leading to more robust models.

# How to run
Clone the repository.
Navigate to project directory.

run the following command to start app in dev mode:
```Npm run tauri dev```

To build the project into an executable you can run:
```Npm run tauri build```

this will create a .exe and will be saved as AugmentPro.exe at /projectgenisis/src-tauri/target/release/AugmentPro.exe

# How to use
When running choose either the superimposer or dashboard on the left hand side.

Superimposer:
Takes two sets of images, "images you wish to superimpose" and background images you wish to superimpose onto.
After uploading both, choose what amount of images you want at the end (ex. 100).
Click send files and wait.

This will store a zipfile at a predisclosed path, which you can choose under profile.

Image augmenter:
Go to the dashboard, choose a set of images. Choose rotation, scaling or blur and hit upload files.
Again you will get a zipfile of the augmented images at the prechosen path!


Want to change storage path? Simply choose a new path for either superimposer or augmenter and hit save directories!



# dependincies
Following dependencies are necesarry:
Python 3.12
Rust 
React


## Want to commit?
Want to contribute? Simply fork the project, make your changes, and submit a pull request. I'll review it and consider merging your contributions.g
