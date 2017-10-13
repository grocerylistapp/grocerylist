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
  userNotificationRef$: FirebaseListObservable<Notification[]>;
  buddyList = [] as Profile[];
  notificationList = [] as Notification[];
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


    this.userNotificationObj = this.db.object(`/grocerybuddylist/${this.buddy1['$key']}`);
    this.userNotificationObj.$ref.child(this.authenticatedUser.uid).set({
      status: 'pending'
    });
  }

  saveBuddyList(){
    

    //check if the array contains already added buddy or notification so that only new notification is pushed to buddy's grocerybuddyist
    this.currentBuddyRef$ = this.db.list(`/grocerybuddylist/${this.authenticatedUser.uid}`);
    this.currentBuddyRef$.subscribe( buddyList  => this.buddyList = buddyList );
    var usersRef = this.db.list(`/profiles`, {
        query: {
            orderByChild: 'email',
            equalTo: this.buddy1.email , // How to check if participants contain username
        }
    });
    
    usersRef.subscribe(profileList => {
      
      if(profileList.length > 0){//check if registered user
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
              this.toast.create({
                message: `Buddy already exists`,
                duration: 3000
              }).present();
            }
            else{
              this.sendNotification();
            }
          }
          else{
            this.sendNotification();
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
        //send mail to user 
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
  