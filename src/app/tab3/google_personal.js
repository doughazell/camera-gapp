var gSheetID = '11tdSmNDpvY1ATQLZvHXmJ2yi_44a94EwzUmTUUkRg1s';

// 28/9/24 DH:
function initLog() {
  let time = Utilities.formatDate(new Date(), "GMT+1", "HH:mm:ss");
  
  let logFilename = Utilities.formatDate(new Date(), "GMT+1", "dMMMyyyy");
  let logDoc = getLogfile(time, logFilename);
}

// 25/9/24 DH: Recreating 'gsheet.js'+ 'Node.js::googleapis'
function doGet(args) {
  let paramsStr = JSON.stringify(args);
  
  // 28/9/24 DH: This time has come to reduce the hard-coding
  //let sheetName = 'Personal';

  try {
    // 25/9/24 DH: Not work since need https://developers.google.com/apps-script/guides/libraries#writingLibrary
    //let SheetsAPI_KitID = "1os6QvKr2xn-3w7wz8w9YSQR8tqCc6YEZDGzDnBY8rqOSlnuz33ARQG14";
    //let sheetsAPIKit = DriveApp.getFileById(SheetsAPI_KitID);

    initLog();

    // 28/9/24 DH:
    let sheetName = args.parameter.sheetName;
    logMsg("sheetName: "+sheetName);
    logMsg(paramsStr)

    let sheet = SpreadsheetApp.openById(gSheetID).getSheetByName(sheetName);
    let retVals = getSheetVals(sheet);

    // 17/5/22 DH: CORS header error without using 'ContentService.createTextOutput()'
    return ContentService.createTextOutput(retVals);
  } catch(e) {
    //return HtmlService.createHtmlOutput(e);
    return ContentService.createTextOutput('REQUEST FAILED: '+ e);
  }
  
}

// 28/9/24 DH: Gives CORS error without passed args (prob as "port scanning" defence)
//             ...even if args are not accessed by the JS function prototype
function doPost(args) {
  try {
    let paramsStr = JSON.stringify(args);
    let action = args.parameter.action;
    let sheetName = args.parameter.sheetName;
    let value = args.parameter.value;

    initLog();

    let retVal = doAction(gSheetID, sheetName, action, value);

    return ContentService.createTextOutput('doPost(): '+ retVal);

    // 28/9/24 DH: CORS error without using 'ContentService.createTextOutput()'
    //return HtmlService.createHtmlOutput('doPost(): Yea baby...');
  } catch(e) {
    return ContentService.createTextOutput('REQUEST FAILED: '+ e);
  }
}
