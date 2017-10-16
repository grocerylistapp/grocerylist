import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { ShoppingItem } from '../../models/shopping-item/shopping-item.interface';
import { EditShoppingItemPage } from '../edit-shopping-item/edit-shopping-item';
import { WalmartApiProvider } from '../../providers/walmart-api/walmart-api';


@IonicPage()
@Component({
  selector: 'page-shopping-item-list',
  templateUrl: 'shopping-item-list.html',
})
export class ShoppingItemListPage {
  
  userid: string;
  storeName: string;
  shoppingListRef$ : FirebaseListObservable<ShoppingItem[]>;
  currentShoppingItem = {} as ShoppingItem;
  public isList: boolean;  // Product item list boolean
  public productName: string;  // Product name for searching
  public products: Array<any>; // Products search array
  private itemName: string;
  private startShopping: boolean;
  public shoppingListArray: Array<any> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    private actionSheetCntrl : ActionSheetController, private walmartApi: WalmartApiProvider) {
    this.storeName = this.navParams.get('storeName');
    this.userid = this.navParams.get('userid');
    this.shoppingListRef$ =  this.db.list(`/nexttrip/${this.userid}/${this.storeName}`);
    this.startShopping = true;
    var self = this;
    this.shoppingListRef$.$ref.once("value", function (snapshot) {
      snapshot.forEach(data => {
        self.shoppingListArray.push({"itemName": data.val().itemName,"itemNumber": data.val().itemNumber,"checked": false});
        return false;
      });
    });
    console.log("self.shoppingListArray");
    console.log(self.shoppingListArray);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShoppingItemListPage');
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
      this.currentShoppingItem.itemName = item.name;
      this.products = [];
      this.isList = false;
      this.checkItemExist(item.name);
    }

    checkItemExist(itemName) {
        this.shoppingListArray.forEach(data => {
          console.log('data');
          console.log(JSON.stringify(data));
          if (data.itemName == itemName) {
            data.checked = true;
          }
        });
  }
}
