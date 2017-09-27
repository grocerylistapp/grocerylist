import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the TabsHomePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tabs-home',
  templateUrl: 'tabs-home.html',
})
export class TabsHomePage {

  tab1Root: string;
  tab2Root: string;
  tab3Root: string;

  constructor() {
  
    this.tab1Root = 'ListOfListsPage';
    this.tab2Root = 'ShoppingModePage'
    this.tab3Root = 'UserProfilePage'

  }

  

}
