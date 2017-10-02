import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams} from 'ionic-angular';

import {ShoppingItem} from '../../models/shopping-item/shopping-item.interface';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';

@IonicPage()
@Component({
  selector: 'page-add-shopping',
  templateUrl: 'add-shopping.html',
})
export class AddShoppingPage {

  currentShoppingItem = {} as ShoppingItem;
  shoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase) {
    this.shoppingItemRef$ = this.db.list('shopping-list');

  }

  addShoppingItem(currentShoppingItem: ShoppingItem){
    //console.log(currentShoppingItem);
    this.shoppingItemRef$.push({
      itemName: currentShoppingItem.itemName,
      itemNumber: Number(currentShoppingItem.itemNumber),
      store: currentShoppingItem.store? currentShoppingItem.store : "None"
    });
    //reset global shopping item
    this.currentShoppingItem = {} as ShoppingItem;

    //navigate back one on the navigation stack
    this.navCtrl.pop();
  }


  


}
