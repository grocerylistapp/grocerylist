import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';

import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';

import {ShoppingItem} from '../../models/shopping-item/shopping-item.interface';
import { Store } from '../../models/store/store';

@IonicPage()
@Component({
  selector: 'page-edit-shopping-item',
  templateUrl: 'edit-shopping-item.html',
})
export class EditShoppingItemPage {

  private shoppingItemRef$ : FirebaseObjectObservable<ShoppingItem>;
  preferredStoresList: FirebaseListObservable<Store[]>;
   shoppingItem = {} as ShoppingItem;
   public storeList: Array<any>;
   private authenticatedUser : User;
   private authenticatedUser$ : Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase, private auth: AuthServiceProvider) {
    this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
    
    });

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

  ionViewWillEnter(){
    this.getPreferredStore();
  }

  getPreferredStore(){
    var self =this;
    
    self.preferredStoresList = self.db.list(`/preferredStores/${self.authenticatedUser.uid}`);
    /* gets firebase data only once */
    
    self.preferredStoresList.$ref.once("value", function (snapshot) {
      self.storeList = [];
      snapshot.forEach(data => {
        var store = data.val().storename+' - '+data.val().address;
        if (data.val().lat) {
          self.storeList.push({
            storeName: store
          });
          // self.showToast('Item already exists in Master List', 1000);
          // self.loading.dismiss();
        }
        return false;
      });
      
    });

  }
  
  updateShoppingItem(shoppingItem: ShoppingItem){
    // shoppingItem.store = shoppingItem.store ? shoppingItem.store : "None";
    this.shoppingItemRef$.update(shoppingItem);
    this.navCtrl.pop(); 
  }

  navigateToAddPreferredStorePage(){
    this.navCtrl.push('AddPreferredStorePage',{ storeStatus: "addStore"});
  }
}
