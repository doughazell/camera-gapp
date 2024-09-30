// 22/9/24 DH: File created

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
function getLogfile(date, logFilename) {
  let doc = "TBD";
  // https://docs.google.com/document/d/17aCIIB4uaQMwBE-KrMc7yK05gGQOeeZnh8RZBmh46HM/edit
  //let doc = DocumentApp.openById('17aCIIB4uaQMwBE-KrMc7yK05gGQOeeZnh8RZBmh46HM');
  
  let docFile = getFileFromDrive(logFilename);

  if (docFile){
    let docUrl = docFile.getUrl();
    // https://developers.google.com/apps-script/reference/document/document-app
    doc = DocumentApp.openByUrl(docUrl);
  } else {
    // Create and open a document.
    doc = DocumentApp.create(logFilename);
    // https://developers.google.com/apps-script/reference/document/body#appendListItem(String)
    doc.appendListItem(date + ": Created new file");
  }

  return doc;

}

// 22/9/24 DH: Refactor
function deleteImg(logDoc, date, sheet, row, col) {
  let imageDetails;
  // 20/9/24 DH: https://developers.google.com/apps-script/reference/spreadsheet/over-grid-image

  // 20/9/24 DH: Sometimes fails with "let image = ..."
  let images = sheet.getImages();
  for (let i = 0; i < images.length; i++) {
    imageDetails = images[i].getAnchorCell();
    
    if (imageDetails && imageDetails.getRow() == row && imageDetails.getColumn() == col) {
      images[i].remove();
      logDoc.appendListItem(date + ": Deleted image at " + row + "," + col);
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
function addResizedImg(logDoc, date, sheet, row, col, imgFile, titleVal, factor) {
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
  logDoc.appendListItem(date + ": '" + titleVal + "' scaled by " + factor + sizeMsg);
}

// 22/9/24 DH: Refactor
function insertImage(logDoc, date, sheet, row, col, imgFile, titleVal) {
  try {
    //const range = sheet.getRange('B2:D2');
    rangeTxt = sheet.getRange(row-1,col);
    rangeTxt.setValues([[titleVal]]);

    let desiredWidth = 350;
    // https://github.com/tanaikech/ImgApp/blob/master/ImgApp.js#L414
    let imgSize = ImgApp.getSize(imgFile.getBlob());
    
    if (imgSize.width > desiredWidth) {
      let resImg = ImgApp.doResize(imgFile.getId(), desiredWidth);
      sheet.insertImage(resImg.blob, col, row);
      
      let initSize = imgSize;
      logDoc.appendListItem(date + ": '" + titleVal + "' init size: " + initSize.filesize);
      imgSize = ImgApp.getSize(resImg.blob);
      logDoc.appendListItem(date + ": '" + titleVal + "' resized from: " + initSize.width + " to: " + imgSize.width);
    } else {
      sheet.insertImage(imgFile,col,row);
    }

    logDoc.appendListItem(date + ": '" + titleVal + "' added, size: " + imgSize.filesize);
  } catch(error) {
    // 22/9/24 DH:
    logDoc.appendListItem(date + ": " + error);

    // 21/9/24 DH: 'includes()' for list element content
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes

    if(error.toString().indexOf("The blob was too large") > -1) {
      let factor = 10;
      addResizedImg(logDoc, date, sheet, row, col, imgFile, titleVal, factor);
    }
  }

}
