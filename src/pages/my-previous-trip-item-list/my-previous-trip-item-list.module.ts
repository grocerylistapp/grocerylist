import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyPreviousTripItemListPage } from './my-previous-trip-item-list';

@NgModule({
  declarations: [
    MyPreviousTripItemListPage,
  ],
  imports: [
    IonicPageModule.forChild(MyPreviousTripItemListPage),
  ],
})
export class MyPreviousTripItemListPageModule {}
