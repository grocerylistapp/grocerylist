import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController} from 'ionic-angular';

import {ShoppingItem} from '../../models/shopping-item/shopping-item.interface';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '../../models/store/store';
/**
 * Generated class for the AddToMyNextTripPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-to-my-next-trip',
  templateUrl: 'add-to-my-next-trip.html',
})
export class AddToMyNextTripPage {
  currentShoppingItem = {} as ShoppingItem;
  shoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;
  storeRef$: FirebaseListObservable<Store[]>;
  
  private authenticatedUser : User;
  private authenticatedUser$ : Subscription;
  private isExist: boolean;
  private loading;
  private quantity: number = 1;
  private storeName: string = '';
  

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    private auth: AuthServiceProvider, private data: DataServiceProvider, private toast: ToastController,
    public loadingCtrl: LoadingController) {
      this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
        this.authenticatedUser = user;
        });
      //const shopppingItem : ShoppingItem = this.navParams.get('shoppingItem');
      if(this.navParams.get('shoppingItem')){
        this.currentShoppingItem = this.navParams.get('shoppingItem');
        console.log('this.currentShoppingItem');
        console.log(this.currentShoppingItem);
      }
      this.isExist = false;
      
    }

  addShoppingItem(){
    // console.log(currentShoppingItem);
    var self = this;
    // self.loading = this.loadingCtrl.create({
    //   content: 'Please wait...'
    // });
    // self.loading.present();

    if(!self.storeName) self.storeName = "None";
    self.shoppingItemRef$ = this.db.list(`/nexttrip/${this.authenticatedUser.uid}/${self.storeName}`);
    
    self.shoppingItemRef$.$ref.once("value", function (snapshot) {
      snapshot.forEach(data => {
        if (data.val().itemName == self.currentShoppingItem.itemName) {
          self.isExist = true;
          // self.loading.dismiss();
        }
        return false;
      });

      if (!self.isExist) {
        self.saveToFirebaseNextTrip();
      }else{        
        self.showToast('Item already exists in My Next Trip', 1000);
      }
      self.isExist = false;
    });
  }
  
    /* save the item to firebase
       check the store value exist or not
       if not, save store value as None */
  saveToFirebaseNextTrip() {
    console.log('saveToFirebaseNextTrip');
    var self = this;
    let isSaved;
    
    if(!self.quantity) self.quantity = 0;
    isSaved = this.shoppingItemRef$.push({
      itemName: self.currentShoppingItem.itemName,
      itemNumber: Number(self.quantity),
      pickedQuantity : Number(0)
      // store: self.currentShoppingItem.store? self.currentShoppingItem.store : "None"
      });

    if (isSaved) {
      // this.loading.dismiss();
      self.showToast('Item saved succesfully in My Next Trip', 1000);
    }
    
    // //navigate back one on the navigation stack
    this.navCtrl.pop();
  }
  
  
  /* show toast message dynamically */
  showToast(message, time) {
    this.toast.create({ message: message, duration: time }).present();
  }

  
  ionViewDidLoad() {
    
  }


}
