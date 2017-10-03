import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddItemToMasterListPage } from './add-item-to-master-list';

@NgModule({
  declarations: [
    AddItemToMasterListPage,
  ],
  imports: [
    IonicPageModule.forChild(AddItemToMasterListPage),
  ],
})
export class AddItemToMasterListPageModule {}
