import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// 21/10/24 DH:
//import { defineCustomElements as jeepPhotoviewer} from 'jeep-photoviewer/loader';
//import { defineCustomElements as pwaElements} from '@ionic/pwa-elements/loader';

//jeepPhotoviewer(window);
//pwaElements(window);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
