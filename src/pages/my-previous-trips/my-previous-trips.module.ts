import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyPreviousTripsPage } from './my-previous-trips';

@NgModule({
  declarations: [
    MyPreviousTripsPage,
  ],
  imports: [
    IonicPageModule.forChild(MyPreviousTripsPage),
  ],
})
export class MyPreviousTripsPageModule {}
