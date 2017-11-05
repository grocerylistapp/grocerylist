import { Component, Output, EventEmitter } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';

import {AngularFireAuth} from 'angularfire2/auth';
import {Account} from '../../models/account/account.interface';
import {ToastController} from 'ionic-angular';
import {LoginResponse} from '../../models/login/login.response.interface';
import {LoginFormComponent} from '../../components/login-form/login-form';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { User } from 'firebase/app';
/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  account = {} as Account;
  @Output() loginStatus: EventEmitter<LoginResponse>;

  constructor(private data: DataServiceProvider, public navCtrl: NavController, public navParams: NavParams, 
  private afAuth: AngularFireAuth, private toast: ToastController, private nativeStorage: NativeStorage) {
  //  this.loginStatus = new EventEmitter<LoginResponse>();
}

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  navigateToPage(pageName: string){
    pageName === 'TabsHomePage'? this.navCtrl.setRoot(pageName): this.navCtrl.push(pageName);
  }

  login(event: LoginResponse){
    if(!event.error){
      this.toast.create({
        message: `Welcome In! ${event.result.email}`,
        duration: 3000
      }).present();
      this.data.getProfile(<User>event.result).subscribe(profile => {
        console.log(profile);
        // this.nativeStorage.setItem('userId', String(profile.key))
        //   .then(
        //     () => console.log('Stored item!'),
        //     error => console.error('Error storing item', error)
        //   );

        profile.val() ? this.navCtrl.setRoot('TabsHomePage'): this.navCtrl.setRoot('EditProfilePage');
      })
      
    } else{
      this.toast.create({
        message: event.error.message,
        duration: 3000
      }).present();
    }
  }
  
}
