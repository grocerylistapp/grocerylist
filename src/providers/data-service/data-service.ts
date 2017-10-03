import { Injectable } from '@angular/core';
import {AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database';
import {User} from 'firebase/app';
import { Profile } from '../../models/profile/profile';
import "rxjs/add/operator/take";
import { ShoppingItem } from '../../models/shopping-item/shopping-item.interface';
/*
  Generated class for the DataServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class DataServiceProvider {

  profileObject: FirebaseObjectObservable<Profile>
  
  constructor(private database: AngularFireDatabase) {
    console.log('Hello DataServiceProvider Provider');
  }

  async saveProfile(user: User, profile: Profile){
    this.profileObject = this.database.object(`/profiles/${user.uid}`);
    try{
      await this.profileObject.set(profile);
      return true;
    } catch(e){
      console.log(e);
      return false;
    }

  }

  getProfile(user: User){
    this.profileObject = this.database.object(`/profiles/${user.uid}`, {preserveSnapshot : true});
    return this.profileObject.take(1);
  }


}
