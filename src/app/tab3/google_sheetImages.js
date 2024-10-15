// 22/9/24 DH: File created

// 1/10/24 DH:
function addImgFromName(sheetName, titleVal) {
  // 22/9/24 DH: TODO: Dynamically allocate row, col
  let col = 2;
  let row = 9;

  let imgFile = getFileFromDrive(titleVal);

  let sheet = SpreadsheetApp.openById(gSheetID).getSheetByName(sheetName);

  // 22/9/24 DH: Refactor
  let imageDetails = deleteImg(sheet, row, col);
  insertImage(sheet, row, col, imgFile, titleVal);

  return imgFile;
}

// 1/10/24 DH:
function addImg(sheetName, titleVal, img) {
  // 22/9/24 DH: TODO: Dynamically allocate row, col
  let col = 2;
  let row = 9;

  let sheet = SpreadsheetApp.openById(gSheetID).getSheetByName(sheetName);

  // 22/9/24 DH: Refactor
  let imageDetails = deleteImg(sheet, row, col);

  // 2/10/24 DH: 'insertImage()' is written for a file not img
  //insertImage(sheet, row, col, img, titleVal);

  rangeTxt = sheet.getRange(row-1,col);
  rangeTxt.setValues([[titleVal]]);

  // FROM: 'insertImage(...)'
  // ------------------------
  //let resImg = ImgApp.doResize(imgFile.getId(), desiredWidth);
  //sheet.insertImage(resImg.blob, col, row);

  logMsg('addImg(): '+img);

  // https://developers.google.com/apps-script/reference/drive/drive-app#createfileblob
  var blobFile = DriveApp.createFile(img);
  sheet.insertImage(blobFile.getBlob(), col, row);

  return titleVal;
}


// 5/10/24 DH: Get attachment from "Knock 3 times and ask for Alan" email subject
function addEmailImg(sheetName) {

  //var thread = GmailApp.getInboxThreads(0,1)[0]; // Get first thread in inbox
  //var message = thread.getMessages()[0]; // Get first message

  var threads = GmailApp.getInboxThreads(0, 10);
  var msgs = GmailApp.getMessagesForThreads(threads);

  for (var i = 0 ; i < msgs.length; i++) {
    for (var j = 0; j < msgs[i].length; j++) {

      let subject = msgs[i][j].getSubject();

      let correctSubject = "Knock 3 times and ask for Alan";
      
      // 6/10/24 DH: Refactor when correct email subject found
      if(subject.indexOf(correctSubject) > -1){
        let message = msgs[i][j];
        return populateGoogleWorkspace(message, sheetName);
      }
    }
  }
  return "Not found";

}

// 9/10/24 DH:
function addEmailImgWrapper(sheetName) {
  // Allow time for email to be sent
  Utilities.sleep(5000);// pause for 5000 milliseconds (ie 5 secs)
  logMsg("Calling 'addEmailImg()' with '" + sheetName + "'");
  retVal = addEmailImg(sheetName);

  // 6/10/24 DH: When a blob is returned then get "TypeError: retVal.indexOf is not a function"
  // 8/10/24 DH: 'cnt' needs to be defined outside "try-catch" in order to use value in "catch"
  //             (maybe some security feature of buffer-overrun...)
  var cnt=0;
  try {
    while (retVal.indexOf("Not found") > -1) {
      // Allow time for email to be sent (for big image)
      Utilities.sleep(60000);// pause for 60000 milliseconds (ie 60 secs)

      cnt++;
      logMsg("Calling 'addEmailImg()' with '" + sheetName + "': " + cnt);
      retVal = addEmailImg(sheetName);
      if (cnt == 10) { // ie 10 mins
        logMsg("Called 'addEmailImg()' with '" + sheetName + "' " + cnt + " times breaking out...");
        break;
      }

    } // END: --- "while (retVal.indexOf("Not found") > -1)" ---
    
    logMsg("'addEmailImg()' retVal: " + retVal);

  } catch(error) {
    // 8/10/24 DH: Gives: "ReferenceError: cnt is not defined" if "var cnt=0" DEFINED IN "try" block
    logMsg("Called 'addEmailImg()' with '" + sheetName + "' " + cnt + " times");
    return retVal;
  }

}

