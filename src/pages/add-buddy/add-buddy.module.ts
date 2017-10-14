import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddBuddyPage } from './add-buddy';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    AddBuddyPage,
  ],
  imports: [
    IonicPageModule.forChild(AddBuddyPage),
    ComponentsModule
  ],
})
export class AddBuddyPageModule {}
