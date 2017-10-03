import { Component, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Profile } from '../../models/profile/profile';
import {User} from 'firebase/app';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';
import {Subscription} from 'rxjs/Subscription';

/**
 * Generated class for the EditProfileFormComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'app-edit-profile-form',
  templateUrl: 'edit-profile-form.html'
})
export class EditProfileFormComponent implements OnDestroy{
  
  profile = {} as Profile;
  private authenticatedUser : User;
  private authenticatedUser$ : Subscription;
  @Output() saveProfileResult: EventEmitter<Boolean>;
  
  constructor(private data: DataServiceProvider, private auth: AuthServiceProvider) {
    console.log('Hello EditProfileFormComponent Component');
    this.saveProfileResult = new EventEmitter<Boolean>();
    this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
    this.authenticatedUser = user;
    })
    
  }

  async saveProfile(){
    if(this.authenticatedUser){
      this.profile.email = this.authenticatedUser.email;
      const result = await this.data.saveProfile(this.authenticatedUser, this.profile);
      console.log(result);
      this.saveProfileResult.emit(result);
    }
  }

  ngOnDestroy(): void {
    this.authenticatedUser$.unsubscribe();
  }


}
