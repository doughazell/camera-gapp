import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab2Page } from './tab2.page';

const routes: Routes = [
  {
    path: '',
    component: Tab2Page,
  },

  {
    // 27/10/24 DH: Integrating 'photoviewer' code
    path: 'viewer/:mode/:photoNumber',
    loadChildren: () => import('./viewer/viewer.module').then( m => m.ViewerPageModule)
  }
    

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab2PageRoutingModule {}
