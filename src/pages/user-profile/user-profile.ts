import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, App } from 'ionic-angular';
import { Profile } from '../../models/profile/profile';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {

  private firstName: string;
  private lastName: string;
  private emailAddress: string;  
  private loading;
  userProfile: Profile;
  private authenticatedUser : User;
  private authenticatedUser$ : Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthServiceProvider,
    public loadingCtrl: LoadingController,private data: DataServiceProvider, public alertCtrl: AlertController,
    public appCtrl: App) {
    
    let self = this;
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });    
    this.loading.present();
    try{
      this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
          self.getUserDet(user);
        })
      }catch(e){ }
  }

  getUserDet(user){
    var self = this;
    this.data.getProfile(user).subscribe(profile => {
      self.userProfile = <Profile>profile.val();
      
      self.firstName = self.userProfile.firstName;
      self.lastName = self.userProfile.lastName;
      self.emailAddress = self.userProfile.email;
      self.loading.dismiss();
    });
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserProfilePage');
  }

  signOut(){
    
        const alert = this.alertCtrl.create({
          title: 'Logout',
          message: 'Do you want to logout?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Yes',
              handler: () => {
                console.log('Yes clicked');
                this.auth.signOut();
                this.appCtrl.getRootNav().setRoot('LoginPage');
              }
            }
          ]
        });
        alert.present();
  }
  

}
