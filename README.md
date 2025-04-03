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

#### Interaction with Ionic tab
File cascade:
* ~src/app
  * tab2/tab2.page.ts
    ```
    data: {
      action: 'show',
    },
    handler: () => {
      this.photoService.showPicture(photo, position);
    }
    ```

  * services/photo.service.ts
    ```
    public async showPicture(photo: UserPhoto, position: number) {
      // modes: 'one', 'gallery', 'slider'
      this.router.navigateByUrl('/tabs/tab2/viewer/slider/' + position);
    }
    ```

  * tab2/tab2-routing.module.ts
    ```
    {
      path: '',
      component: Tab2Page,
    },

    {
      path: 'viewer/:mode/:photoNumber', 
      loadChildren: () => import('./viewer/viewer.module').then( m => m.ViewerPageModule)
    }
    ```

  * tab2/viewer/viewer.page.ts
    ```
    constructor(private router: Router, private actRoute: ActivatedRoute, public photoService: PhotoService) {
      this.mode = this.actRoute.snapshot.params['mode'];
      this.photoNumber = this.actRoute.snapshot.params['photoNumber'];
    }

    addImg(photoNumber: number) {
      let userPhoto: UserPhoto = this.photoService.getPicture(photoNumber);

      let imgObj = {
        url: userPhoto.webviewPath,
        title: 'Me'
      };    

      this.startFrom = this.imageList.push(imgObj);
    }

    async ngOnInit() {
      this.imageList = [...]
      this.addImg(this.photoNumber);
    }
    ```

  * tab2/components/photoviewer/photoviewer.component.ts
    ```
    constructor() {
      this.pvPlugin = PhotoViewer;
    }

    async ngAfterViewInit() {
      const show = async (imageList: Image[], mode: string,
                startFrom: number,options?: ViewerOptions): Promise<capShowResult> => {
        ...
        try {
          const ret = await this.pvPlugin.show(opt);

          if(ret.result) {
            return Promise.resolve(ret);
          }
        }
      };

      try {
        ...
        const result:any = await show(this.imageList, this.mode, this.startFrom, this.options);
      }
    }
    ```

* ~node_modules/@capacitor-community/photoviewer/android/src/main/java/com/getcapacitor/community/media/photoviewer
  * PhotoViewer.java
    ```
    public class PhotoViewer extends BridgeActivity {
      PhotoViewer(Context context, Bridge bridge) {
        this.context = context;
        this.bridge = bridge;
      }
      public void show(JSArray images, String mode, Integer startFrom, JSObject options) throws Exception {
        try {
          ArrayList<Image> imageList = convertJSArrayToImageList(images);
          Integer stFrom = startFrom > imageList.size() - 1 ? imageList.size() - 1 : startFrom;
          if (imageList.size() > 1 && mode.equals("gallery")) {
            createMainFragment(imageList, options);
          } else if (mode.equals("one")) {
            createImageFragment(imageList, stFrom, options);
          } else if (mode.equals("slider")) {
            createSliderFragment(imageList, stFrom, options);
          }
          return;
        }
      }
    }
    ```
