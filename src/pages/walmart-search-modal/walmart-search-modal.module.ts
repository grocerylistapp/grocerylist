import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WalmartSearchModalPage } from './walmart-search-modal';

@NgModule({
  declarations: [
    WalmartSearchModalPage,
  ],
  imports: [
    IonicPageModule.forChild(WalmartSearchModalPage),
  ],
})
export class WalmartSearchModalPageModule {}
