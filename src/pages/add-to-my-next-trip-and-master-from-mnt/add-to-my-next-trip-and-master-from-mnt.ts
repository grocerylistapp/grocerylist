import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

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

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    private auth: AuthServiceProvider, private data: DataServiceProvider, private toast: ToastController,
    public loadingCtrl: LoadingController, public formBuilder: FormBuilder, private walmartApi: WalmartApiProvider,
    private barcodeScanner: BarcodeScanner) {
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
    if (this.currentShoppingItem.store) {
      isSaved = this.shoppingItemRef$.push({
        itemName: this.currentShoppingItem.itemName,
        store: this.currentShoppingItem.store
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

    if (!this.currentShoppingItem.store) this.currentShoppingItem.store = "None";

    let isSaved;
    this.nextTripItemRef$ = this.db.list(`/nexttrip/${this.authenticatedUser.uid}/${this.currentShoppingItem.store}`);
    if (!this.currentShoppingItem.itemNumber) this.currentShoppingItem.itemNumber = 0;
    isSaved = this.nextTripItemRef$.push({
      itemName: this.currentShoppingItem.itemName,
      itemNumber: Number(this.currentShoppingItem.itemNumber)
      // store: currentShoppingItem.store? currentShoppingItem.store : "None"
    }).key;

    if (isSaved) {
      this.loading.dismiss();
      this.showToast('Item added to the My Next Trip', 1000);
      this.navCtrl.pop();
    }
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
  }
  
  /* call barcode plugin to scan the barcode */
  scanWalmartCode() {
    this.barcodeScanner.scan().then((barcodeData) => {
      /* Success! Barcode data is here */
      this.getBarcodeProductDetails(barcodeData.text);
    }, (err) => {
      // An error occurred
      console.log('err ='+ JSON.stringify(err));
    });
  }

  /* get item detail from walmart using UPC */
  getBarcodeProductDetails(data) {
    /* Call Api to get product details */
    this.walmartApi.getProductDetaisByUPC(data).subscribe(
      data => {
        this.currentShoppingItem.itemName = data.items[0].name;
      },
      err => {  // Api response error
        console.log('err ='+ JSON.stringify(err));
      },
      () => console.log('Product Search Complete')
    );
  }

  /* show toast message dynamically */
  showToast(message, time) {
    this.toast.create({ message: message, duration: time }).present();
  }


}
