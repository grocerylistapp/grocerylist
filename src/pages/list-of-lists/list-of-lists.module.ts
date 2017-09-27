import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListOfListsPage } from './list-of-lists';

@NgModule({
  declarations: [
    ListOfListsPage,
  ],
  imports: [
    IonicPageModule.forChild(ListOfListsPage),
  ],
})
export class ListOfListsPageModule {}
