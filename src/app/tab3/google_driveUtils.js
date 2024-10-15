// 14/10/24 DH: Created file for 'images.html' interface

// 13/10/24 DH:
function getResizedBase64Img(imgName, desiredWidth) {
  // https://developers.google.com/apps-script/reference/drive/file
  let iFile = getFileFromDrive(imgName);

  // 13/10/24 DH: Currently think that Base64 needed to send img's via HTML
  //return Utilities.base64Encode(iFile.getBlob().getBytes());

  // Timings (secs)
  // -------
  // Full image: 12,12,11
  // Resized image: 4,5,4

  let imgFile = ImgApp.doResize(iFile.getId(), desiredWidth);

  // 14/10/24 DH: Update for ImgApp object
  return Utilities.base64Encode(imgFile.blob.getBytes());
  
}

