import { Component } from '@angular/core';

// 25/9/24 DH: https://v17.angular.io/api/common/http/HttpClient
import { HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  // -------------------------------------------------------
  // *** NOTE: REMOVE ACTIVE URL BEFORE ADDING TO GITHUB ***
  // -------------------------------------------------------
  private url = '';

  private initStr = 'Hey, sweeet...';
  items = [
    this.initStr,
  ];

  // 27/9/24 DH: DataPipe: https://angular.dev/api/common/DatePipe?tab=usage-notes
  //             Pipe Decorator: https://angular.dev/api/core/Pipe?tab=description
  //               (Angular 17 PipeTransform interface eg: https://v17.angular.io/api/core/PipeTransform#usage-notes)
  //
  // "{{ dtg | date: 'dd/MM/yyyy'}}" DatePipe in 'tab1.page.html'
  dtg;

  // 28/9/24 DH: Needed for https://angular.dev/guide/templates/binding#render-dynamic-text-with-text-interpolation
  sheetName = "TBD";

  constructor(private http: HttpClient) {
    this.dtg = new Date();
  }

  async ngOnInit() {
    console.log("'Tab1Page.ngOnInit()'");
  }

  ionViewWillEnter() {
    console.log('Tab1Page.ionViewWillEnter() calling getPersonalDetails()');
    
    // "{{ dtg | date: 'dd/MM/yyyy'}}" DatePipe in 'tab1.page.html'
    // Need to restart whilst waiting for Apps Script to response
    this.dtg = new Date();

    this.getPersonal();
    
  }

  // 12/11/20 DH: This creates a slideable list in 'tab1.page.html'
  displayMsg(item: string) {

    //if (this.items.includes(this.initStr)){
    //  this.deleteItem(this.initStr, 0);
    //}
    
    // Add new entry to bottom of list
    this.items.push(item);

    // Add new entry to top of list
    //this.items.unshift(item);
  }

  parseResponse(response: string) {
    let responseList = response.split(";");

    responseList.forEach( (line) => {
      if (line) {
        let responsePart = line.split("|");

        let responseLine = "";
        responsePart.forEach( (item) => {
          this.dtg = new Date(item);
          if (this.dtg.toString() != "Invalid Date") {
            console.log("Tab1Page.parseResponse(): 'this.dtg' = " + this.dtg)
          }

          /*
          // 26/9/24 DH: Attempt at formatting data with JS 'Date.toDateString()' (since Angular Data Pipe only works for View, not Model)
          if (this.dtg.toString() != "Invalid Date") {
            
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#formats_of_tostring_method_return_values
            responseLine += this.dtg.toDateString() + ", ";

            // https://stackblitz.com/edit/angular-ivy-kdhxck?file=src%2Fapp%2Fapp.component.html%3AL16
            // {{dateNow | date: format}}
            // https://angular.dev/api/common/DatePipe?tab=usage-notes

            // {{ dtg | date: 'dd/MM/yyyy'}} in 'tab1.page.html' displays as detailed but NOT ABLE TO GET DESIRED STRING VIEW from "Date Pipe"
            //responseLine += this.dtg;
          } else {
            responseLine += item + ", ";
          }
          */

          // 26/9/24 DH: Desired Date format obtained in Apps Script with: 
          //               x = Date.parse(rcArrayVals[i][j]);
          //               let itemDate = Utilities.formatDate(new Date(x), "GMT+1", "dMMMyyyy");
          responseLine += item + ", ";
          
        }); // END --- "responsePart.forEach( (item) => {" ---

        this.displayMsg(responseLine);
      }
      
    }); // END --- "responseList.forEach( (line) => {" ---
    
  }

  // ---------------
  // HttpClient Get
  // ---------------

  // 25/9/24 DH: Recreating 'gsheet.js' + 'Node.js::googleapis'
  getDetails(sheetName: string) {
    let retVal: Observable<any>;
    let params = new HttpParams().set('sheetName', sheetName);

    console.log("Calling 'this.http.get()'");
    
    // 27/9/24 DH: Firstly clear entire list
    this.items.splice(0,this.items.length);

    // "{{ dtg | date: 'dd/MM/yyyy'}}" DatePipe in 'tab1.page.html'
    // Need to restart whilst waiting for Apps Script to response
    this.dtg = new Date();

    retVal = this.http.get(this.url, {responseType: 'text', params: params});

    // 18/9/24 DH: Without 'retVal.subscribe(...)' then NOT WORK
    /* */
    retVal.subscribe((response) => {
      console.log('Response: ', response);
      
      this.parseResponse(response);
    });
  }

  // 29/9/24 DH:
  getPersonal() {
    this.sheetName = "Personal";
    this.getDetails('Personal');
  }

  // 29/9/24 DH:
  getDeleted() {
    this.sheetName = "Deleted";
    this.getDetails('Deleted');
  }

  // ----------------
  // HttpClient Post
  // ----------------

  // 28/9/24 DH: https://v17.angular.io/guide/http-send-data-to-server
  sendPost(action: string, sheetName: string, value: string) {
    let retVal: Observable<any>;
    let params = new HttpParams();

    params = params.set('action', action);
    params = params.set('sheetName', sheetName);
    params = params.set('value', value);

    console.log("Calling 'this.http.post()'");
    
    // 28/9/24 DH: (14:30) Get CORS error without sending data arg (prob a "port scan" defence)
    retVal = this.http.post(this.url, params, {responseType: 'text'});

    // 18/9/24 DH: Without 'retVal.subscribe(...)' then NOT WORK
    retVal.subscribe((response) => {
      console.log('Response: ', response);
    });

  }

  async deleteItem(item: string, index: number){
    this.items.splice(index,1);

    let sheetRow = index + 1;
    console.log("Tab1Page.deleteItem(): row: ", sheetRow, ", '", item,"'");

    // Previous 'gsheet.js' function:
    // [Code required for Angular to use a Node.js network package]
    // -------------------------------------------------------------------------------------
    // 15/12/20 DH: Prevent data race by synchronizing DB access steps with callbacks:
    //              'copyAndDelRow()'
    //                             -> 'appendAndDelRow()'
    //                                                 ->'deleteRow()'
    // -------------------------------------------------------------------------------------
    //copyAndDelRow('Personal',index,'Deleted');

    // 29/9/24 DH:
    if (this.sheetName == "Personal") {
      this.sendPost("deleteRow", this.sheetName, sheetRow.toString());
    }
    else if (this.sheetName == "Deleted") {
      this.sendPost("replaceRow", this.sheetName, sheetRow.toString());
    }
    else {
      console.log("Unknown sheet in 'Tab1Page.deleteItem()': ", this.sheetName);
    }
    
  }

  itemSelected(item: string, index: number) {
    let tableRow = index + 1;
    console.log("Tab1Page.itemSelected(): row: ", tableRow, ", '", item,"'");

  }

}
