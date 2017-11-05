import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Geofence } from '@ionic-native/geofence';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';

@Component({
  templateUrl: 'app.html',
})
export class inSCANout {

  rootPage:string;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private auth: AuthServiceProvider, private geofence: Geofence) {
    this.auth.getAuthenticatedUser().subscribe(auth => {
      !auth? this.rootPage = 'LoginPage' : this.rootPage = 'TabsHomePage';
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

