import { Injectable } from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {Account} from '../../models/account/account.interface';
import {ToastController} from 'ionic-angular';
import {LoginResponse} from '../../models/login/login.response.interface';
import firebase from 'firebase';
/*
  Generated class for the AuthServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class AuthServiceProvider {

  constructor(private auth: AngularFireAuth) {
    console.log('Hello AuthServiceProvider Provider');
  }

  async signInWithEmailAndPassword(account: Account){
    try{
      return <LoginResponse>{
        result: await this.auth.auth.signInWithEmailAndPassword(account.email, account.password)
     }
    }catch(e){
      console.error(e);
      return <LoginResponse>{
        error: e
      };
    }
  }

  async register(account: Account){
    try{
      return <LoginResponse>{
        result: await this.auth.auth.createUserWithEmailAndPassword(account.email, account.password)
     }
    }catch(e){
      console.error(e);
      return <LoginResponse>{
        error: e
      };
    }
  }

  getAuthenticatedUser(){
    return this.auth.authState;
  }

  getCurrentUser(){
    return firebase.auth().currentUser;
  }

  signOut(){
    this.auth.auth.signOut();
    }

}
