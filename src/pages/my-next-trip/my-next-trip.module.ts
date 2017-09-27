import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyNextTripPage } from './my-next-trip';

@NgModule({
  declarations: [
    MyNextTripPage,
  ],
  imports: [
    IonicPageModule.forChild(MyNextTripPage),
  ],
})
export class MyNextTripPageModule {}
