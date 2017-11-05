import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShopBuddyListPage } from './shop-buddy-list';

@NgModule({
  declarations: [
    ShopBuddyListPage,
  ],
  imports: [
    IonicPageModule.forChild(ShopBuddyListPage),
  ],
})
export class ShopBuddyListPageModule {}
