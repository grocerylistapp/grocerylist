import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController } from 'ionic-angular';

import { AddShoppingPage } from "../add-shopping/add-shopping";
import { EditShoppingItemPage } from "../edit-shopping-item/edit-shopping-item";
import { ShoppingItem } from "../../models/shopping-item/shopping-item.interface";
import { } from "../edit-shopping-item/edit-shopping-item";
import { FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Store } from '../../models/store/store';


@IonicPage()
@Component({
  selector: 'page-my-next-trip-list',
  templateUrl: 'my-next-trip.html',
})
export class MyNextTripPage {


  shoppingListRef$: FirebaseListObservable<ShoppingItem[]>;
  nextTripRef$: FirebaseListObservable<Store[]>;

  private authenticatedUser: User;
  private authenticatedUser$: Subscription;
  private loading;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    private actionSheetCntrl: ActionSheetController, private auth: AuthServiceProvider, private data: DataServiceProvider,
    public loadingCtrl: LoadingController) {

    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();

    try {
      console.log("Came to nexttrip oninnit");
      this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
        this.authenticatedUser = user;
        this.initFirebase();
        console.log(`nexttrip got user1 ${this.authenticatedUser.uid}`);
      })
    } catch (e) {
      // console.error(e);
    }
  }

  initFirebase() {
    let self = this;
    this.nextTripRef$ = this.db.list(`/nexttrip/${this.authenticatedUser.uid}`);
    this.nextTripRef$.$ref.once("value", function (snapshot) {
      
      self.loading.dismiss();
    });
  }

  navigateToAddToNextTripPage() {
    this.navCtrl.push('AddToMyNextTripAndMasterFromMntPage');
  }

  editShoppingList(shoppingItem: Store) {
    this.actionSheetCntrl.create({
      title: `${shoppingItem.storename}`,
      buttons: [
        {
          text: 'Edit',
          handler: () => {
            this.navCtrl.push('EditShoppingItemPage', { shoppingItemId: shoppingItem.$key })
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.shoppingListRef$.remove(shoppingItem.$key);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    }).present();
  }

  getItemsForStore(store: Store) {
    console.log("came to getItemsForStore in MyNextTripPage");
    this.shoppingListRef$ = this.db.list(`/nexttrip/${this.authenticatedUser.uid}/${store.storename}`, { preserveSnapshot: true });
  }

  navigateToShoppingListForStore(store: string) {
    console.log(`came to navigateToShoppingListForStore in MyNextTripPage, store is ${store}`);
    this.navCtrl.push('MyNextTripShoppingListForStorePage', { storeName: store, userid: this.authenticatedUser.uid });
  }

  splitStore(storeValue,type){
    let store = storeValue.split(" - ");
    if(type == 0){
      return store[0];
    }else{
      return store[1];
    }
  }


}
