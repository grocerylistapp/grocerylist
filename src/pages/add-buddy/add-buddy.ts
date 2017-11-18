import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Platform  } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';
import { SocialSharing } from '@ionic-native/social-sharing';

import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';

import { User } from 'firebase/app';

import { Profile } from '../../models/profile/profile';
import { Notification } from '../../models/notification/notification.interface';

/**
 * Generated class for the AddBuddyPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-buddy',
  templateUrl: 'add-buddy.html',
})
export class AddBuddyPage {

  private authenticatedUser : User;
  private authenticatedUser$ : Subscription;
  private buddyStatus : string;
  private message : string;

  buddy1 = {} as Profile;
  currentBuddyRef$: FirebaseListObservable<Profile[]>;
  userNotificationRef$: FirebaseListObservable<Notification[]>;
  buddyList = [] as Profile[];
  notificationList = [] as Notification[];
  userNotificationObj: FirebaseObjectObservable<Notification>;
  userProfile: Profile;
  private user: any;
  private buddy: any;
  private userName : string;
  private isAddBuddy: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
  	private toastCtrl: ToastController, private data: DataServiceProvider, 
  	private auth: AuthServiceProvider, public platform: Platform,
  	private db: AngularFireDatabase, private socialSharing: SocialSharing) {

      this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
        this.authenticatedUser = user;
        this.data.getProfile(user).subscribe(profile => {
          this.userProfile = <Profile>profile.val();
        });
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddBuddyPage');
    console.log('ionViewDidLoad AddBuddyPage');
    this.buddyStatus = this.navParams.get('buddyStatus');
    console.log(this.authenticatedUser);
    this.checkBuddyStatus();
    this.getUserDetails();
  }

  getUserDetails(){
    var usersRef = this.db.list(`/profiles`, {
      query: {
          orderByChild: 'email',
          equalTo: this.authenticatedUser.email , // How to check if participants contain username
      }
  });

  usersRef.subscribe(profileList => {
    
    this.userName = profileList[0].firstName +' '+ profileList[0].lastName;
    
  });
 
  }

  checkBuddyStatus(){
    if(this.buddyStatus == "userProfile"){
      this.isAddBuddy = true;

    }else{
      this.isAddBuddy = false;
    }
  }

  skipContent(){
    if(this.buddyStatus == "userProfile"){
        this.navCtrl.pop();
      }else{
        this.navCtrl.push('AddPreferredStorePage');
        
      }
  }

  sendNotification(){
    
    
        this.userNotificationObj = this.db.object(`/grocerybuddylist/${this.buddy1['$key']}`);
        this.userNotificationObj.$ref.child(this.authenticatedUser.uid).set({
          status: 'pending'
        });

        // this.navCtrl.setRoot('TabsHomePage');
        this.presentToast("Buddy invited");
      }
    
      saveBuddyList(){
        if(this.buddy1.email == "" || this.buddy1.email == null){
          this.presentToast("Please enter email address");
        }else{
        
        if(this.authenticatedUser.email == this.buddy1.email){
          this.presentToast("Same as registered email");
        }else{
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
              this.user = this.buddy1
              if(this.buddyList && this.buddyList.length > 0){
                this.buddy = this.buddyList
                
                let currentBuddyList = this.buddy.filter(buddy  => {
                  if (buddy.$key == this.user.$key){
                    return buddy;
                  }
                });
                
                if(currentBuddyList.length > 0){
                  this.presentToast("Buddy already exists");
                  
                }
                else{
                  this.sendNotification();
                }
              }
              else{
                this.sendNotification();
              }
            }
            
    
          }
          else{
            //send mail to user 
            this.presentToast("User doesn't exist. Please send invite");
            // this.navCtrl.setRoot('TabsHomePage');
          }
          
        });
  
      }
    }
        
  }
    
      ngOnDestroy(): void {
        this.authenticatedUser$.unsubscribe();
      }

      invitebuddy(){

        let subject = this.authenticatedUser.email +' invited you to XOOMcart';
        let message = this.userName +' '+this.authenticatedUser.email+' invited you to join XOOMcart, that helps you improve your shopping experience in stores. Please click on the link below to download the app'

        if (this.platform.is('ios')) {
          
        
          this.socialSharing.share(message, subject,"", "www.xoomcart.com/ios")
        }
        if (this.platform.is('android')) {
          this.socialSharing.share(message, subject,"", "www.xoomcart.com/andriod ")
          
        }
      }

      // Configure Toast
   public presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000
      // position: 'top'
    });
    toast.present();
  }

  

}
