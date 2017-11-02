import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MoveToBuddyPage } from './move-to-buddy';

@NgModule({
  declarations: [
    MoveToBuddyPage,
  ],
  imports: [
    IonicPageModule.forChild(MoveToBuddyPage),
  ],
})
export class MoveToBuddyPageModule {}
