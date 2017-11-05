import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ModalController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { ShoppingItem } from '../../models/shopping-item/shopping-item.interface';
import { EditShoppingItemPage } from '../edit-shopping-item/edit-shopping-item';

@IonicPage()
@Component({
  selector: 'page-my-next-trip-shopping-list-for-store',
  templateUrl: 'my-next-trip-shopping-list-for-store.html',
})
export class MyNextTripShoppingListForStorePage {

  userid: string;
  storeName: string;
  shoppingListRef$ : FirebaseListObservable<ShoppingItem[]>;
  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    private actionSheetCntrl : ActionSheetController, public modalCtrl: ModalController) {
    this.storeName = this.navParams.get('storeName');
    this.userid = this.navParams.get('userid');
    this.shoppingListRef$ =  this.db.list(`/nexttrip/${this.userid}/${this.storeName}`);
  }

  editShoppingList(shoppingItem: ShoppingItem){
    this.actionSheetCntrl.create({
      title: `${shoppingItem.itemName}`,
      buttons: [
        {
          text: 'Move to ShopBuddy',
          handler: ()=> {
            this.navCtrl.push('MoveToBuddyPage',{shoppingItemId: shoppingItem.$key, storeName: 
              this.storeName, userid: this.userid, rootNode: "nexttrip"} )
          }

        },
        {
          text: 'Edit',
          handler: ()=> {
            this.navCtrl.push(EditShoppingItemPage,{shoppingItemId: shoppingItem.$key, storeName: 
              this.storeName, userid: this.userid, rootNode: "nexttrip"} )
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

  navigateToShareGrocery(){
    let modal = this.modalCtrl.create('SelectBuddyModelPage', { shoppingList: this.shoppingListRef$, storeName: this.storeName, shareType: "full" });
    modal.present();
    
  }

}
