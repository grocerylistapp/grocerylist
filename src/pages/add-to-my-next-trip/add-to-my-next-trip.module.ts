import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddToMyNextTripPage } from './add-to-my-next-trip';

@NgModule({
  declarations: [
    AddToMyNextTripPage,
  ],
  imports: [
    IonicPageModule.forChild(AddToMyNextTripPage),
  ],
})
export class AddToMyNextTripPageModule {}
