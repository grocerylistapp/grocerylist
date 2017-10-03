import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams} from 'ionic-angular';

import {ShoppingItem} from '../../models/shopping-item/shopping-item.interface';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '../../models/store/store';
/**
 * Generated class for the AddToMyNextTripAndMasterFromMntPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-to-my-next-trip-and-master-from-mnt',
  templateUrl: 'add-to-my-next-trip-and-master-from-mnt.html',
})
export class AddToMyNextTripAndMasterFromMntPage {

  currentShoppingItem = {} as ShoppingItem;
  shoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;
  storeRef$: FirebaseListObservable<Store[]>;
  
  private authenticatedUser : User;
  private authenticatedUser$ : Subscription;
  

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    private auth: AuthServiceProvider, private data: DataServiceProvider) {
      this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
        this.authenticatedUser = user;
        });
      //const shopppingItem : ShoppingItem = this.navParams.get('shoppingItem');
      if(this.navParams.get('shoppingItem')){
        this.currentShoppingItem = this.navParams.get('shoppingItem');
      }
      
    }

  addShoppingItem(currentShoppingItem: ShoppingItem){
    //BUG: Eliminate duplicate entries in my next trip. Check with case insensitivity
    if(!currentShoppingItem.store) currentShoppingItem.store = "None";
    this.shoppingItemRef$ = this.db.list(`/nexttrip/${this.authenticatedUser.uid}/${currentShoppingItem.store}`);
    if(!currentShoppingItem.itemNumber) currentShoppingItem.itemNumber = 0;
    this.shoppingItemRef$.push({
      itemName: currentShoppingItem.itemName,
      itemNumber: Number(currentShoppingItem.itemNumber)
      // store: currentShoppingItem.store? currentShoppingItem.store : "None"
    });

    
    //add to master list if it doesn't exist there
    //BUG: Eliminate duplicate entries in masterlist. Check with case insensitivity
    this.shoppingItemRef$ = this.db.list(`/masterlist/${this.authenticatedUser.uid}`);
    this.shoppingItemRef$.push({
      itemName: currentShoppingItem.itemName,
      store: currentShoppingItem.store
    });

    //reset global shopping item
    this.currentShoppingItem = {} as ShoppingItem;
    
    //navigate back one on the navigation stack
    this.navCtrl.pop();
  }

  
  ionViewDidLoad() {
    
  }


}
