// "Execute as": Me (doughazell@googlemail.com)
// "Who has access": Anyone

function doGet(e) {
  
  let params = JSON.stringify(e);
  
  let imageUrl = 'https://www.google.com/images/srpr/logo3w.png';
  let sheetID = '11tdSmNDpvY1ATQLZvHXmJ2yi_44a94EwzUmTUUkRg1s';
  let sheetName = 'Copy of KIT';
  let col = 1;
  let row = 10;

  try {
    SpreadsheetApp.openById(sheetID).getSheetByName(sheetName).insertImage(imageUrl,col,row);

    // 17/5/22 DH: CORS header error without using 'ContentService.createTextOutput()'
    return ContentService.createTextOutput('insertImage() worked fine...17Sep24');
      //.setMimeType(ContentService.MimeType.JAVASCRIPT);
      //.setMimeType(ContentService.MimeType.JSON) 
  } catch(e) {
    //return HtmlService.createHtmlOutput(e);
    return ContentService.createTextOutput('insertImage() FAILED - 17Sep24');
  }
  
}

function doPost(passedParams){
  
  let imageUrl = 'https://www.google.com/images/srpr/logo3w.png';

  // 19/9/24 DH: Despite being public accessible it CAN NOT BE ACCESSED via GApps
  // "Exception: Error retrieving image from URL or bad URL: https://drive.google.com/file/d/1AUo9rUuTRxMB89j_WJX86-83O5osx-kc/view"

  //let file = getFileFromDrive("moses-fishing.jpg");
  //let file = getFileFromDrive("Rick&Morty-viewer2Insight-scaled.png");

  let sheetID = '11tdSmNDpvY1ATQLZvHXmJ2yi_44a94EwzUmTUUkRg1s';
  let sheetName = 'Copy of KIT';
  let col = 2;
  let row = 10;

  // 19/5/22 DH:
  let params = JSON.stringify(passedParams);
  let imgFile = getFileFromDrive(passedParams.postData.contents);
  let titleVal = passedParams.postData.contents;

  // 20/5/22 DH: the year anniversary...ffs...!!!
  //console.log(e);
  //Logger.log(e);

  try {
    // https://developers.google.com/apps-script/reference/utilities/utilities#formatDate(Date,String,String)
    //let date = Utilities.formatDate(new Date(), "GMT+1", "dd/MM/yyyy HH:mm:ss");
    let time = Utilities.formatDate(new Date(), "GMT+1", "HH:mm:ss");
  
    let logFilename = Utilities.formatDate(new Date(), "GMT+1", "dMMMyyyy");
    let logDoc = getLogfile(time, logFilename);

    let sheet = SpreadsheetApp.openById(sheetID).getSheetByName(sheetName);

    // 22/9/24 DH: Refactor
    let imageDetails = deleteImg(logDoc, time, sheet, row, col);
    insertImage(logDoc, time, sheet, row, col, imgFile, titleVal);

    let msg = "msg: TBD";
    if (imgFile){
      msg = "img file id: " + imgFile.getId();
    }
    return ContentService.createTextOutput('insertImage() worked fine...inching there...' + msg );
    
  } catch(error) {

    return ContentService.createTextOutput('insertImage() failed...: ' + error);
    
  }

}
