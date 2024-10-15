import { Component, Injectable } from '@angular/core';

// 17/9/24 DH: Taken from 'ionic-camera-swipe/src/app/tab3/selection/selection.component.ts'
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// 4/10/24 DH:
import { EmailComposer } from 'capacitor-email-composer';

// 7/10/24 DH:
import { AppscriptService } from '../services/appscript.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})

// 17/9/24 DH: https://angular.dev/guide/http/setup#providing-httpclient-through-dependency-injection
// 18/9/24 DH: @Injectable decorator not needed BUT "providers: [..., provideHttpClient(),]," IS NEEDED in 'app.module.ts'
//@Injectable({providedIn: 'root'})
export class Tab3Page {

  filename: string;
  gdriveImg: string;
  imgBase64Src: string;
  dtg1: string;
  dtg2: string;

  // 8/5/22 DH: Ideally this should be read from the google sheet for DB normalisation (legacy comment from 'selection.component.ts')
  fileList: string[] = [
    'Rick&Morty-viewer2Insight-scaled.png',
    'moses-fishing.jpg',
    'Hens-B&WMinstrel.jpg',
    'me-HauteRoute96.jpg',
    'Rick&Morty-robotVsVideogame.png'
  ];

  constructor(private http: HttpClient, private appscriptService: AppscriptService) {
    this.filename = "TBD";
    this.gdriveImg = "20241010_192026.jpg";
    this.imgBase64Src = "";
    this.dtg1 = "";
    this.dtg2 = "";
  }

  // 17/9/24 DH: A fresh start with GScript interaction using Ionic 7/Angular 18/Node 20
  
  // ---------------
  // HttpClient Get
  // ---------------

  getGScript() {
    
    let retVal: Observable<any>;

    console.log("Calling 'this.http.get()'");
    
    //retVal = this.http.get(this.url, {responseType: 'text'});
    retVal = this.http.get(this.appscriptService.url2, {responseType: 'text'});

    // 18/9/24 DH: Without 'retVal.subscribe(...)' then IMAGE NOT ADDED to Google Sheet...wtf???
    retVal.subscribe((response) => {
      console.log('Response: ', response);
    });
    
  }

  // ----------------
  // HttpClient Post
  // ----------------

  // 2/10/24 DH: doPost(passedParams)
  //   ..., parameter":{"sheetName":"Copy of KIT","value":"balavil-sunset.jpg","action":"addImg"},"contentLength":50713, ...
  //
  // 'contentLength' looks about right for '50495 balavil-sunset.jpg' so Google Workspace MUST BE FILTERING passed blob's
  //
  // Capacitor Filesystem on Android has TLD of "Internal storage/Android/data/io.ionic.start" (https://capacitorjs.com/docs/apis/filesystem#directory)
  //   We need symlink from Capacitor TLD to Google Drive to upload image (whose filename gets sent via Post):
  //
  //     https://developer.android.com/reference/android/system/Os.html#symlink(java.lang.String,%20java.lang.String)

  // 1/10/24 DH:
  postImg() {
    let imgName = "balavil-sunset.jpg";
    // 1/10/24 DH: "FormData" is Javascript (NOT Angular)
    // https://developer.mozilla.org/en-US/docs/Web/API/FormData
    let formData: FormData = new FormData();

    // 9/10/24 DH: 'http.get()' IS ONLY to get image from 'assets' (during Android 'fs' "working-model-up"...)
    //             THEN 
    //             'http.post('addImg', 'balavil-sunset.jpg', blob)'
    this.http.get('assets/'+imgName, {responseType: 'blob'})
    .subscribe(blob => {

      formData.append('addImg', blob);
      this.postGScriptLocal("addImg", "Copy of KIT", imgName, formData);

    });
        
  }

  // 1/10/24 DH:
  postGScriptLocal(action: string, sheetName: string, value: string, formData: FormData) {
    let retVal: Observable<any>;
    // 28/9/24 DH: https://v17.angular.io/guide/http-send-data-to-server
    let params = new HttpParams();

    params = params.set('action', action);
    params = params.set('sheetName', sheetName);
    params = params.set('value', value);

    console.log("Calling 'this.http.post()'");
    
    // 28/9/24 DH: (14:30) Get CORS error without sending data arg (prob a "port scan" defence)
    //retVal = this.http.post(this.url, formData, {params: params, responseType: 'text'});
    retVal = this.http.post(this.appscriptService.url2, formData, {params: params, responseType: 'text'});

    // 18/9/24 DH: Without 'retVal.subscribe(...)' then NOT WORK
    retVal.subscribe((response) => {
      console.log('Response: ', response);
    });

  }

  // 19/9/24 DH: Working 22:54 to specify the filename in Drive to add to the sheet (workaround since unable to post image yet)

  // -------------
  // fetch() Post
  // -------------

  sendFilenameToGScript() {
    fetch(this.appscriptService.url2, { method: "POST", body: this.filename })
      .then((res) => {
        console.log("1st Promise: " + res.status);
        return res.text(); // Promise necessary since Response stream read to eof
        //return res.json()
      })
      .then((res) => console.log("2nd Promise: " + res));
  }

  // ------------
  // Email image
  // ------------
  
  // 4/10/24 DH:
  emailImg() {
    let imgName = "balavil-sunset.jpg";
    
    EmailComposer.open({
      to: ["doughazell@gmail.com"],
      subject: "Knock 3 times and ask for Alan",
      attachments: [{
        type: 'asset',
        path: '/' + imgName // starting slash is important
      }]
    }).then((response) => {
      console.log('Email Response: ', response);
    });

    let formData: FormData = new FormData();
    this.postGScriptLocal("addEmailImg", "Copy of KIT", imgName, formData);

  }

  // -----------------
  // Get GDrive image
  // -----------------

  // 13/10/24 DH:
  getGDriveImg() {
    let formData: FormData = new FormData();

    let retVal: Observable<any>;
    // 28/9/24 DH: https://v17.angular.io/guide/http-send-data-to-server
    let params = new HttpParams();

    params = params.set('action', 'getDriveImg');
    params = params.set('value', this.gdriveImg);

    console.log("Calling 'this.http.post()'");
    
    this.dtg1 = new Date().toString();

    // 28/9/24 DH: (14:30) Get CORS error without sending data arg (prob a "port scan" defence)
    
    // https://v17.angular.io/api/common/http/HttpClient
    retVal = this.http.post(this.appscriptService.url2, formData, {params: params, responseType: 'text'});
    //retVal = this.http.post(this.appscriptService.url2, formData, {params: params, responseType: 'arraybuffer'});
    
    // Capacitor on Android returns: "Msg: ERROR [object Object]"
    //retVal = this.http.post(this.appscriptService.url2, formData, {params: params, responseType: 'json'});

    // 18/9/24 DH: Without 'retVal.subscribe(...)' then NOT WORK
    retVal.subscribe((base64Img) => {
      // Timings (secs)
      // -------
      // Resized image: 7,9,7 (slower than Browser Google JS, see 'driveUtils.gs') 

      this.dtg2 = new Date().toString();

      let srcHdrStr = "data:image/png;base64, ";

      // 14/10/24 DH: <img [src]="imgBase64Src"> DOM Obj resolves the JPG/Base64 string
      this.imgBase64Src = srcHdrStr + base64Img;

    });

  }

}
