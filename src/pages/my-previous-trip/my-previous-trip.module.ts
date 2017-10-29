import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyPreviousTripPage } from './my-previous-trip';

@NgModule({
  declarations: [
    MyPreviousTripPage,
  ],
  imports: [
    IonicPageModule.forChild(MyPreviousTripPage),
  ],
})
export class MyPreviousTripPageModule {}
