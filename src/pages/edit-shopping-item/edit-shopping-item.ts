import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import {AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database';

import {ShoppingItem} from '../../models/shopping-item/shopping-item.interface';

@IonicPage()
@Component({
  selector: 'page-edit-shopping-item',
  templateUrl: 'edit-shopping-item.html',
})
export class EditShoppingItemPage {

  private shoppingItemRef$ : FirebaseObjectObservable<ShoppingItem>;
   shoppingItem = {} as ShoppingItem;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase) {
    const shoppingItemId = this.navParams.get('shoppingItemId');
    this.shoppingItemRef$ = this.db.object(`shopping-list/${shoppingItemId}`);
    console.log(shoppingItemId);

    this.shoppingItemRef$.subscribe(
      shoppingItem  => this.shoppingItem = shoppingItem);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditShoppingItemPage');
  }
  
  updateShoppingItem(shoppingItem: ShoppingItem){
    this.shoppingItemRef$.update(shoppingItem);
    this.navCtrl.pop(); 
  }
}
