import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MasterListPage } from './master-list';

@NgModule({
  declarations: [
    MasterListPage,
  ],
  imports: [
    IonicPageModule.forChild(MasterListPage),
  ],
})
export class MasterListPageModule {}
