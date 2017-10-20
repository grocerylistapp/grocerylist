import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ItemRangeModalPage } from './item-range-modal';

@NgModule({
  declarations: [
    ItemRangeModalPage,
  ],
  imports: [
    IonicPageModule.forChild(ItemRangeModalPage),
  ],
})
export class ItemRangeModalPageModule {}
