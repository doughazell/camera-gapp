// 25/9/24 DH: File created from 'SheetsAPI-Kit::sheetImages.gs'

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
    doc.appendListItem(time + ": Created new file");
  }

  gLogDoc = doc;
  gTime = time;

  return doc;

}

// 28/9/24 DH:
function logMsg(msg) {
  gLogDoc.appendListItem(gTime + ": " + msg);
}

// 26/9/24 DH: 2-D array of selected grid
function getReturnVals(rcArrayVals, lastrow, lastcol, hdrIdx, dateIdx) {
  let retVals = "";

  // 26/9/24 DH: What happens if there is "," within a field?
  //             (The 2-D array gets CSV'd with 'toString()')
  //let valsSplit = rcArrayVals.toString().split(",");
  //let splitIdx = 0;

  for (let i = 0; i < lastrow; i++) {
    for (let j = 0; j < lastcol; j++) {
      /* 
      // Prev idea of parsing string view of 2-D array...Model vs View...
      retVals += valsSplit[splitIdx];
      ++splitIdx;
      */

      // 26/9/24 DH: Format DTG here 
      // (rather than in Ionic/Angular '<ion-item-sliding>' which only allows JS Date formatting)
      // (the "{{ dtg | date: 'dd/MM/yyyy'}}" is only available as a rendered "View" in "templateUrl")
      
      // 29/9/24 DH: "Deleted" sheet has no header line so needs to include (i == 0)
      if (j == dateIdx && i != hdrIdx) {

        // https://developers.google.com/apps-script/reference/utilities/utilities#formatDate(Date,String,String)
        // let logFilename = Utilities.formatDate(new Date(), "GMT+1", "dMMMyyyy");

        x = Date.parse(rcArrayVals[i][j]);
        let itemDate = Utilities.formatDate(new Date(x), "GMT+1", "d MMM yyyy");

        gLogDoc.appendListItem(gTime + ": Row: " + i + ", Col: " + j + " = " + itemDate);

        retVals += itemDate;
      } else {
        retVals += rcArrayVals[i][j];
      }

      /*
      eg 
      "First Name|Last Name|First Line|Other Lines|Town|Postcode|Start Date;Doug|Hazell|69 Clover Ground|Westbury-on-Trym|Bristol|BS9 4UJ|27 May 2000;||The Piggery|Lotus Cottages|Stoke Gabriel|TQ9 6SL|14 Dec 2006;||12 Mackenzie Crescent||Nethy Bridge|PH25 3DU|24 Jul 2017;"
      */
      if (j < (lastcol -1) ) {
        retVals += "|";
      } else {
        retVals += ";";
      }
      
    }
    
  }

  return retVals;
}

// 26/9/24 DH:
function getSheetVals(sheet) {
  let retVals = "TBD";

  try {
    // https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getname
    // 29/9/24 DH: 'var' needed since needed in catch...Apps Script var scope
    var sheetName = sheet.getName();
    // https://developers.google.com/apps-script/reference/spreadsheet/sheet#getLastRow()
    var lastrow = sheet.getLastRow();
    var lastcol = 1;
    var hdrIdx = -1;
    var dateIdx = 6;

    // 29/9/24 DH: "Personal" sheet has Misc col for "3,4,5,6,7" ie "kivy-gapp" field display order
    //             ...however "Deleted" DOES NOT...!
    if (sheetName.indexOf("Personal") > -1) {
      lastcol = sheet.getLastColumn() -1;
      hdrIdx = 0;
    } else {
      // "Deleted" sheet has NO HEADER ROW so 'hdrIdx' remains at -1
      lastcol = sheet.getLastColumn();
    }

    // 29/9/24 DH: Now deprecated with 'logMsg(msg)'
    gLogDoc.appendListItem(gTime + ": Last sheet row: "+lastrow+", Last column: "+lastcol);
    
    // https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRange(String)
    //const range = sheet.getRange('A1:H10');
    
    // https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRange(Integer,Integer,Integer,Integer)
  
    const range = sheet.getRange(1,1,lastrow, lastcol);
  
    // https://developers.google.com/apps-script/reference/spreadsheet/range#getvalues
    let rcArrayVals = range.getValues();
    retVals = getReturnVals(rcArrayVals, lastrow, lastcol, hdrIdx, dateIdx);

    return retVals;

  } catch(error) {
    // 29/9/24 DH: Catch empty sheet (eg "Deleted")
    if(error.toString().indexOf("The number of rows in the range must be at least 1") > -1) {
      retVals = "'" + sheetName + "': SHEET EMPTY";
    }

    // 29/9/24 DH: Catch the "random" error
    if(error.toString().indexOf("is not a function") > -1) {
      retVals = "Google 'hardware error': " + error + " (retry)";
    }

    return retVals;

  }
}

// 29/9/24 DH:
function replaceRow(sheetName, value) {
  let sheetApp = SpreadsheetApp.openById(gSheetID);
  let srcSheet = sheetApp.getSheetByName(sheetName);

  const lastcol = srcSheet.getLastColumn();
  let srcRange = srcSheet.getRange(value, 1, 1, lastcol);
  let srcValues = srcRange.getValues();
  for (var row in srcValues) {
    let srcRow = srcValues[row];
    
    let dstRowNum = srcRow.pop();
    let dstSheetName = srcRow.pop();

    let dstSheet = sheetApp.getSheetByName(dstSheetName);
    dstSheet.insertRows(dstRowNum);

    for (var colIdx in srcRow) {
      let colNum = Number(colIdx) + 1;
      let dstRange = dstSheet.getRange(dstRowNum, colNum);
      dstRange.setValue(srcRow[colIdx]);
      logMsg("Adding: '"+ srcRow[colIdx] + "' to: " + dstRowNum + ", " + colNum);
    }

  }

  srcSheet.insertRowsAfter(srcSheet.getMaxRows(), 1);
  srcSheet.deleteRow(value);
}

// 29/9/24 DH:
function deleteRow(sheetName, value) {
  let sheetApp = SpreadsheetApp.openById(gSheetID);
  let srcSheet = sheetApp.getSheetByName(sheetName);
  let dstSheet = sheetApp.getSheetByName("Deleted");

  // https://developers.google.com/apps-script/reference/spreadsheet/sheet#getrangerow,-column,-numrows,-numcolumns
  // Remove the Misc col in "Personal" (legacy from 'kivy-gapp' field view order)
  //
  // [NOTE: This is ONLY VALID for "Personal" sheet]
  const lastcol = srcSheet.getLastColumn() - 1;

  let srcRange = srcSheet.getRange(value, 1, 1, lastcol);
  let srcValues = srcRange.getValues();
  logMsg("Src values: '"+ srcValues + "' for row: "+value);

  for (var row in srcValues) {
    // IDEA: target_range.setValues(source_range.getValues());

    let srcRow = srcValues[row];
    srcRow.push(sheetName);
    srcRow.push(value);
    logMsg("Copying: "+ value + " '" + srcRow + "'");
    dstSheet.appendRow(srcRow);
  }
  
  logMsg("Deleting: "+ value);
  srcSheet.deleteRow(value);
}

// 29/9/24 DH:
function doAction(gSheetID, sheetName, action, value) {
  let retVal = "OK";

  if(action.indexOf("deleteRow") > -1) {
    deleteRow(sheetName, value);
  }
  else if(action.indexOf("replaceRow") > -1) {
    replaceRow(sheetName, value);
  }
  else {
    retVal = "Unknown action: " + action;
  }

  return retVal;
}

