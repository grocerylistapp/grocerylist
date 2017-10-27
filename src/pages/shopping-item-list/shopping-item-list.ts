import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController, ModalController, AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { ShoppingItem } from '../../models/shopping-item/shopping-item.interface';
import { EditShoppingItemPage } from '../edit-shopping-item/edit-shopping-item';
import { WalmartApiProvider } from '../../providers/walmart-api/walmart-api';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { WalmartSearchModalPage } from '../walmart-search-modal/walmart-search-modal';
import { ItemRangeModalPage } from '../item-range-modal/item-range-modal';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';


@IonicPage()
@Component({
  selector: 'page-shopping-item-list',
  templateUrl: 'shopping-item-list.html',
})
export class ShoppingItemListPage {

  private loading;
  private authenticatedUser: User;
  private authenticatedUser$: Subscription;

  public isList: boolean;  // Product item list boolean
  private startShopping: boolean;

  public productName: string;  // Product name for searching
  private userid: string;
  private storeName: string;
  private itemName: string;

  private currentShoppingItem = {} as ShoppingItem;
  public products: Array<any>; // Products search array
  public shoppingListArray: Array<any> = [];
  public pickedListArray: Array<any> = [];

  private shoppingListRef$: FirebaseListObservable<ShoppingItem[]>;
  private pickedListRef$: FirebaseListObservable<ShoppingItem[]>;
  private previousListRef$: FirebaseListObservable<ShoppingItem[]>;
  private masterListRef$: FirebaseListObservable<ShoppingItem[]>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    private actionSheetCntrl: ActionSheetController, private walmartApi: WalmartApiProvider,
    private barcodeScanner: BarcodeScanner, public modalCtrl: ModalController, private toast: ToastController,
    public loadingCtrl: LoadingController, private auth: AuthServiceProvider, public alertCtrl: AlertController) {

    this.startShopping = true;
    this.storeName = this.navParams.get('storeName');
    // this.storeName = 'ERT';
    this.userid = this.navParams.get('userid');
    // this.userid = 'CQsDqoa1YZU9wCJfNwkbq2mtCsf1';

    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
    try {
      console.log("Came to ShoppingItemListPage constructor");
      this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
        this.authenticatedUser = user;
        console.log(`ShoppingItemListPage got user1 ${this.authenticatedUser.uid}`);
        this.loadFirebaseList();
      })
    } catch (e) { }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShoppingItemListPage');
  }

  loadFirebaseList() {
    var self = this;

    this.shoppingListRef$ = this.db.list(`/nexttrip/${this.authenticatedUser.uid}/${this.storeName}`, {
      query: {
        orderByChild: 'itemNumber',
        startAt: 1
      }
    });

    this.pickedListRef$ = this.db.list(`/nexttrip/${this.authenticatedUser.uid}/${this.storeName}`, {
      query: {
        orderByChild: 'pickedQuantity',
        startAt: 1
      }
    });

    // this.shoppingListRef$.subscribe(items => {
    //   // items is an array
    //   items.forEach(item => {
    //     // console.log(item.val().itemName);
    //     console.log('item');
    //     console.log(item);
    //   });
    // });

    // this.shoppingListRef$.$ref.once("value", function (snapshot) {
    //   console.log('snapshot 1');
    //   console.log(snapshot);
    //   snapshot.forEach(data => {
    //     console.log(data.val().itemName);
    //     self.shoppingListArray.push({ "itemName": data.val().itemName, "itemNumber": data.val().itemNumber, "checked": false, "key": data.key });
    //     return false;
    //   });
    // });

    self.loading.dismiss();
    console.log("self.shoppingListArray");
    console.log(self.shoppingListArray);
  }

  itemActionSheetCartItems(shoppingItem) {
    console.log(shoppingItem);
    this.actionSheetCntrl.create({
      title: `${shoppingItem.itemName}`,
      buttons: [
        {
          text: 'Add to Picked Items',
          handler: () => {
            console.log("Add to Picked Items");
            this.openItemRanger(shoppingItem.$key, shoppingItem.itemNumber, 0);
          }

        },
        {
          text: 'Delete From Cart Items',
          role: 'destructive',
          handler: () => {
            this.deleteItemFromNextTrip(shoppingItem);
          }

        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { }
        }

      ]
    }).present();
  }

  itemActionSheetPickedItems(shoppingItem) {
    console.log(shoppingItem);
    this.actionSheetCntrl.create({
      title: `${shoppingItem.itemName}`,
      buttons: [
        {
          text: 'Buy Next Time !',
          handler: () => {
            console.log("Buy Next Time !");
            this.addBackToNextTrip(shoppingItem);
          }

        },
        {
          text: 'Delete From Picked Items',
          role: 'destructive',
          handler: () => {
            this.deleteItemFromPickedItem(shoppingItem.$key, shoppingItem.itemNumber);
          }

        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { }
        }

      ]
    }).present();
  }

  addBackToNextTrip(item) {
    console.log('addBackToNextTrip');
    this.saveUpdateQuantity(item.$key, Number(item.itemNumber) + Number(item.pickedQuantity), Number(0));
  }

  deleteItemFromPickedItem(key, itemNumber) {
    console.log('deleteItemFromPickedItem');
    if (Number(itemNumber) == 0) {
      this.removeItem(key);
    } else {
      this.saveUpdateQuantity(key, itemNumber, Number(0));
    }
  }

  deleteItemFromNextTrip(item) {
    console.log('deleteItemFromNextTrip');
    if (Number(item.pickedQuantity) == 0) {
      this.removeItem(item.$key);
    } else {
      this.saveUpdateQuantity(item.$key, Number(0), item.pickedQuantity);
    }
  }

  /* open walmart api search modal */
  openWalmartSearch() {
    console.log('openWalmartSearch');
    let walmartModal = this.modalCtrl.create(WalmartSearchModalPage);

    walmartModal.onDidDismiss(data => {
      console.log('openWalmartSearch openWalmartSearch');
      console.log(data);
      this.checkItemExist(data);      
    });

    walmartModal.present();
  }

  /* call barcode plugin to scan the barcode */
  scanWalmartCode() {
    this.barcodeScanner.scan().then((barcodeData) => {
      /* Success! Barcode data is here */
      this.getBarcodeProductDetails(barcodeData.text);
    }, (err) => {
      this.showToast('Item not found, please type in the item.', 3000);
      // An error occurred
      console.log('err =' + JSON.stringify(err));
    });
  }

  /* get item detail from walmart using UPC */
  getBarcodeProductDetails(data) {

    /* Call Api to get product details */
    this.walmartApi.getProductDetaisByUPC(data).subscribe(
      data => {
        // this.currentShoppingItem.itemName = data.items[0].name;
        this.checkItemExist(data.items[0].name);
      },
      err => {  // Api response error
        this.showToast('Item not found, please type in the item.', 3000);
        console.log('err =' + JSON.stringify(err));
      },
      () => console.log('Product Search Complete')
    );
  }
  
  checkItemExist(value) {
    console.log('checkItemExist');
    
    this.shoppingListRef$.$ref.once("value", snapshot => {
      let isExist = false;
      snapshot.forEach(snaps => {          
        if (snaps.val().itemName == value) {
          console.log('data equal');
          isExist = true;
        }
        return false;
      });
      
      if(isExist){          
        this.getQuantityByName(value);   
      }else{
        // this.showToast('Item Not Present in the Cart, do you want to add it', 1000);    
        this.cnfmForNewItem(value);
      }
    });
  }

  getQuantityByName(value) {
    
    this.shoppingListRef$.$ref.once("value", snapshot => {
      snapshot.forEach(snaps => {          
        if (snaps.val().itemName == value) {
          this.openItemRanger(snaps.key, snaps.val().itemNumber, 0); 
        }
        return false;
      });
    });
  }
  
  openItemRanger(key, itemNumber, type) {
    console.log('openItemRanger');
    
    let rangeModal = this.modalCtrl.create(ItemRangeModalPage, { quantity: itemNumber , type: type });
    rangeModal.onDidDismiss(data => {
      console.log('ccc =' + data);
      if (data != undefined) {
        if(type == 0){
          this.addToPickedItemList(key, data);
        }else{
          this.addItemToPickedListNew(key,data);
        }
      }
    });

    rangeModal.present();
  }

  addToPickedItemList(key, qty) {
    console.log('addToPickedItemList');
    console.log(key);

    this.shoppingListRef$.$ref.once("value", snapshot => {
      snapshot.forEach(snaps => {

        let item = snaps.val();
        let itemNumber: number;
        let pickedQuantity: number;

        if (snaps.key === key) {
          if (item.itemNumber == qty) {
            itemNumber = Number(0);
            pickedQuantity = Number(item.pickedQuantity) + Number(qty);
            this.saveUpdateQuantity(snaps.key, itemNumber, pickedQuantity);
          } else {
            itemNumber = Number(item.itemNumber) - Number(qty);
            pickedQuantity = Number(item.pickedQuantity) + Number(qty);
            this.saveUpdateQuantity(snaps.key, itemNumber, pickedQuantity);
          }
        }
        return false;
      });
    });
  }

  cancelShopping() {

    this.shoppingListRef$.$ref.once("value", snapshot => {
      snapshot.forEach(snaps => {

        let item = snaps.val();
        let itemNumber: number = Number(item.itemNumber) + Number(item.pickedQuantity);
        let pickedQuantity: number = Number(0);
        this.saveUpdateQuantity(snaps.key, itemNumber, pickedQuantity);
        return false;
      });
    });
    // //navigate back one on the navigation stack
    this.navCtrl.pop();
  }

  /* show toast message dynamically */
  showToast(message, time) {
    this.toast.create({ message: message, duration: time }).present();
  }

  saveUpdateQuantity(key, itemNumber, pickedQuantity) {
    this.db.object(`/nexttrip/${this.authenticatedUser.uid}/${this.storeName}/` + key)
      .update({ itemNumber: itemNumber, pickedQuantity: pickedQuantity });
  }

  removeItem(key) {
    this.db.object(`/nexttrip/${this.authenticatedUser.uid}/${this.storeName}/` + key).remove();
  }

  cancelInstoreShopping() {
    console.log('cancelInstoreShopping');

    const alert = this.alertCtrl.create({
      title: 'Cancel Shopping',
      message: 'Do you want to remove all the picked items and leave this page?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Yes clicked');
            this.cancelShopping();
          }
        }
      ]
    });
    alert.present();
  }

  pauseShopping() {
    console.log('pauseShopping');

    const alert = this.alertCtrl.create({
      title: 'Pause Shopping',
      message: 'Do you want to puase shopping and leave this page?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Yes clicked');
            // //navigate back one on the navigation stack
            this.navCtrl.pop();
          }
        }
      ]
    });
    alert.present();
  }

  finishShopping(){
    console.log('finishShopping');

    const alert = this.alertCtrl.create({
      title: 'Finish Shopping',
      message: 'Do you want to finish shopping?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Yes clicked');
            // //navigate back one on the navigation stack
            this.savePreviousTrips();
          }
        }
      ]
    });
    alert.present();
  }

  savePreviousTrips(){
    console.log('savePreviousTrips');
    
    let todayDate = this.getTodayDate();
    let dateTime = (new Date).getTime();
    let isSaved;
    this.previousListRef$ = this.db.list(`/previoustrip/${this.authenticatedUser.uid}/`+todayDate+`/${this.storeName}/`+dateTime);
    
    this.pickedListRef$.$ref.once("value", snapshot => {
      snapshot.forEach(snaps => {

        let item = snaps.val();

        if(item.pickedQuantity > 0){
          this.previousListRef$.push({
            itemName: item.itemName,
            itemNumber: item.pickedQuantity
          });
        }
        return false;
      });
      this.clearAllPickedItem();
    });

  }

  clearAllPickedItem(){

    this.shoppingListRef$.$ref.once("value", snapshot => {
      let isExist = false;
      snapshot.forEach(snaps => {
          this.deleteItemFromPickedItem(snaps.key, snaps.val().itemNumber);
          return false;
      });
      // //navigate back one on the navigation stack
      this.navCtrl.pop();
    });
  }

  getTodayDate(){

    var date = new Date();
    let day = date.getDate();
    let month = Number(date.getMonth()) + 1;
    let year = date.getFullYear();
    return day + "_" + month + "_" + year ;
  }

  cnfmForNewItem(value){
    
    const alert = this.alertCtrl.create({
      title: 'Item Does Not Exist',
      message: 'Do you want to add this item to the Shopping List?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Yes clicked');
            this.openItemRanger(value,'', 1); 
          }
        }
      ]
    });
    alert.present();
  }
  
  addItemToPickedListNew(name,quantity) {
    console.log('addItemtopickedlist');
    // var self = this;
    var isSaved;

    isSaved = this.shoppingListRef$.push({
      itemName: name,
      itemNumber: Number(0),
      pickedQuantity : Number(quantity)
    }).key;

    if (isSaved) {
      this.showToast('Item added to the My Next Trip', 1000);
      this.itemMasterExist(name);
    }
  }

  itemMasterExist(name){
    
    let isExist: boolean = false;
    var self = this;
    self.masterListRef$ = self.db.list(`/masterlist/${self.authenticatedUser.uid}`);
    /* gets firebase data only once */
    self.masterListRef$.$ref.once("value", function (snapshot) {
      snapshot.forEach(data => {

        if (data.val().itemName == name) {
          isExist = true;
        }
        return false;
      });

      if (!isExist) {
        self.saveItemToMastrList(name);
      }
    });
  }
  
  saveItemToMastrList(name){
    this.masterListRef$.push({
      itemName: name,
      store: this.storeName
    });
  }
}
