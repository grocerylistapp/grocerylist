import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

/**
 * Generated class for the AddBuddyPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-buddy',
  templateUrl: 'add-buddy.html',
})
export class AddBuddyPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, 
  	private toast: ToastController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddBuddyPage');
  }

  

}
