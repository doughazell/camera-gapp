# camera-gapp

## Apps Script
Interfaces with Google Workspace via Apps Script (with "google_*" files in [Tab3](https://github.com/doughazell/camera-gapp/tree/master/src/app/tab3))

#### Running Python AI on Colab
[Tab3Page.getColabService()](https://github.com/doughazell/camera-gapp/blob/master/src/app/tab3/tab3.page.ts#L317) shows how AI ( currently ['lime.py::runLimeAnalysis()'](https://github.com/doughazell/ai/blob/main/lime.py#L489) ) can be run from Angular via GDrive deposited image result files.

It requires the user to press the "Run" button on the displayed Colab Python terminal script in order to get an updated image result file.

This works by initially showing an existing file, which may then be updated after running a Colab Python AI script via ['runTimeCycle()'](https://github.com/doughazell/camera-gapp/blob/master/src/app/tab3/tab3.page.ts#L282) to trigger the Android Main UI Thread to update the DOM View from a Capacitor Plugin Thread [Promise handler](https://github.com/doughazell/camera-gapp/blob/master/src/app/tab3/tab3.page.ts#L212).

## Photoviewer
Includes [Photoviewer Capacitor Plugin](https://github.com/doughazell/photoviewer) for interacting with pictures taken with 
[PhotoService](https://github.com/doughazell/camera-gapp/blob/master/src/app/services/photo.service.ts) and managed via 
[Tab2Page::ActionSheetController](https://github.com/doughazell/camera-gapp/blob/master/src/app/tab2/tab2.page.ts#L93)
