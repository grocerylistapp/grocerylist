import {NgModule} from '@angular/core';
import {IonicModule} from 'ionic-angular';
import { LoginFormComponent } from './login-form/login-form'
import { RegisterFormComponent } from './register-form/register-form';
import { EditProfileFormComponent } from './edit-profile-form/edit-profile-form';
import { ProfileViewComponent } from './profile-view/profile-view';
import { AddGrocerybuddyFormComponent } from './add-grocerybuddy-form/add-grocerybuddy-form';
@NgModule({
    declarations: [LoginFormComponent,
    RegisterFormComponent,
    EditProfileFormComponent,
    ProfileViewComponent,
    AddGrocerybuddyFormComponent],
    imports: [IonicModule],
    exports: [LoginFormComponent,
    RegisterFormComponent,
    EditProfileFormComponent,
    ProfileViewComponent,
    AddGrocerybuddyFormComponent]
})

export class ComponentsModule{

}
