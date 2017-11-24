import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';

import { ShoppingItem } from '../../models/shopping-item/shopping-item.interface';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { Profile } from '../../models/profile/profile';
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

  userProfile: Profile;
  currentShoppingItem = {} as ShoppingItem;
  shoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;
  nextTripItemRef$: FirebaseListObservable<ShoppingItem[]>;
  buddyShoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;
  buddyNextTripItemRef$: FirebaseListObservable<ShoppingItem[]>;
  storeRef$: FirebaseListObservable<Store[]>;
  preferredStoresList: FirebaseListObservable<Store[]>;
  private inviteListRef$ : FirebaseListObservable<Notification[]>
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
  private userId: string;
  private userName: string;
  private shopperName: string;
  public shopperNames: Array<any>;
  private status: string;  
  public shareList: Array<any>=[];
  public storeList: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    private auth: AuthServiceProvider, private data: DataServiceProvider, private toast: ToastController,
    public loadingCtrl: LoadingController, public formBuilder: FormBuilder, private walmartApi: WalmartApiProvider,
    private barcodeScanner: BarcodeScanner, public modalCtrl: ModalController) {
    this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
      this.userId = this.authenticatedUser.uid;
      this.shopperNames  = [{shopperName: "My Self",key: this.authenticatedUser.uid}];
    });
    //const shopppingItem : ShoppingItem = this.navParams.get('shoppingItem');
    if (this.navParams.get('shoppingItem')) {
      this.currentShoppingItem = this.navParams.get('shoppingItem');
    }
    this.isExist = false;

    this.myForm = formBuilder.group({
      itemName: ['', Validators.required],
      quantity: [''],
      storeName: [''],
      shopperName: ['']
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
    'storeName': '',
    'shopperName': ''
  };

  validationMessages = {
    'itemName': {
      'required': 'Item Name is required.'
    },
    'quantity': {},
    'storeName': {},
    'shopperName': {}
  };

  ngOnInit(): void {
    this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
      //this.buddyList = [];
      this.inviteListRef$ = this.db.list(`/grocerybuddylist/${user.uid}`);
      this.inviteListRef$.subscribe( inviteList  => {
        // console.log(inviteList);
        inviteList.forEach((invite) => {
          let profileData = this.db.object(`/profiles/${invite['$key']}`);
          //this.buddyList = [];
          
          
          profileData.subscribe((buddyProfile) => {
            
            if(invite['status'] == 'completed') {
              console.log(this.shopperNames);
              var name = buddyProfile.firstName +' '+ buddyProfile.lastName;
              console.log(name);
              this.shopperNames.push({
                shopperName: name,
                key: buddyProfile.$key
              });
            }
          });

        });
        //console.log(this.buddyList);
      });
      this.data.getProfile(user).subscribe(profile => {
        this.userProfile = <Profile>profile.val();
      });
    })
  }
  ionViewDidLoad() {
    this.getUserDetails();
    this.currentShoppingItem.thumbnailImage = "";
    
  }

  ionViewWillEnter(){
    this.getPreferredStore();
  }

  getUserDetails(){
    var usersRef = this.db.list(`/profiles`, {
      query: {
          orderByChild: 'email',
          equalTo: this.authenticatedUser.email , // How to check if participants contain username
      }
  });

  usersRef.subscribe(profileList => {
    
    this.userName = profileList[0].firstName +' '+ profileList[0].lastName;
    
  });
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

  userSelect(userId){
    
    this.userId = userId;
    if(this.userId != this.authenticatedUser.uid)
    {
      let selectUser =this.shopperNames.filter(shopper  => {
        if (shopper.key == this.userId){
          return shopper;
        }
      });
      console.log(selectUser);
      this.shareList.push({
        shopperName: selectUser[0].shopperName,
        key: selectUser[0].key
      });
      console.log(this.shareList);
    }
  }

  checkUserSelection(){
    if(this.userId == this.authenticatedUser.uid){
      this.status = "self";
      this.addShoppingItemToUserMasterList();
    }
    else{
      this.status = "shareOut";
      this.addShoppingItemToUserMasterList();
      this.addShoppingItemToBuddyMasterList();
    }
  }

  /* check whether the item name exist in masterlist, 
     if not save the value */
     addShoppingItemToUserMasterList() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
    var self = this;
    var key
    self.shoppingItemRef$ = self.db.list(`/masterlist/${self.authenticatedUser.uid}`);
    /* gets firebase data only once */
    self.shoppingItemRef$.$ref.once("value", function (snapshot) {
      snapshot.forEach(data => {

        if (data.val().itemName == self.currentShoppingItem.itemName) {
          self.isExist = true;
          key = data.key
          self.showToast('Item already exists in Master List', 1000);
          self.loading.dismiss();
        }
        return false;
      });

      if (!self.isExist) {
        self.saveToFirebaseUserMasterItemList();
      }
      else{

       if(self.userId != self.authenticatedUser.uid){
        self.saveToFirebaseUserNextTripList(key)
      }
    }
      self.isExist = false;
    });
  }

  /* save the item to firebase
     check the store value exist or not
     if not, save store value as None */
     saveToFirebaseUserMasterItemList() {
    console.log('saveToFirebaseMasterItemList');
    let isSaved;
    if (this.storeName) {
      isSaved = this.shoppingItemRef$.push({
        itemName: this.currentShoppingItem.itemName,
        thumbnailImage: this.currentShoppingItem.thumbnailImage,
        store: this.storeName
      }).key;
    } else {
      isSaved = this.shoppingItemRef$.push({
        itemName: this.currentShoppingItem.itemName,
        thumbnailImage: this.currentShoppingItem.thumbnailImage,
        store: "None"
      }).key;
    }

    if (isSaved) {
      // this.loading.dismiss();
      this.saveToFirebaseUserNextTripList(isSaved);
    }
  }

  /* save the item to firebase
     check the store value exist or not
     if not, save store value as None */
     saveToFirebaseUserNextTripList(key) {
    var self = this;
    var key
    if (!this.storeName) this.storeName = "None";

    this.nextTripItemRef$ = this.db.list(`/nexttrip/${this.authenticatedUser.uid}/${this.storeName}`);
    
    self.nextTripItemRef$.$ref.once("value", function (snapshot) {
      snapshot.forEach(data => {
        if (data.val().itemName == self.currentShoppingItem.itemName) {
          self.isExist = true;
          // self.loading.dismiss();
          key = data.key
        }
        return false;
      });

      if (!self.isExist) {
        self.saveFirebaseUserNextTrip();
      }else{
        if(self.userId == self.authenticatedUser.uid){
        
        self.showToast('Item already exists in My Next Trip', 1000);
        }else{
          // self.db.object(`/nexttrip/${self.authenticatedUser.uid}/${self.storeName}/` + key)
          // .update({ status: "shareOut", sharedArray:  self.shareList});
        }
      }
      self.isExist = false;
    });
  }

  saveFirebaseUserNextTrip(){
    if (!this.quantity) this.quantity = 1;
    let isSaved;
    isSaved = this.nextTripItemRef$.push({
      itemName: this.currentShoppingItem.itemName,
      thumbnailImage: this.currentShoppingItem.thumbnailImage,
      itemNumber: Number(this.quantity),
      pickedQuantity : Number(0),
      status: this.status,
      sharedArray: this.shareList
      // store: this.storeName? this.storeName : "None"
    }).key;

    if (isSaved) {
      this.loading.dismiss();
      if(this.userId == this.authenticatedUser.uid){
      this.showToast('Item added to the My Next Trip', 1000);
      this.navCtrl.pop();
      }
      
    }
  }

  /* check whether the item name exist in masterlist, 
     if not save the value */
     addShoppingItemToBuddyMasterList() {
      // this.loading = this.loadingCtrl.create({
      //   content: 'Please wait...'
      // });
      // this.loading.present();
      var self = this;
      let key;
      self.buddyShoppingItemRef$ = self.db.list(`/masterlist/${self.userId}`);
      /* gets firebase data only once */
      self.buddyShoppingItemRef$.$ref.once("value", function (snapshot) {
        snapshot.forEach(data => {
  
          if (data.val().itemName == self.currentShoppingItem.itemName) {
            self.isExist = true;
            key = data.key
            self.showToast('Item already exists in buddy Master List', 1000);
            // self.loading.dismiss();
          }
          return false;
        });
  
        if (!self.isExist) {
          self.saveToFirebaseBuddyMasterItemList();
        }
        else{
          self.saveToFirebaseBuddyNextTripList(key);
        }
        self.isExist = false;
      });
    }
  
    /* save the item to firebase
       check the store value exist or not
       if not, save store value as None */
    saveToFirebaseBuddyMasterItemList() {
      console.log('saveToFirebaseMasterItemList');
      let isSaved;
      if (this.storeName) {
        isSaved = this.buddyShoppingItemRef$.push({
          itemName: this.currentShoppingItem.itemName,
          store: this.storeName,
          thumbnailImage: this.currentShoppingItem.thumbnailImage,
        }).key;
      } else {
        isSaved = this.buddyShoppingItemRef$.push({
          itemName: this.currentShoppingItem.itemName,
          store: "None",
          thumbnailImage: this.currentShoppingItem.thumbnailImage,
        }).key;
      }
  
      if (isSaved) {
        // this.loading.dismiss();
        this.saveToFirebaseBuddyNextTripList(isSaved);
      }
    }
  
    /* save the item to firebase
       check the store value exist or not
       if not, save store value as None */
    saveToFirebaseBuddyNextTripList(key) {
  
      if (!this.storeName) this.storeName = "None";
      
      let isSaved;
      this.buddyNextTripItemRef$ = this.db.list(`/nexttrip/${this.userId}/${this.storeName}`);
      if (!this.currentShoppingItem.itemNumber) this.currentShoppingItem.itemNumber = 0;
      isSaved = this.buddyNextTripItemRef$.push({
        itemName: this.currentShoppingItem.itemName,
        thumbnailImage: this.currentShoppingItem.thumbnailImage,
        itemNumber: Number(this.quantity),
        pickedQuantity : Number(0),
        status: "shareIn",
        sharedArray: [{shopperName: this.userName,key: this.authenticatedUser.uid}]
        // store: currentShoppingItem.store? currentShoppingItem.store : "None"
      }).key;
  
      if (isSaved) {
        // this.loading.dismiss();
        this.showToast('Item added to Buddy Next Trip', 1000);
        this.navCtrl.pop();
      }
    }
  
  /* call barcode plugin to scan the barcode */
  scanWalmartCode() {
    this.barcodeScanner.scan().then((barcodeData) => {
      /* Success! Barcode data is here */
      this.getBarcodeProductDetails(barcodeData.text);
    }, (err) => {
      if(err !== "cordova_not_available"){
        this.showToast('Item not found, please type in the item.', 1000);
      }
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
      this.currentShoppingItem.itemName = data.itemName;
      this.currentShoppingItem.thumbnailImage = data.thumbnailImage;
    });
    
    walmartModal.present();
  }
  
  navigateToAddPreferredStorePage(){
    this.navCtrl.push('AddPreferredStorePage',{ storeStatus: "addStore"});
  }

}
