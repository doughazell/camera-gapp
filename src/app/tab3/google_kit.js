// "Execute as": Me (doughazell@googlemail.com)
// "Who has access": Anyone

// 1/10/24 DH:
var gSheetID = '11tdSmNDpvY1ATQLZvHXmJ2yi_44a94EwzUmTUUkRg1s';

// 1/10/24 DH: Taken from 'SheetsAPI-Personal'
function initLog() {
  // https://developers.google.com/apps-script/reference/utilities/utilities#formatDate(Date,String,String)
  let time = Utilities.formatDate(new Date(), "GMT+1", "HH:mm:ss");
  
  let logFilename = Utilities.formatDate(new Date(), "GMT+1", "dMMMyyyy");
  let logDoc = getLogfile(time, logFilename);
}

function doGet(passedParams) {
  
  let params = JSON.stringify(passedParams);
  
  let imageUrl = 'https://www.google.com/images/srpr/logo3w.png';
  let sheetID = '11tdSmNDpvY1ATQLZvHXmJ2yi_44a94EwzUmTUUkRg1s';
  let sheetName = 'Copy of KIT';
  let col = 1;
  let row = 10;

  try {

    initLog();

    //logMsg(params);

    // 13/10/24 DH:
    // Set global for 'getDriveImg()' in 'images.html'
    let value = passedParams.parameter.value;

    // https://developers.google.com/apps-script/guides/html
    // https://developers.google.com/apps-script/reference/html/html-service
    //return HtmlService.createHtmlOutputFromFile('images');

    // https://developers.google.com/apps-script/reference/html/html-template?hl=en#evaluate()
    // https://developers.google.com/apps-script/guides/html/templates?hl=en#pushing_variables_to_templates
    var servTemplate = HtmlService.createTemplateFromFile('images');
    
    // 14/10/24 DH: Pass variables into template
    servTemplate.imgName = value;
    
    return servTemplate.evaluate();

  } catch(error) {
    return ContentService.createTextOutput('insertImage() FAILED - 17Sep24 ' + error);
  }
  
}
// 22/9/24 DH: Refactored
// 1/10/24 DH: Refactored (like 'SheetsAPI-Personal::doPost(...)::doAction(...)' )
function doPost(passedParams){
  try {

    initLog();

    // New HttpParams add to Post
    if (passedParams.parameter.action !== undefined) {
      let params = JSON.stringify(passedParams);
      logMsg("'parameter.action' defined: "+ params);

      let img = passedParams.addImg;
      logMsg('passedParams.addImg: '+ img);

      let sheetName = passedParams.parameter.sheetName;
      let action = passedParams.parameter.action;
      let value = passedParams.parameter.value;

      var imgFile = doAction(sheetName, action, value, img);
    }

    // Old format of just passing the filename, SO ADD:
    //   "addImgFromName", "sheetName", passedParams.postData.contents
    else {    
      let sheetName = 'Copy of KIT';
      let titleVal = passedParams.postData.contents;

      var imgFile = doAction(sheetName, "addImgFromName", titleVal, null);
    }

    // 14/10/24 DH: Return a Base64 of the 'imgFile' rather than the 'id'
    try {
      var msg = "img file id: " + imgFile.getId();
      return ContentService.createTextOutput('insertImage() worked fine...inching there...' + msg );
      
    } catch(error) {
      logMsg("'imgFile' is not a file so returning it as string (prob because it is Base64)");
      return ContentService.createTextOutput(imgFile);
    }

  } catch(error) {

    return ContentService.createTextOutput('insertImage() failed...: ' + error);
    
  }

}

