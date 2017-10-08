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
    const storeName = this.navParams.get('storeName');
    const userid = this.navParams.get('userid');
    const rootNode = this.navParams.get('rootNode');
    if(storeName){
    this.shoppingItemRef$ = this.db.object(`${rootNode}/${userid}/${storeName}/${shoppingItemId}`);
    }else{
      this.shoppingItemRef$ = this.db.object(`${rootNode}/${userid}/${shoppingItemId}`);
    }
    console.log(`In EditShopping page, shoppingitemid is ${rootNode}/${userid}/${storeName}/${shoppingItemId}`);

    this.shoppingItemRef$.subscribe(
      shoppingItem  => this.shoppingItem = shoppingItem);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditShoppingItemPage');
  }
  
  updateShoppingItem(shoppingItem: ShoppingItem){
    // shoppingItem.store = shoppingItem.store ? shoppingItem.store : "None";
    this.shoppingItemRef$.update(shoppingItem);
    this.navCtrl.pop(); 
  }
}
