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

        this.photoService.appscriptService.emailImg(photoPath);
      }

    });
    
  }

  // 7/10/24 DH:
  sharePhotoToGoogle() {

    this.photoService.getPhoto()
    .then((capturedPhoto) => {
      if(capturedPhoto.path) {
        
        let pathSplit = capturedPhoto.path.split("/");
        let tempImgName = pathSplit.slice(-1)[0];

        let tempNameSplit = tempImgName.split("_");
        let imgName = tempNameSplit[1] + "_" + tempNameSplit[2] + ".jpg";

        // capturedPhoto: file:///storage/emulated/0/Android/data/io.ionic.starter/files/Pictures/JPEG_20241009_202633_8318761589904655285.jpg
        // imgName:       JPEG_20241009_202633_8318761589904655285.jpg
        console.log("capturedPhoto: ", capturedPhoto.path);
        console.log("tempImgName: ", tempImgName);
        console.log("imgName: ", imgName);

        // https://capacitorjs.com/docs/apis/share#shareoptions
        Share.share({
          url: capturedPhoto.path,
          title: imgName
        });

        this.photoService.savePhoto(capturedPhoto);

        // 9/10/24 DH:
        this.photoService.appscriptService.sendSharedFilename(imgName);

      }
      
    });

  }

  async ngOnInit() {
    await this.photoService.loadSaved();
  }

  // 21/8/24 DH: https://ionicframework.com/docs/angular/your-first-app/live-reload

  // 21/10/24 DH: https://ionicframework.com/docs/api/action-sheet
  //
  //   "icon": https://ionic.io/ionicons
  //
  public async showActionSheet(photo: UserPhoto, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',

      buttons: [
      {
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoService.deletePicture(photo, position);
        }
      }, 
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
        }
      },

      // 21/10/24 DH:
      {
        text: 'Show',
        icon: 'easel-outline',
        // 'role' can be either 'cancel' OR 'destructive' so create custom event:
        //  ----
        //   "When the didDismiss event is fired, the data and role fields of the event detail can be used to gather information about 
        //    how the Action Sheet was dismissed."
        data: {
          action: 'show',
        },
        handler: () => {
          this.photoService.showPicture(photo, position);
        }
      }
      ]
    });

    await actionSheet.present();
  }

}
