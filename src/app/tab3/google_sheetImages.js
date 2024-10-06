// 22/9/24 DH: File created

var gLogDoc;
var gTime;

// 19/9/24 DH: https://developers.google.com/drive/api/guides/search-shareddrives
// 22/9/24 DH: https://developers.google.com/apps-script/reference/drive/file-iterator
function getFileFromDrive(name) {
  const files = DriveApp.getFilesByName(name);
  if (files.hasNext()) {
    return files.next();
  } else {
    console.log(`No file found with name ${name}.`);
    return null;
  }
}

// 22/9/24 DH:
function getLogfile(time, logFilename) {
  gTime = time;

  // https://docs.google.com/document/d/17aCIIB4uaQMwBE-KrMc7yK05gGQOeeZnh8RZBmh46HM/edit
  //let doc = DocumentApp.openById('17aCIIB4uaQMwBE-KrMc7yK05gGQOeeZnh8RZBmh46HM');
  
  let docFile = getFileFromDrive(logFilename);

  if (docFile){
    let docUrl = docFile.getUrl();
    // https://developers.google.com/apps-script/reference/document/document-app
    gLogDoc = DocumentApp.openByUrl(docUrl);
  } else {
    // Create and open a document.
    gLogDoc = DocumentApp.create(logFilename);
    // https://developers.google.com/apps-script/reference/document/body#appendListItem(String)
    gLogDoc.appendListItem(gTime + ": Created new file");
  }

  return gLogDoc;

}

// 1/10/24 DH: Taken from 'SheetsAPI-Kit::sheetUtils.gs'
function logMsg(msg) {
  gLogDoc.appendListItem(gTime + ": " + msg);
}

// 22/9/24 DH: Refactor
function deleteImg(sheet, row, col) {
  let imageDetails;
  // 20/9/24 DH: https://developers.google.com/apps-script/reference/spreadsheet/over-grid-image

  // 20/9/24 DH: Sometimes fails with "let image = ..."
  let images = sheet.getImages();
  for (let i = 0; i < images.length; i++) {
    imageDetails = images[i].getAnchorCell();
    
    if (imageDetails && imageDetails.getRow() == row && imageDetails.getColumn() == col) {
      images[i].remove();
      gLogDoc.appendListItem(gTime + ": Deleted image at " + row + "," + col);
    }  
  }
  return imageDetails;
}

// Ideas dump
// ----------
//const response = UrlFetchApp.fetch(
//  'https://developers.google.com/google-ads/scripts/images/reports.png');
//const binaryData = response.getContent();

//const binaryData = passedParams.postData.contents;
//const blob = Utilities.newBlob(binaryData, 'image/png', 'MyImageName');
//sheet.insertImage(blob, col, row);

//var img = file.getBlob();
//let inLineImg = doc.getBody().appendImage(img);
/* 
"Unfortunately, there are no methods to resize images at Google Apps Script. As a workaround, 
  there is a method that it imports the image in Google Document and resizes the image using setWidth() 
  and setHeight(). But in this method, the resized blob cannot be retrieved."
  */
//sheet.insertImage(inLineImg, col, row);
// --------------------------------------------------------------------------

// 23/9/24 DH: Refactor
function addResizedImg(sheet, row, col, imgFile, titleVal, factor) {
  // 21/9/24 DH: https://github.com/tanaikech/ImgApp?tab=readme-ov-file#2-doresize
  let img = imgFile.getBlob();

  // 23/9/24 DH: TODO: Set all images to correct size for spreadsheet view
  let imgSize = ImgApp.getSize(img);
  let desiredWidth = Math.ceil(imgSize.width / factor);

  // https://github.com/tanaikech/ImgApp/blob/master/ImgApp.js#L289
  //   USES: https://developers.google.com/drive/api/reference/rest/v3
  let resImg = ImgApp.doResize(imgFile.getId(), desiredWidth);
  sheet.insertImage(resImg.blob, col, row);

  // https://github.com/tanaikech/ImgApp/blob/master/ImgApp.js#L414
  let newSize = ImgApp.getSize(resImg.blob);
  let sizeMsg = ", from: " + imgSize.filesize + " to: " + newSize.filesize;
  gLogDoc.appendListItem(gTime + ": '" + titleVal + "' scaled by " + factor + sizeMsg);
}

