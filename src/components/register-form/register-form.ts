import { Component, Output, EventEmitter } from '@angular/core';
import {NavController, NavParams } from 'ionic-angular';
import {Account} from '../../models/account/account.interface';
import {ToastController} from 'ionic-angular';
import { LoginResponse } from '../../models/login/login.response.interface';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';

/**
 * Generated class for the RegisterFormComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'app-register-form',
  templateUrl: 'register-form.html'
})
export class RegisterFormComponent {

  account = {} as Account;
  @Output() registerStatus: EventEmitter<LoginResponse>;
  confirmpassword: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private auth: AuthServiceProvider, private toast: ToastController) {
    this.registerStatus = new EventEmitter<LoginResponse>();
  }

  async register(account){
    //try{
      if(this.confirmpassword != this.account.password){
        this.toast.create({
          message: 'Password Mismatch !',
          duration: 3000
        }).present();
      }else{
        const result = await this.auth.register(this.account);
        if(result.error != null){
          console.error(result.error.message);
        }
        this.registerStatus.emit(result);
      }
    // }catch(e){
    //   console.error(e);
    //   this.registerStatus.emit(e);
    //}
    // try{
      
    //   const result = await this.afAuth.auth.createUserWithEmailAndPassword(this.account.email, 
    //     this.account.password);
    //     this.toast.create({
    //       message: `Account Creation Successful`,
    //       duration: 3000
    //     }).present();
    //     this.navCtrl.setRoot('LoginPage');
    //     this.toast.create({
    //       message: `Please login to your account`,
    //       duration: 3000
    //     }).present();

    // } catch (e){
    //   console.log(e);
    //   this.toast.create({
    //     message: e.message,
    //     duration: 3000
    //   }).present();
    // }
  }

  goBackToLogin(){    
    this.navCtrl.pop();
  }

}
