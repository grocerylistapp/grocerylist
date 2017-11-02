import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

import { Store } from '../../models/store/store';
import {FirebaseListObservable, AngularFireDatabase} from 'angularfire2/database';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';

/**
 * Generated class for the PreferredStoreListPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-preferred-store-list',
  templateUrl: 'preferred-store-list.html',
})
export class PreferredStoreListPage {

  storeListRef$ : FirebaseListObservable<Store[]>
  private authenticatedUser : User;
  private authenticatedUser$ : Subscription;
  private loading;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db : AngularFireDatabase,
    private auth: AuthServiceProvider, private data: DataServiceProvider,
    public loadingCtrl: LoadingController) {

      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });    
      this.loading.present();
      try{
        console.log("Came to masterlist constructor");
        this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
            this.authenticatedUser = user;
            console.log(`Masterlist got user1 ${this.authenticatedUser.uid}`);
            this.initFirebase();
          })
        }catch(e){ }
  }

  initFirebase(){
    let self = this;
    this.storeListRef$ = this.db.list(`/preferredStores/${this.authenticatedUser.uid}`);
    this.storeListRef$.$ref.once("value",function(snapshot){
      self.loading.dismiss();
    });    
  }

  navigateToAddPreferredStorePage(){
    this.navCtrl.push('AddPreferredStorePage',{ storeStatus: "addStore"});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PreferredStoreListPage');
  }

}
