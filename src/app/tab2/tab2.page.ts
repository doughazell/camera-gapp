import { Component } from '@angular/core';

// 19/8/24 DH:
import { PhotoService, UserPhoto } from '../services/photo.service';

// 21/8/24 DH:
import { ActionSheetController } from '@ionic/angular';
// 7/10/24 DH:
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(public photoService: PhotoService,
    public actionSheetController: ActionSheetController) {}

  // 19/8/24 DH:
  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  // 6/10/24 DH:
  sendPhotoToGoogleWorkspace() {
    this.photoService.addNewToGallery()
    .then((capturedPhoto) => {

      // 6/10/24 DH:
      // 7/10/24 DH: https://capacitorjs.com/docs/apis/camera#photo
      console.log("capturedPhoto: ", capturedPhoto.path);

      let photoPath = "TBD";
      if (capturedPhoto.path) {
        photoPath = capturedPhoto.path;
      }

      this.photoService.appscriptService.emailImg(photoPath);
    });
    
  }

  // 7/10/24 DH:
  sharePhotoToGoogle() {
    
    //this.photoService.addNewToGallery()
    this.photoService.getPhoto()

    .then((capturedPhoto) => {
      if(capturedPhoto.path) {
        let pathSplit = capturedPhoto.path.split("/");
        let imgName = pathSplit.slice(-1)[0];

        Share.share({
          url: capturedPhoto.path,
          title: imgName
        });

        this.photoService.savePhoto(capturedPhoto);
      }
      
    });

  }

  async ngOnInit() {
    await this.photoService.loadSaved();
  }

  // 21/8/24 DH: https://ionicframework.com/docs/angular/your-first-app/live-reload
  public async showActionSheet(photo: UserPhoto, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoService.deletePicture(photo, position);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
          }
      }]
    });
    await actionSheet.present();
  }

}
