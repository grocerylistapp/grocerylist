import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Geofence } from '@ionic-native/geofence';
import {FirebaseListObservable, AngularFireDatabase} from 'angularfire2/database';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';

import generateUUID from "../../utils/uuid";
import{ Store } from "../../models/store/store";

@IonicPage()
@Component({
  selector: 'page-list-of-lists',
  templateUrl: 'list-of-lists.html',
})
export class ListOfListsPage {
  storeListRef$ : FirebaseListObservable<Store[]>;
  public storeListArray: Array<any> = [];
  private loading;
  private authenticatedUser : User;
  private authenticatedUser$ : Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, private geofence: Geofence, private db : AngularFireDatabase,
              private auth: AuthServiceProvider,public loadingCtrl: LoadingController) {
    
    
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
    let count = 1;
    this.storeListRef$ = this.db.list(`/preferredStores/${this.authenticatedUser.uid}`);
    this.storeListRef$.$ref.once("value",function(snapshot){
      
      self.loading.dismiss();      
      snapshot.forEach(data => {

        self.storeListArray.push(
          {
            id: generateUUID(), //any unique ID
            latitude: data.val().latitude, //center of geofence radius
            longitude:  data.val().longitude,
            radius: 100, //radius to edge of geofence in meters
            transitionType: 1, //see 'Transition Types' below
            notification: { //notification settings
              id: count + 1, //any unique ID
              title: 'Start Shopping', //notification title
              text: 'You are near a Preferred Store -'+ data.val().store, //notification body
              openAppOnClick: true //open app when notification is tapped
            }
          }
        );
        return false;
      });
      
      // initialize the plugin
      self.geofence.initialize().then(
        // resolved promise does not return a value
        () => {
          
          self.addGeofence();
          console.log('Geofence Plugin Ready Always');
        },
        (err) => console.log(err)
      )
    });    
  }
  
  private addGeofence() {
    //options describing geofence
    // let fence = {
    //   id: '69ca1b88-6fbe-4e80-a4d4-ff4d3748acdb', //any unique ID
    //   latitude: 8.484778, //center of geofence radius
    //   longitude:  76.931649,
    //   radius: 100, //radius to edge of geofence in meters
    //   transitionType: 3, //see 'Transition Types' below
    //   notification: { //notification settings
    //     id: 1, //any unique ID
    //     title: 'You crossed a fence', //notification title
    //     text: 'You just arrived to Gliwice city center.', //notification body
    //     openAppOnClick: true //open app when notification is tapped
    //   }
    // }
    console.log(this.storeListArray);
    this.geofence.addOrUpdate(this.storeListArray).then(
      () => console.log('Geofence added'),
      (err) => console.log('Geofence failed to add')
    );

    this.geofence.onNotificationClicked().subscribe((notificationData) => {
        console.log(notificationData);
        //notificationData.notification.text
      });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ListOfListsPage');
  }

  navigateToMyNextTrip(){
    this.navCtrl.push('MyNextTripPage');
  }

  navigateToMasterList(){
    this.navCtrl.push('MasterListPage');
  }

  navigateToMyPreviousTrip(){
    this.navCtrl.push('MyPreviousTripPage');    
  }
}
