import { Component, Injectable } from '@angular/core';

// 17/9/24 DH: Taken from 'ionic-camera-swipe/src/app/tab3/selection/selection.component.ts'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})

// 17/9/24 DH: https://angular.dev/guide/http/setup#providing-httpclient-through-dependency-injection
// 18/9/24 DH: @Injectable decorator not needed BUT "providers: [..., provideHttpClient(),]," IS NEEDED in 'app.module.ts'
//@Injectable({providedIn: 'root'})
export class Tab3Page {
  private url = 'https://script.google.com/macros/s/AKfycbwA7RO2AwhpKC7AnBo-0VmBtjMNiQFZmdz4ORbunEYYq0vpVOIb2rHkPI0xSPMDfaMm3A/exec';

  filename: string;

  // 8/5/22 DH: Ideally this should be read from the google sheet for DB normalisation (legacy comment from 'selection.component.ts')
  fileList: string[] = [
    'Rick&Morty-viewer2Insight-scaled.png',
    'moses-fishing.jpg',
    'Hens-B&WMinstrel.jpg',
    'me-HauteRoute96.jpg',
    'Rick&Morty-robotVsVideogame.png'
  ];

  constructor(private http: HttpClient) {
    this.filename = "TBD";
  }

  // 17/9/24 DH: A fresh start with GScript interaction using Ionic 7/Angular 18/Node 20
  getGScript() {
    
    let retVal: Observable<any>;

    console.log("Calling 'this.http.get()'");
    
    retVal = this.http.get(this.url, {responseType: 'text'});

    // 18/9/24 DH: Without 'retVal.subscribe(...)' then IMAGE NOT ADDED to Google Sheet...wtf???
    retVal.subscribe((response) => {
      console.log('Response: ', response);
    });
    
  }

  // 19/9/24 DH: Working 22:54 to specify the filename in Drive to add to the sheet (workaround since unable to post image yet)
  sendFilenameToGScript() {
    fetch(this.url, { method: "POST", body: this.filename })
      .then((res) => {
        console.log("1st Promise: " + res.status);
        return res.text(); // Promise necessary since Response stream read to eof
        //return res.json()
      })
      .then((res) => console.log("2nd Promise: " + res));
  }

}
