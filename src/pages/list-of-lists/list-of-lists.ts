import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ListOfListsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-list-of-lists',
  templateUrl: 'list-of-lists.html',
})
export class ListOfListsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ListOfListsPage');
  }

  navigateToMyNextTrip(){
    this.navCtrl.push('MyNextTripPage');
  }

  navigateToMasterList(){
    this.navCtrl.push('MasterListPage');
  }
}
