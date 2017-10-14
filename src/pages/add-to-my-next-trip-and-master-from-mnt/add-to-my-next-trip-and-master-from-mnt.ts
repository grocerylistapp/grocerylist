import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';

import { ShoppingItem } from '../../models/shopping-item/shopping-item.interface';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '../../models/store/store';
import { ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { WalmartApiProvider } from '../../providers/walmart-api/walmart-api';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { WalmartSearchModalPage} from '../walmart-search-modal/walmart-search-modal';

@IonicPage()
@Component({
  selector: 'page-add-to-my-next-trip-and-master-from-mnt',
  templateUrl: 'add-to-my-next-trip-and-master-from-mnt.html',
  providers: [WalmartApiProvider]
})
export class AddToMyNextTripAndMasterFromMntPage {

  currentShoppingItem = {} as ShoppingItem;
  shoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;
  nextTripItemRef$: FirebaseListObservable<ShoppingItem[]>;
  storeRef$: FirebaseListObservable<Store[]>;
  private authenticatedUser: User;
  private authenticatedUser$: Subscription;
  private isExist: boolean;
  private loading;
  public myForm: FormGroup;
  public isList: boolean;  // Product item list boolean
  public productName: string;  // Product name for searching
  public products: Array<any>; // Products search array
  private itemQuantity: number;
  private quantity: number = 1;
  private storeName: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    private auth: AuthServiceProvider, private data: DataServiceProvider, private toast: ToastController,
    public loadingCtrl: LoadingController, public formBuilder: FormBuilder, private walmartApi: WalmartApiProvider,
    private barcodeScanner: BarcodeScanner, public modalCtrl: ModalController) {
    this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
    });
    //const shopppingItem : ShoppingItem = this.navParams.get('shoppingItem');
    if (this.navParams.get('shoppingItem')) {
      this.currentShoppingItem = this.navParams.get('shoppingItem');
    }
    this.isExist = false;

    this.myForm = formBuilder.group({
      itemName: ['', Validators.required],
      quantity: [''],
      storeName: ['']
    });

    this.myForm.valueChanges.subscribe(data => this.onValueChanged(data));
  }

  onValueChanged(data?: any) {
    if (!this.myForm) { return; }
    const form = this.myForm;
    for (const field in this.formErrors) {
      // clear previous error message
      this.formErrors[field] = [];
      this.myForm[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field].push(messages[key]);
        }
      }
    }
  };

  formErrors = {
    'itemName': '',
    'quantity': '',
    'storeName': ''
  };

  validationMessages = {
    'itemName': {
      'required': 'Item Name is required.'
    },
    'quantity': {},
    'storeName': {}
  };

  /* check whether the item name exist in masterlist, 
     if not save the value */
  addShoppingItemToMasterList() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
    var self = this;

    self.shoppingItemRef$ = self.db.list(`/masterlist/${self.authenticatedUser.uid}`);
    /* gets firebase data only once */
    self.shoppingItemRef$.$ref.once("value", function (snapshot) {
      snapshot.forEach(data => {

        if (data.val().itemName == self.currentShoppingItem.itemName) {
          self.isExist = true;
          self.showToast('Item already exists in Master List', 1000);
          self.loading.dismiss();
        }
        return false;
      });

      if (!self.isExist) {
        self.saveToFirebaseMasterItemList();
      }
      self.isExist = false;
    });
  }

  /* save the item to firebase
     check the store value exist or not
     if not, save store value as None */
  saveToFirebaseMasterItemList() {
    console.log('saveToFirebaseMasterItemList');
    let isSaved;
    if (this.storeName) {
      isSaved = this.shoppingItemRef$.push({
        itemName: this.currentShoppingItem.itemName,
        store: this.storeName
      }).key;
    } else {
      isSaved = this.shoppingItemRef$.push({
        itemName: this.currentShoppingItem.itemName,
        store: "None"
      }).key;
    }

    if (isSaved) {
      // this.loading.dismiss();
      this.saveToFirebaseNextTripList(isSaved);
    }
  }

  /* save the item to firebase
     check the store value exist or not
     if not, save store value as None */
  saveToFirebaseNextTripList(key) {
    var self = this;
    if (!this.storeName) this.storeName = "None";

    this.nextTripItemRef$ = this.db.list(`/nexttrip/${this.authenticatedUser.uid}/${this.storeName}`);
    
    self.nextTripItemRef$.$ref.once("value", function (snapshot) {
      snapshot.forEach(data => {
        if (data.val().itemName == self.currentShoppingItem.itemName) {
          self.isExist = true;
          // self.loading.dismiss();
        }
        return false;
      });

      if (!self.isExist) {
        self.saveFirebaseMyNextTrip();
      }else{        
        self.showToast('Item already exists in My Next Trip', 1000);
      }
      self.isExist = false;
    });
  }

  saveFirebaseMyNextTrip(){
    if (!this.quantity) this.quantity = 1;
    let isSaved;
    isSaved = this.nextTripItemRef$.push({
      itemName: this.currentShoppingItem.itemName,
      itemNumber: Number(this.quantity)
      // store: this.storeName? this.storeName : "None"
    }).key;

    if (isSaved) {
      this.loading.dismiss();
      this.showToast('Item added to the My Next Trip', 1000);
      this.navCtrl.pop();
    }
  }

  /* get item detail from walmart using UPC */
  getBarcodeProductDetails(data) {
    /* Call Api to get product details */
    this.walmartApi.getProductDetaisByUPC(data).subscribe(
      data => {
        this.currentShoppingItem.itemName = data.items[0].name;
      },
      err => {  
        this.showToast('Item not found, please type in the item.', 1000);
        // Api response error
        console.log('err ='+ JSON.stringify(err));
      },
      () => console.log('Product Search Complete')
    );
  }

  /* show toast message dynamically */
  showToast(message, time) {
    this.toast.create({ message: message, duration: time }).present();
  }
  
    /* open walmart api search modal */
  openWalmartSearch(){
    console.log('openWalmartSearch');
    let walmartModal = this.modalCtrl.create(WalmartSearchModalPage);
    
    walmartModal.onDidDismiss(data => {
      this.currentShoppingItem.itemName = data;
    });
    
    walmartModal.present();
  }
  


}
