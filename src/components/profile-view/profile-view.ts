import { Component, OnInit } from '@angular/core';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { User } from 'firebase/app';
import { Profile } from '../../models/profile/profile';
import { Subscription } from 'rxjs/Subscription';
import { FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
/**
 * Generated class for the ProfileViewComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'app-profile-view',
  templateUrl: 'profile-view.html'
})
export class ProfileViewComponent implements OnInit{
  userProfile: Profile;
  private authenticatedUser : User;
  private buddyListRef$ : FirebaseListObservable<Profile[]>
  private inviteListRef$ : FirebaseListObservable<Notification[]>
  private userBuddyListObj: FirebaseObjectObservable<Profile>;
  private buddyBuddyListObj: FirebaseObjectObservable<Profile>;
  private buddyNotificationObj: FirebaseObjectObservable<Notification>;
  private userNotificationObj: FirebaseObjectObservable<Notification>;

  constructor(private data: DataServiceProvider, private auth: AuthServiceProvider,
    private db : AngularFireDatabase) {
    console.log('Hello ProfileViewComponent Component');
  }

  ngOnInit(): void {
    this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
      this.data.getProfile(user).subscribe(profile => {
        this.userProfile = <Profile>profile.val();
      });
      this.buddyListRef$ = this.db.list(`/grocerybuddylist/${this.authenticatedUser.uid}`);
      this.inviteListRef$ = this.db.list(`/notification/${this.authenticatedUser.uid}`);
      

    })
  }

  acceptInvite(notification) {
    console.log(notification);
    this.userBuddyListObj = this.db.object(`/grocerybuddylist/${this.authenticatedUser.uid}`);
    this.userBuddyListObj.$ref.child(notification['$key']).set(notification.buddy);
    this.buddyBuddyListObj = this.db.object(`/grocerybuddylist/${notification['$key']}`);
    this.buddyBuddyListObj.$ref.child(this.authenticatedUser.uid).set(this.userProfile);

    this.userNotificationObj = this.db.object(`/notification/${this.authenticatedUser.uid}`);
    this.buddyNotificationObj = this.db.object(`/notification/${notification['$key']}`);

    this.userNotificationObj.$ref.child(notification['$key']).update({
        user: notification.user,
        buddy: notification.buddy,
        status: 'completed'
      });
      this.buddyNotificationObj.$ref.child(this.authenticatedUser.uid).update({
        buddy: notification.user,
        user: notification.buddy,
        status: 'completed'
      });

  }
}
