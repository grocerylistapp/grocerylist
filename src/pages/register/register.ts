import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {AngularFireAuth} from 'angularfire2/auth';
import {Account} from '../../models/account/account.interface';
import {ToastController} from 'ionic-angular';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';
import {RegisterFormComponent} from '../../components/register-form/register-form';
import {ComponentsModule} from '../../components/components.module';
import {LoginResponse} from '../../models/login/login.response.interface';

/**
 * Generated class for the RegisterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  // account = {} as Account;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private afAuth: AngularFireAuth, private toast: ToastController) {
  }

  
  getAuthenticatedUser(){
    this.afAuth.authState;
  }

  // async register(account){
  //   try{
      
  //     const result = await this.afAuth.auth.createUserWithEmailAndPassword(this.account.email, 
  //       this.account.password);
  //       this.toast.create({
  //         message: `Account Creation Successful`,
  //         duration: 3000
  //       }).present();
  //       this.navCtrl.setRoot('LoginPage');
  //       this.toast.create({
  //         message: `Please login to your account`,
  //         duration: 3000
  //       }).present();

  //   } catch (e){
  //     console.log(e);
  //     this.toast.create({
  //       message: e.message,
  //       duration: 3000
  //     }).present();
  //   }
  // }

  registerUser(event: LoginResponse){
    if(!event.error){
      this.toast.create({
        message: `Registration Successful! Please login again ${event.result.email}`,
        duration: 3000
      }).present();
      this.navCtrl.setRoot('LoginPage');
    } else{
      this.toast.create({
        message: `Account not created. ${event.error.message}`,
        duration: 3000
      }).present();
    }
  }

}
