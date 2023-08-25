# Asset-Service
- An asset-service capabale of hosting images, audio, or text-based files.

## Pipeline
The service uploads files to  specific google drive folder. All files are downloaded to the service directory allowing them to have a public url to the asset/resource.

## Data 
Files can be uploaded to the drive to a specific folder differentiated by category.
The home page offers actions such as downloading the entire drive or specific modules by category.
You can view all assets which will show you all assets currently living in the service and are ready to be used.

## Adding a New Folder to the Drive
The folder must be a child of either the IMAGES, AUDIO, or JSON folder. From there you can choose one of these subfolders to upload to. Adding a new folder to the drive requires a new app deployment. I want to improve on that in the future so a folder can be added without the need for a re-deployment.