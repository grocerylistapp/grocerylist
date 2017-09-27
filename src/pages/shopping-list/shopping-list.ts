import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';

import {AddShoppingPage} from "../add-shopping/add-shopping";
import {EditShoppingItemPage} from "../edit-shopping-item/edit-shopping-item";
import{ShoppingItem} from "../../models/shopping-item/shopping-item.interface";
import {} from "../edit-shopping-item/edit-shopping-item";
import {FirebaseListObservable, AngularFireDatabase} from 'angularfire2/database';


@IonicPage()
@Component({
  selector: 'page-shopping-list',
  templateUrl: 'shopping-list.html',
})
export class ShoppingListPage {

  shoppingListRef$ : FirebaseListObservable<ShoppingItem[]>

  constructor(public navCtrl: NavController, public navParams: NavParams, private db : AngularFireDatabase,
  private actionSheetCntrl : ActionSheetController) {

    this.shoppingListRef$ = this.db.list('shopping-list');
  }

  navigateToAddShoppingPage(){
    this.navCtrl.push(AddShoppingPage);
  }


  editShoppingList(shoppingItem: ShoppingItem){
    this.actionSheetCntrl.create({
      title: `${shoppingItem.itemName}`,
      buttons: [
        {
          text: 'Edit',
          handler: ()=> {
            this.navCtrl.push(EditShoppingItemPage,{shoppingItemId: shoppingItem.$key} )
          }

        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: ()=> {
            this.shoppingListRef$.remove(shoppingItem.$key);
          }

        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: ()=> {
            
          }

        }

      ]
    }).present();
  }

}
