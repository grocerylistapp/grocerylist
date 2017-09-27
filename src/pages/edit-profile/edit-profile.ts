import { Component, EventEmitter } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Profile } from '../../models/profile/profile';
import {User} from 'firebase/app';
import {AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database'


/**
 * Generated class for the EditProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {

  profile = {} as Profile;
  profileObject: FirebaseObjectObservable<Profile>
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private database: AngularFireDatabase,
    private toast: ToastController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditProfilePage');
  }

  navigateToPage(event: Boolean){
    if(event){
      this.navCtrl.setRoot('TabsHomePage');
      this.toast.create({
        message: `Welcome In!`,
        duration: 3000
      }).present();
    } else{
      this.toast.create({
        message: `Save failed. Ensure all information is valid before saving!`,
        duration: 3000
      }).present();
    }
}

}
