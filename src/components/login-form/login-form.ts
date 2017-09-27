import { Component, Output, EventEmitter } from '@angular/core';
import {NavController} from 'ionic-angular';
import {Account} from '../../models/account/account.interface';
import { LoginResponse } from '../../models/login/login.response.interface';
import {ToastController} from 'ionic-angular';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';


/**
 * Generated class for the LoginFormComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'app-login-form',
  templateUrl: 'login-form.html'
})
export class LoginFormComponent {
  account = {} as Account;
   @Output() loginStatus: EventEmitter<LoginResponse>;

  constructor(private navCtrl : NavController, private auth: AuthServiceProvider, private toast: ToastController) {
    this.loginStatus = new EventEmitter<LoginResponse>();
  }

  navigateToRegisterPage(){
    this.navCtrl.push('RegisterPage');
  }

  async loginUser(){

    const result = await this.auth.signInWithEmailAndPassword(this.account);
    this.loginStatus.emit(result);

  }

}
