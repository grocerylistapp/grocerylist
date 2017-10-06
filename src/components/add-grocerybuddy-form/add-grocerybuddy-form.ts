import { Component, OnDestroy } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';

import { User } from 'firebase/app';

import { Profile } from '../../models/profile/profile';
import { Notification } from '../../models/notification/notification.interface';

/**
 * Generated class for the AddGrocerybuddyFormComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'app-add-grocerybuddy-form',
  templateUrl: 'add-grocerybuddy-form.html'
})
export class AddGrocerybuddyFormComponent implements OnDestroy {

  private authenticatedUser : User;
  private authenticatedUser$ : Subscription;

  buddy1 = {} as Profile;
  currentBuddyRef$: FirebaseListObservable<Profile[]>;
  currentBuddyObj: FirebaseObjectObservable<Profile>;
  buddyNotificationRef$: FirebaseListObservable<Notification[]>;
  buddyList = [] as Profile[];
  notificationList = [] as Notification[];
  currentNotification = {} as Notification;
  buddyNotificationObj: FirebaseObjectObservable<Notification>;
  userNotificationObj: FirebaseObjectObservable<Notification>;
  userProfile: Profile;

  constructor(private data: DataServiceProvider, 
  	private auth: AuthServiceProvider,
  	private db: AngularFireDatabase,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private toast: ToastController) {
    console.log('Hello AddGrocerybuddyFormComponent Component');
    this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
      this.data.getProfile(user).subscribe(profile => {
        this.userProfile = <Profile>profile.val();
      });
    });
    
  }

  sendNotification(){

    this.buddyNotificationRef$ = this.db.list(`/notification/${this.authenticatedUser.uid}`);
    this.buddyNotificationRef$.subscribe( notificationList  => this.notificationList = notificationList );
    
    this.userNotificationObj = this.db.object(`/notification/${this.authenticatedUser.uid}`);
    this.buddyNotificationObj = this.db.object(`/notification/${this.buddy1['$key']}`);
    
    let currentNotificationList = this.notificationList.filter(notification  => {
      if (notification.buddy === this.buddy1){
        return notification;
      }
    });
    if(currentNotificationList.length > 0){
      alert("notification already exists");
    }
    else{
      this.userNotificationObj.$ref.child(this.buddy1['$key']).set({
        user: this.userProfile,
        buddy: this.buddy1,
        status: 'pending'
      });
      this.buddyNotificationObj.$ref.child(this.authenticatedUser.uid).set({
        buddy: this.userProfile,
        user: this.buddy1,
        status: 'pending'
      });
      //this.currentBuddyObj.$ref.child(this.buddy1['$key']).set(this.buddy1);
    }


  }

  saveBuddyList(){
    
    this.currentBuddyRef$ = this.db.list(`/grocerybuddylist/${this.authenticatedUser.uid}`);
    this.currentBuddyObj = this.db.object(`/grocerybuddylist/${this.authenticatedUser.uid}`);
    this.currentBuddyRef$.subscribe( buddyList  => this.buddyList = buddyList );
    var self = this;
    var usersRef = this.db.list(`/profiles`, {
        query: {
            orderByChild: 'email',
            equalTo: self.buddy1.email , // How to check if participants contain username
        }
    });
    
    usersRef.subscribe(profileList => {
      //const userData = snapshot.val();
      if(profileList.length > 0){
        this.buddy1 = profileList[0];
        
        if(this.buddy1.email){
          if(this.buddyList && this.buddyList.length > 0){
            let currentBuddyList = this.buddyList.filter(buddy  => {
              if (buddy.email === this.buddy1.email){
                return buddy;
              }
            });
            if(currentBuddyList.length > 0){
              alert("Buddy already exists");
            }
            else{
              this.sendNotification();
              //this.currentBuddyObj.$ref.child(this.buddy1['$key']).set(this.buddy1);
            }
          }
          else{
            this.sendNotification();
            //this.currentBuddyObj.$ref.child(this.buddy1['$key']).set(this.buddy1);
          }
        }
        // else{
        //   this.toast.create({
        //     message: `No grocery buddy added!`,
        //     duration: 3000
        //   }).present();
        // }

      }
      else{
        //sent mail to user 
      }
      
    
      
    });


    this.navCtrl.setRoot('TabsHomePage');
    this.toast.create({
      message: `Welcome In!`,
      duration: 3000
    }).present();

    
  }

  ngOnDestroy(): void {
    this.authenticatedUser$.unsubscribe();
  }
}
  