// 9/10/24 DH:
function addSharedImg(sheetName, titleVal) {
  
  // LIKE: return addImgFromName(sheetName, value)

  // 22/9/24 DH: TODO: Dynamically allocate row, col
  let col = 2;
  let row = 9;

  logMsg("Searching for : " + titleVal);
  let imgFile = getFileFromDrive(titleVal);
  if (imgFile == null) {
    logMsg("  RETURNING: 'Not found'");
    return "Not found";
  }

  let sheet = SpreadsheetApp.openById(gSheetID).getSheetByName(sheetName);

  let imageDetails = deleteImg(sheet, row, col);
  insertImage(sheet, row, col, imgFile, titleVal);

  return imgFile;

}

// 9/10/24 DH: 
// PSEUDO-CODE:
//   Get filename sent to 'doPost()'
//   Check + sleep until filename is found in Drive
function addSharedImgWrapper(sheetName, value) {
  // Allow time for email to be sent
  Utilities.sleep(5000);// pause for 5000 milliseconds (ie 5 secs)
  logMsg("Calling 'addSharedImg()' with '" + sheetName + "'");
  retVal = addSharedImg(sheetName, value);

  // 6/10/24 DH: When a blob is returned then get "TypeError: retVal.indexOf is not a function"
  // 8/10/24 DH: 'cnt' needs to be defined outside "try-catch" in order to use value in "catch"
  //             (maybe some security feature of buffer-overrun...)
  var cnt=0;
  try {
    while (retVal.indexOf("Not found") > -1) {
      // Allow time for email to be sent (for big image)
      Utilities.sleep(60000);// pause for 60000 milliseconds (ie 60 secs)

      cnt++;
      logMsg("Calling 'addSharedImg()' with '" + sheetName + "': " + cnt);
      retVal = addSharedImg(sheetName, value);
      if (cnt == 10) { // ie 10 mins
        logMsg("Called 'addSharedImg()' with '" + sheetName + "' " + cnt + " times breaking out...");
        break;
      }

    } // END: --- "while (retVal.indexOf("Not found") > -1)" ---
    
    logMsg("'addSharedImg()' retVal: " + retVal);

  } catch(error) {
    // 8/10/24 DH: Gives: "ReferenceError: cnt is not defined" if "var cnt=0" DEFINED IN "try" block
    logMsg("Called 'addSharedImg()' with '" + sheetName + "' " + cnt + " times");
    return retVal;
  }

}

// 1/10/24 DH: Refactor
function doAction(sheetName, action, value, img) {
  let retVal = "TBD";

  // Old format of just passing the filename, SO ADDED in 'doPost(...)':
  //   "addImgFromName", "sheetName", passedParams.postData.contents
  if(action.indexOf("addImgFromName") > -1) {
    logMsg("Calling 'addImgFromName()' with '" + sheetName + "' and '" + value + "'");
    return addImgFromName(sheetName, value)
  }

  // 'Tab3Page.postImg()' sends: Post (filename, blob)
  // [and CURRENTLY DOES NOT WORK ]
  //  ...despite 'contentLength' looks about right for '50495 balavil-sunset.jpg' so Google Workspace 
  //     MUST BE FILTERING passed blob's...
  else if(action.indexOf("addImg") > -1) {
    // 1/10/24 DH: "Cannot read properties of null (reading 'getItems')"
    //let activeForm = FormApp.getActiveForm();
    //let img = activeForm.getItems().getImage();

    return addImg(sheetName, value, img);
  }

  else if(action.indexOf("addEmailImg") > -1) {
    return addEmailImgWrapper(sheetName);
  }

  else if(action.indexOf("addSharedImg") > -1) {
    return addSharedImgWrapper(sheetName, value);
  }

  // 13/10/24 DH:
  else if(action.indexOf("getDriveImg") > -1) {
    let desiredWidth = 500;
    return getResizedBase64Img(value, desiredWidth);

  }

  else {
    retVal = "Unknown action: " + action;
    logMsg(retVal);
  }

  return retVal;
}

