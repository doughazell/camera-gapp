import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

// 23/8/24 DH: (https://ionicframework.com/docs/angular/navigation)
// 23/8/24 DH: LAST ANGULAR ROUTING: 'ionic-camera-swipe'/tabs.router.module.ts' - "20/5/21 DH: Adding google auth error to tab1"

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  }
];

@NgModule({
  
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]

})
export class AppRoutingModule {}
