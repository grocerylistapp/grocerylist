import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { User } from 'firebase/app';
import { Profile } from '../../models/profile/profile';
import { Subscription } from 'rxjs/Subscription';
import { FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';

/**
 * Generated class for the ShopBuddyListPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shop-buddy-list',
  templateUrl: 'shop-buddy-list.html',
})
export class ShopBuddyListPage {

  userProfile: Profile;
  private authenticatedUser : User;
  private inviteListRef$ : FirebaseListObservable<Notification[]>
  private userBuddyListObj: FirebaseObjectObservable<Profile>;
  private buddyBuddyListObj: FirebaseObjectObservable<Profile>;

  buddyListPending: Array<any> = [];
  buddyListCompleted: Array<any> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private data: DataServiceProvider, private auth: AuthServiceProvider,
    private db : AngularFireDatabase) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShopBuddyListPage');
  }

  ngOnInit(): void {
    this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
      //this.buddyList = [];
      this.inviteListRef$ = this.db.list(`/grocerybuddylist/${user.uid}`);
      this.inviteListRef$.subscribe( inviteList  => {
        console.log(inviteList);
        inviteList.forEach((invite) => {
          let profileData = this.db.object(`/profiles/${invite['$key']}`);
          //this.buddyList = [];
          this.buddyListPending  = [];
          this.buddyListCompleted  = [];
          profileData.subscribe((buddyProfile) => {
            if(invite['status'] == 'pending') {
              console.log(this.buddyListPending)
              this.buddyListPending.push({
                buddy: buddyProfile,
                status: invite['status']
              });
            }
            else if(invite['status'] == 'completed') {
              console.log(this.buddyListCompleted)
              this.buddyListCompleted.push({
                buddy: buddyProfile,
                status: invite['status']
              });
            }
          });

        });
        //console.log(this.buddyList);
      });
      this.data.getProfile(user).subscribe(profile => {
        this.userProfile = <Profile>profile.val();
      });
    })
  }

  acceptInvite(notification) {
    console.log(notification);
    this.userBuddyListObj = this.db.object(`/grocerybuddylist/${this.authenticatedUser.uid}`);
    this.buddyBuddyListObj = this.db.object(`/grocerybuddylist/${notification.buddy['$key']}`);

    this.userBuddyListObj.$ref.child(notification.buddy['$key']).update({
      status: 'completed'
    });
    this.buddyBuddyListObj.$ref.child(this.authenticatedUser.uid).set({
      status: 'completed'
    });
    this.buddyListCompleted.forEach((invite) => {
          if(invite.buddy['$key'] === notification.buddy['$key']) {
            invite.buddy.status = 'completed';
            invite.status = 'completed';
          }
    });

  }

  declineInvite(notification) {
    console.log(notification);
    this.userBuddyListObj = this.db.object(`/grocerybuddylist/${this.authenticatedUser.uid}`);
    this.userBuddyListObj.$ref.child(notification.buddy['$key']).remove();
  }

  navigateToAddBuddy(){
    this.navCtrl.push('AddBuddyPage',{ buddyStatus: "userProfile"});
  }

}
