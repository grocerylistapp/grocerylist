import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShoppingItemListPage } from './shopping-item-list';

@NgModule({
  declarations: [
    ShoppingItemListPage,
  ],
  imports: [
    IonicPageModule.forChild(ShoppingItemListPage),
  ],
})
export class ShoppingItemListPageModule {}
