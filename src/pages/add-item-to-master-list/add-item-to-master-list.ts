import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';

import { ShoppingItem } from '../../models/shopping-item/shopping-item.interface';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Profile } from '../../models/profile/profile';
import { Store } from '../../models/store/store';
import { User } from 'firebase/app';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { Subscription } from 'rxjs/Subscription';
import { ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { WalmartApiProvider } from '../../providers/walmart-api/walmart-api';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { WalmartSearchModalPage} from '../walmart-search-modal/walmart-search-modal';

/**
 * Generated class for the AddItemToMasterListPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-item-to-master-list',
  templateUrl: 'add-item-to-master-list.html',
  providers: [WalmartApiProvider]
})

export class AddItemToMasterListPage {

  currentShoppingItem = {} as ShoppingItem;
  shoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;
  preferredStoresList: FirebaseListObservable<Store[]>;
  private authenticatedUser: User;
  private authenticatedUser$: Subscription;
  private isExist: boolean;
  private loading;
  public myForm: FormGroup;
  public isList: boolean;  // Product item list boolean
  public productName: string;  // Product name for searching
  public products: Array<any>; // Products search array
  public storeList: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    private auth: AuthServiceProvider, private data: DataServiceProvider, private toast: ToastController,
    public loadingCtrl: LoadingController, public formBuilder: FormBuilder, private walmartApi: WalmartApiProvider,
    private barcodeScanner: BarcodeScanner, public modalCtrl: ModalController) {
     // this.currentShoppingItem.thumbnailImage = "assets/img/noimagethumbnail.jpg";
      this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
    });
    this.isExist = false;

    this.myForm = formBuilder.group({
      itemName: ['', Validators.required],
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
    'storeName': ''
  };

  validationMessages = {
    'itemName': {
      'required': 'Item Name is required.'
    },
    'storeName': {}
  };

  ionViewDidLoad() {
    this.getPreferredStore();
  }
  
  ionViewWillEnter(){
    this.getPreferredStore();
  }

  getPreferredStore(){
    var self =this;
    self.preferredStoresList = self.db.list(`/preferredStores/${self.authenticatedUser.uid}`);
    /* gets firebase data only once */
    
    self.preferredStoresList.$ref.once("value", function (snapshot) {
     
      self.storeList = [];
      snapshot.forEach(data => {
       
        var store = data.val().storename+' - '+data.val().address;
        if (data.val().lat) {
          self.storeList.push({
            storeName: store
          });
          // self.showToast('Item already exists in Master List', 1000);
          // self.loading.dismiss();
        }
        return false;
      });
    

      
      
      
    });

  }


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
          self.showToast('Item already exists in Master List', 3000);
          self.loading.dismiss();
        }
        return false;
      });

      if (!self.isExist) {
        self.saveToFirebase();
      }
      self.isExist = false;
    });
  }

  /* save the item to firebase
     check the store value exist or not
     if not, save store value as None */
  saveToFirebase() {
    let isSaved;
    if (this.currentShoppingItem.store) {
      isSaved = this.shoppingItemRef$.push({
        itemName: this.currentShoppingItem.itemName,
        store: this.currentShoppingItem.store,
        thumbnailImage: this.currentShoppingItem.thumbnailImage
      });
    } else {
      isSaved = this.shoppingItemRef$.push({
        itemName: this.currentShoppingItem.itemName,
        store: "None",
        thumbnailImage: this.currentShoppingItem.thumbnailImage
      });
    }
    if (isSaved) {
      this.loading.dismiss();
    }

    /* reset the shoppingItem values */
    //   this.currentShoppingItem.itemName = '';
    //   this.currentShoppingItem.store = '';
    //   console.log('this.formErrors');
    //   console.log(this.formErrors);
    //   this.formErrors = {
    //     'itemName': '',
    //     'storeName': ''
    // };
    //   console.log(this.formErrors.itemName);
    this.showToast('Item added to the Master List', 1000);
    this.navCtrl.pop();
  }

  /* show toast message dynamically */
  showToast(message, time) {
    this.toast.create({ message: message, duration: time }).present();
  }
  
  /* call barcode plugin to scan the barcode */
  scanWalmartCode() {
    this.barcodeScanner.scan().then((barcodeData) => {
      /* Success! Barcode data is here */
      this.getBarcodeProductDetails(barcodeData.text);
    }, (err) => {
      this.showToast('Item not found, please type in the item.', 1000);
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
        this.currentShoppingItem.thumbnailImage = data.items[0].thumbnailImage;
      },
      err => {  // Api response error
        this.showToast('Item not found, please type in the item.', 1000);
        console.log('err ='+ JSON.stringify(err));
      },
      () => console.log('Product Search Complete')
    );
  }

  /* open walmart api search modal */
  openWalmartSearch(){
    console.log('openWalmartSearch');
    let walmartModal = this.modalCtrl.create(WalmartSearchModalPage);
        
    walmartModal.onDidDismiss(data => {
      this.currentShoppingItem.itemName = data.itemName;
      this.currentShoppingItem.thumbnailImage = data.thumbnailImage;
    });
    
    walmartModal.present();
  }

  navigateToAddPreferredStorePage(){
    this.navCtrl.push('AddPreferredStorePage',{ storeStatus: "addStore"});
  }

}

