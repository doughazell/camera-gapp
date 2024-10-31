/*
 * 7/10/24 DH: CREATED WITH: 
 *             camera-gapp$ ionic g service services/appscript
 */

import { Injectable } from '@angular/core';

import { EmailComposer } from 'capacitor-email-composer';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppscriptService {
  // "$ ionic serve" uses https://www.npmjs.com/package/webpack-dev-server

  // -------------------------------------------------------
  // *** NOTE: REMOVE ACTIVE URL BEFORE ADDING TO GITHUB ***
  // -------------------------------------------------------
  public url1 = '';

  public url2 = '';

  constructor(private http: HttpClient) { }

  // ------------
  // Email image
  // ------------
  
  // 7/10/24 DH:
  emailImg(imgPath: string) {
    //let imgName = "balavil-sunset.jpg";

    // eg "imgPath:  
    //   CAPACITOR FILESYSTEM:     file:///data/user/0/io.ionic.starter/files/1728262878778.jpeg"
    //   ANDROID INTERNAL STORAGE: file:///storage/emulated/0/Android/data/io.ionic.starter/files/Pictures/JPEG_20241007_164309_575320056677864398.jpg"
    console.log("imgPath: ", imgPath);
    let pathSplit = imgPath.split("/");
    let imgName = pathSplit.slice(-1)[0];
    console.log("imgName: ", imgName)
    
    // https://github.com/EinfachHans/capacitor-email-composer
    EmailComposer.open({
      to: ["doughazell@gmail.com"],
      subject: "Knock 3 times and ask for Alan",
      attachments: [{
        //type: 'asset',
        //path: '/' + imgName // starting slash is important for Angular

        type: 'absolute',
        path: 'storage/emulated/0/Android/data/io.ionic.starter/files/Pictures/JPEG_20241008_003938_6658997140349880642.jpg'
      }]
    }).then((response) => {
      console.log('Email Response: ', response);
    });

    let formData: FormData = new FormData();
    this.postGScript("addEmailImg", "Copy of KIT", imgName, formData);

  }

  // 9/10/24 DH:
  sendSharedFilename(imgName: string) {
    let formData: FormData = new FormData();
    this.postGScript("addSharedImg", "Copy of KIT", imgName, formData);
  }

   // 7/10/24 DH:
  postGScript(action: string, sheetName: string, value: string, formData: FormData) {
    let retVal: Observable<any>;
    // 28/9/24 DH: https://v17.angular.io/guide/http-send-data-to-server
    let params = new HttpParams();

    params = params.set('action', action);
    params = params.set('sheetName', sheetName);
    params = params.set('value', value);

    console.log("Calling 'this.http.post()'");
    
    // 28/9/24 DH: (14:30) Get CORS error without sending data arg (prob a "port scan" defence)
    retVal = this.http.post(this.url2, formData, {params: params, responseType: 'text'});

    // 18/9/24 DH: Without 'retVal.subscribe(...)' then NOT WORK
    retVal.subscribe((response) => {
      console.log('Response: ', response);
    });

  }

}
