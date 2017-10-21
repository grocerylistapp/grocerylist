import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { ShoppingItem } from '../../models/shopping-item/shopping-item.interface';
import { EditShoppingItemPage } from '../edit-shopping-item/edit-shopping-item';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
 
@IonicPage()
@Component({
  selector: 'page-my-previous-trip-item-list',
  templateUrl: 'my-previous-trip-item-list.html',
})
export class MyPreviousTripItemListPage {

  storeName: string;
  previousTripRef$ : FirebaseListObservable<ShoppingItem[]>;
  
    private authenticatedUser: User;
    private authenticatedUser$: Subscription;
    private loading;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    private actionSheetCntrl: ActionSheetController, private auth: AuthServiceProvider, private data: DataServiceProvider,
    public loadingCtrl: LoadingController) {
      
      let time: string = this.navParams.get('time');
      let date: string = this.navParams.get('dateValue');
      this.storeName = this.navParams.get('storeName');
      console.log(time);
      console.log(date);
      console.log(this.storeName);
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
  
      try {
        console.log("Came to nexttrip oninnit");
        this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
          this.authenticatedUser = user;
          this.previousTripRef$ = this.db.list(`/previoustrip/${this.authenticatedUser.uid}/`+ date + `/` + this.storeName + `/` + time);
          this.loading.dismiss();
        })
      } catch (e) {
        // console.error(e);
      }
    }

}