// 22/9/24 DH: Refactor
function insertImage(sheet, row, col, imgFile, titleVal) {
  try {
    // Add title string
    // ----------------
    //const range = sheet.getRange('B2:D2');
    rangeTxt = sheet.getRange(row-1,col);
    rangeTxt.setValues([[titleVal]]);

    let desiredWidth = 350;
    
    try {
      // https://github.com/tanaikech/ImgApp/blob/master/ImgApp.js#L414
      var imgSize = ImgApp.getSize(imgFile.getBlob());
      var imgType = "ImgApp";
    } catch(error) {
      if(error.toString().indexOf("imgFile.getBlob is not a function") > -1) {
        var imgSize = imgFile.getSize();
        var imgType = "Attachment";
      }
    }
    
    if (imgSize.width > desiredWidth) {
      let resImg = ImgApp.doResize(imgFile.getId(), desiredWidth);
      sheet.insertImage(resImg.blob, col, row);
      
      let initSize = imgSize;
      gLogDoc.appendListItem(gTime + ": '" + titleVal + "' init size: " + initSize.filesize);
      imgSize = ImgApp.getSize(resImg.blob);
      gLogDoc.appendListItem(gTime + ": '" + titleVal + "' resized from: " + initSize.width + " to: " + imgSize.width);
    } else {
      sheet.insertImage(imgFile,col,row);
    }

    if (imgType.indexOf("ImgApp") > -1){
      gLogDoc.appendListItem(gTime + ": '" + titleVal + "' added, size: " + imgSize.filesize);
    }
    else {
      logMsg("'" + titleVal + "' added, size: " + imgSize);
    }
    
  } catch(error) {
    // 22/9/24 DH:
    gLogDoc.appendListItem(gTime + ": " + error);

    // 21/9/24 DH: 'includes()' for list element content
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes

    // 2/10/24 DH: This is a legacy before ABOVE: "if (imgSize.width > desiredWidth)"
    if(error.toString().indexOf("The blob was too large") > -1) {
      let factor = 10;
      addResizedImg(sheet, row, col, imgFile, titleVal, factor);
    }
  }

}

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

// 5/10/24 DH:
function addEmailImg(sheetName) {
  // 22/9/24 DH: TODO: Dynamically allocate row, col
  let col = 2;
  let row = 9;
  let imgFolder = "gappImages";

  // 5/10/24 DH: Get attachment from "Knock 3 times and ask for Alan" email subject

  //var thread = GmailApp.getInboxThreads(0,1)[0]; // Get first thread in inbox
  //var message = thread.getMessages()[0]; // Get first message

  var threads = GmailApp.getInboxThreads(0, 10);
  var msgs = GmailApp.getMessagesForThreads(threads);

  for (var i = 0 ; i < msgs.length; i++) {
    for (var j = 0; j < msgs[i].length; j++) {

      let subject = msgs[i][j].getSubject();

      let correctSubject = "Knock 3 times and ask for Alan";
      
      if(subject.indexOf(correctSubject) > -1){
        let attachments = msgs[i][j].getAttachments();
        let blob = attachments[0];
        let titleVal = blob.getName();

        // 6/10/24 DH: Now delete the email from the inbox
        msgs[i][j].moveToTrash();

        logMsg("DELETED EMAIL subject: " + subject + ", img name: " + titleVal);

        let sheet = SpreadsheetApp.openById(gSheetID).getSheetByName(sheetName);

        // 22/9/24 DH: Refactor
        let imageDetails = deleteImg(sheet, row, col);
        insertImage(sheet, row, col, blob, titleVal);

        // 6/10/24 DH: Save img at full size (before it may get reduced in 'addResizedImg(...)' )
        var folders = DriveApp.getFoldersByName(imgFolder);
        let cnt = 0;
        while (folders.hasNext()) {
          var folder = folders.next();
          cnt++;

          folder.createFile(blob).setName(titleVal);
          logMsg("Saved '" + titleVal + "' in '" + folder.getName() + "'");
          logMsg("Breaking out of '" + imgFolder + "', id: " + folder.getId() )
          break;
        }
        if (cnt == 0) {
          var folder = DriveApp.createFolder(imgFolder);
          folder.createFile(blob).setName(titleVal);
          logMsg("Saved '" + titleVal + "' IN NEW '" + folder.getName() + "'");
        } 

        return blob;
      }
    }
  }
  return "Not found";

}

// 1/10/24 DH: Refactor
function doAction(sheetName, action, value, img) {
  let retVal = "TBD";

  if(action.indexOf("addImgFromName") > -1) {
    logMsg("Calling 'addImgFromName()' with '" + sheetName + "' and '" + value + "'");
    return addImgFromName(sheetName, value)
  }
  else if(action.indexOf("addImg") > -1) {
    // 1/10/24 DH: "Cannot read properties of null (reading 'getItems')"
    //let activeForm = FormApp.getActiveForm();
    //let img = activeForm.getItems().getImage();

    return addImg(sheetName, value, img);
  }
  else if(action.indexOf("addEmailImg") > -1) {
    logMsg("Calling 'addEmailImg()' with '" + sheetName + "'");
    retVal = addEmailImg(sheetName);

    // 6/10/24 DH: When a blob is returned then get "TypeError: retVal.indexOf is not a function"
    try {
      while (retVal.indexOf("Not found") > -1) {
        logMsg("Calling 'addEmailImg()' with '" + sheetName + "'");
        retVal = addEmailImg(sheetName);
      }
    } catch(error) {
      return retVal;
    }
    
  }
  else {
    retVal = "Unknown action: " + action;
    logMsg(retVal);
  }

  return retVal;
}
