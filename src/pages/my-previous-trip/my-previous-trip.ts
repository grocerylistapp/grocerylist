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

/**
 * Generated class for the MyPreviousTripPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-previous-trip',
  templateUrl: 'my-previous-trip.html',
})
export class MyPreviousTripPage {
  
    shoppingListRef$: FirebaseListObservable<ShoppingItem[]>;
    previousTripRef$: FirebaseListObservable<Store[]>;
    public previousListArray: Array<any> = [];
  
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyPreviousTripPage');
  }

  initFirebase() {
    let self = this;
    this.previousTripRef$ = this.db.list(`/previoustrip/${this.authenticatedUser.uid}`);
    this.previousTripRef$.$ref.once("value", function (snapshot) {
      snapshot.forEach(snaps => {
        let previousArray = [];
        previousArray['date'] = self.getDateInFormat(snaps.key);
        let storeArray: Array<any> = [];
        snaps.child('/').forEach(itemTmp => {          
          itemTmp.child('/').forEach(itemTp => {            
            storeArray.push({'storeName': itemTmp.key, 'time': self.getTimeFromEpoch(itemTp.key), 'epoch': itemTp.key });
            return false;
          });
          return false;
        });
        previousArray['store'] = storeArray;
        self.previousListArray.push(previousArray);
        console.log(self.previousListArray);
        return false;
      });

      self.loading.dismiss();
    });
  }

  getDateInFormat(date){
    return date.split('_').join('/');
  }

  getItemPreviousTripByStore(date, store){
    this.navCtrl.push('MyPreviousTripItemListPage', {dateValue: date.split('/').join('_'), storeName: store.storeName, time: store.epoch});  
  }

  getTimeFromEpoch(dateTime){
      var date = new Date(0);
      date.setUTCMilliseconds(dateTime);
      let hrs = date.getHours();
      let min = date.getMinutes();
      return (hrs > 12) ? (hrs-12 + ':' + min +' PM') : (hrs + ':' + min +' AM');
  }

}
