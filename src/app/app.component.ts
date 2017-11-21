import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {ToastController} from 'ionic-angular';

import { Geofence } from '@ionic-native/geofence';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { DataServiceProvider } from '../providers/data-service/data-service';
import { User } from 'firebase/app';

@Component({
  templateUrl: 'app.html',
})
export class xoomCart {

  rootPage:string;
  isFirstTime: boolean = true;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private auth: AuthServiceProvider, 
    private geofence: Geofence, private data: DataServiceProvider, private toast: ToastController) {
    this.auth.getAuthenticatedUser().subscribe(auth => {
      
      if(this.isFirstTime){        
        if(!auth){
          this.rootPage = 'LoginPage';
        }else{
          this.data.getProfile(<User>auth).subscribe(profile => {
            this.toast.create({
              message: `Welcome In! ${auth.email}`,
              duration: 3000
            }).present();
    
            profile.val() ? this.rootPage = 'TabsHomePage': this.rootPage = 'EditProfilePage';
          })
        }
        this.isFirstTime = false;
      }
    })

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      var self = this;
      // initialize the plugin
      geofence.initialize().then(
        // resolved promise does not return a value
        () => {
          console.log('Geofence Plugin Ready Always');
        },
        (err) => console.log(err)
      )
    });
  }

  // private addGeofence() {
  //   //options describing geofence
  //   let fence = {
  //     id: '69ca1b88-6fbe-4e80-a4d4-ff4d3748acdb', //any unique ID
  //     latitude: 8.484778, //center of geofence radius
  //     longitude:  76.931649,
  //     radius: 100, //radius to edge of geofence in meters
  //     transitionType: 3, //see 'Transition Types' below
  //     notification: { //notification settings
  //       id: 1, //any unique ID
  //       title: 'You crossed a fence', //notification title
  //       text: 'You just arrived to Gliwice city center.', //notification body
  //       openAppOnClick: true //open app when notification is tapped
  //     }
  //   }

  //   this.geofence.addOrUpdate(fence).then(
  //     () => console.log('Geofence added'),
  //     (err) => console.log('Geofence failed to add')
  //   );

  //   this.geofence.onNotificationClicked().subscribe((notificationData) => {
  //       console.log(notificationData);
  //     });

  // }
}

