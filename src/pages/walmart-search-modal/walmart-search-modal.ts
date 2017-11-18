import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController  } from 'ionic-angular';
import { WalmartApiProvider } from '../../providers/walmart-api/walmart-api';
import { ShoppingItem } from '../../models/shopping-item/shopping-item.interface';

@IonicPage()
@Component({
  selector: 'page-walmart-search-modal',
  templateUrl: 'walmart-search-modal.html',
})
export class WalmartSearchModalPage {

  private itemName: string;
  private thumbnailImage: string;
  public isList: boolean;  // Product item list boolean
  public productName: string;  // Product name for searching
  public products: Array<any>; // Products search array
  private shoppingItem: ShoppingItem;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public viewCtrl: ViewController, private walmartApi: WalmartApiProvider) {
      this.shoppingItem = {} as ShoppingItem;
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
    this.thumbnailImage = item.thumbnailImage;
    this.products = [];
    this.isList = false;
  }
  
  closeWalmartModal(){
    console.log('closeWalmartModal');
    this.shoppingItem.itemName = this.itemName;
    this.shoppingItem.thumbnailImage = this.thumbnailImage;
    this.viewCtrl.dismiss(this.shoppingItem);
    
  }

}
