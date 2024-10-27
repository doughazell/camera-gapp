import { Injectable } from '@angular/core';
// 19/8/24 DH:
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

// 7/10/24 DH:
import { AppscriptService } from './appscript.service';

// 27/10/24 DH:
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';
  private platform: Platform;

  // 21/10/24 DH:
  /*
  options: ViewerOptions = {} as ViewerOptions;
  pvPlugin: any;
  show: any;
  //viewerPage: ViewerPage;
  */

  constructor(platform: Platform, public appscriptService: AppscriptService, private router: Router) { 
    this.platform = platform;
  }

  // 21/10/24 DH:
  public async showPicture(photo: UserPhoto, position: number) {
    //console.log("showPicture(): photo.filepath: ", photo.filepath);
    //console.log("photo.webviewPath: ", photo.webviewPath);

    // 27/10/24 DH: in shock that I've actually integrated 'photoviewer'...

    // modes: 'one', 'gallery', 'slider'
    this.router.navigateByUrl('/tabs/tab2/viewer/slider/' + position);

  }

  // 27/10/24 DH:
  public getPicture(idx: number) {
    return this.photos[idx];
  }

  // 19/8/24 DH: and we're back in Ionic/Angular land...:)
  public async addNewToGallery() {
    // Take a photo
    // https://capacitorjs.com/docs/apis/camera#getphoto
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    /* Tutorial placeholder code
    this.photos.unshift({
      filepath: "soon...",
      webviewPath: capturedPhoto.webPath!
    });
    */

    // Save the picture and add it to photo collection
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    console.log("savedImageFile.filepath: ", savedImageFile.filepath);
    console.log("savedImageFile.webviewPath: ", savedImageFile.webviewPath);

    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });

    // 7/10/24 DH:
    return capturedPhoto;
    
  }

  // 8/10/24 DH:
  public async getPhoto() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    return capturedPhoto;
  }

  // 8/10/24 DH:
  public async savePhoto(photo: Photo) {
    // Save the picture and add it to photo collection
    const savedImageFile = await this.savePicture(photo);
    this.photos.unshift(savedImageFile);

    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  public async loadSaved() {
    // Retrieve cached photo array data
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    // Easiest way to detect when running on the web:
    // “when the platform is NOT hybrid, do this”
    if (!this.platform.is('hybrid')) {
      

      // Display the photo by reading into base64 format
      for (let photo of this.photos) {
        
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
            path: photo.filepath,
            directory: Directory.Data
        });

        // Web platform only: Load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
        
      }
    }
  }

  private async savePicture(photo: Photo) { 
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo);

    // Write the file to the data directory
    const fileName = Date.now() + '.jpeg';
    // 1/10/24 DH: https://capacitorjs.com/docs/apis/filesystem#writefileoptions
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    }
    else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: photo.webPath
      };
    }

  }

  private async readAsBase64(photo: Photo) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path!
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }
  
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  // 21/8/24 DH:
  public async deletePicture(photo: UserPhoto, position: number) {
    // Remove this photo from the Photos reference data array
    this.photos.splice(position, 1);
  
    // Update photos array cache by overwriting the existing photo array
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });
  
    // delete photo file from filesystem
    const filename = photo.filepath
                        .substr(photo.filepath.lastIndexOf('/') + 1);
  
    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Data
    });
  }

}

// 19/8/24 DH:
export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

