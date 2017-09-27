import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private database: AngularFireDatabase) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditProfilePage');
  }

  // async saveProfile(user, profile){
  //   this.profileObject = this.database.object('/profiles/${user.uid}');
  //   try{
  //     await this.profileObject.set(profile);
  //     return true;
  //   } catch(e){
  //     console.error(e);
  //     return false;
  //   }
  // }

}
