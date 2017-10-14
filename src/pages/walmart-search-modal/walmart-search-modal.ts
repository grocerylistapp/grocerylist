import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController  } from 'ionic-angular';
import { WalmartApiProvider } from '../../providers/walmart-api/walmart-api';

@IonicPage()
@Component({
  selector: 'page-walmart-search-modal',
  templateUrl: 'walmart-search-modal.html',
})
export class WalmartSearchModalPage {

  private itemName: string;
  public isList: boolean;  // Product item list boolean
  public productName: string;  // Product name for searching
  public products: Array<any>; // Products search array

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public viewCtrl: ViewController, private walmartApi: WalmartApiProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WalmartSearchModalPage');
  }

  /* search for a product with keyword*/
  searchProduct(event, key) {

    /* search activates only if the letter typed exceeds one*/
    if (event.target.value.length > 1) {
      var temp = event.target.value;

      /* Call Api to get product details */
      this.walmartApi.getProductDetaisByKeyword(temp).subscribe(
        data => {
          /* Set Api response values */
          this.products = data.items;
          this.isList = true;
        },
        err => {
          /* Set Api response error */
          console.log(err);
        },
        () => console.log('Product Search Complete')
      );
    }
  }

  /* Item tapped event on the item list */
  itemTapped(event, item) {
    this.itemName = item.name;
    this.products = [];
    this.isList = false;
  }
  
  closeWalmartModal(){
    console.log('closeWalmartModal');
    this.viewCtrl.dismiss(this.itemName);
  }

}
