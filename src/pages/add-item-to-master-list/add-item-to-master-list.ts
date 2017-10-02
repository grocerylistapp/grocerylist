import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import {ShoppingItem} from '../../models/shopping-item/shopping-item.interface';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import { Profile } from '../../models/profile/profile';
import {User} from 'firebase/app';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';
import {Subscription} from 'rxjs/Subscription';


/**
 * Generated class for the AddItemToMasterListPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-item-to-master-list',
  templateUrl: 'add-item-to-master-list.html',
})

export class AddItemToMasterListPage {

  currentShoppingItem = {} as ShoppingItem;
  shoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;
  
  private authenticatedUser : User;
  private authenticatedUser$ : Subscription;
  

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
  private auth: AuthServiceProvider, private data: DataServiceProvider) {
    this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
      })
  }

  
  addShoppingItemToMasterList(currentShoppingItem: ShoppingItem){
    //console.log(currentShoppingItem);
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

  


}

