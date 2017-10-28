import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';

import {ShoppingItem} from '../../models/shopping-item/shopping-item.interface';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Profile } from '../../models/profile/profile';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '../../models/store/store';
/**
 * Generated class for the AddToMyNextTripPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-to-my-next-trip',
  templateUrl: 'add-to-my-next-trip.html',
})
export class AddToMyNextTripPage {

  userProfile: Profile;
  currentShoppingItem = {} as ShoppingItem;
  shoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;
  masterListItemRef$: FirebaseListObservable<ShoppingItem[]>;
  storeRef$: FirebaseListObservable<Store[]>;
  private inviteListRef$ : FirebaseListObservable<Notification[]>
  
  private authenticatedUser : User;
  private authenticatedUser$ : Subscription;
  private userId: string;
  private userName: string;
  private isExist: boolean;  
  private shopperName: string = "My Self";
  public shopperNames: Array<any>;
  private status: string; 
  public shareList: Array<any>=[];
  

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
    private auth: AuthServiceProvider, private data: DataServiceProvider, public toastCtrl: ToastController) {
      this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
        this.authenticatedUser = user;
        this.userId = this.authenticatedUser.uid;
        this.shopperNames  = [{shopperName: "My Self",key: this.authenticatedUser.uid}];
        });
      //const shopppingItem : ShoppingItem = this.navParams.get('shoppingItem');
      if(this.navParams.get('shoppingItem')){
        this.currentShoppingItem = this.navParams.get('shoppingItem');
      }
      this.isExist = false;
      
    }

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
                var name = buddyProfile.firstName +' '+ buddyProfile.lastName;
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

  addShoppingItem(){
    
    if(this.userId != this.authenticatedUser.uid){
      
      this.status = "shareOut";
      this.addShoppingItemToMasterList()
      this.navCtrl.pop();
      
    }
    else{
      this.status = "self";
      this.addToUserNextTrip();
      this.navCtrl.pop();
      
    }
    
    
  }

  /* check whether the item name exist in masterlist, 
     if not save the value */
     addShoppingItemToMasterList() {
      // this.loading = this.loadingCtrl.create({
      //   content: 'Please wait...'
      // });
      // this.loading.present();
    
      var self = this;
      let key;
      self.masterListItemRef$ = self.db.list(`/masterlist/${self.userId}`);
      /* gets firebase data only once */
      self.masterListItemRef$.$ref.once("value", function (snapshot) {
        snapshot.forEach(data => {
         
          if (data.val().itemName == self.currentShoppingItem.itemName) {
            self.isExist = true;
            
            
            key = data.key
           
            // self.showToast('Item already exists in Master List', 1000);
            // self.loading.dismiss();
          }
          return false;
        });
  
        if (!self.isExist) {
          self.saveToFirebaseMasterItemList();
        }
        else{
         
          self.addToBuddyNextTrip(key);
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
        isSaved = this.masterListItemRef$.push({
          itemName: this.currentShoppingItem.itemName,
          store: this.currentShoppingItem.store
        }).key;
      } else {
        isSaved = this.masterListItemRef$.push({
          itemName: this.currentShoppingItem.itemName,
          store: "None"
        }).key;
      }
  
      if (isSaved) {
        // this.loading.dismiss();
        console.log(isSaved);
        this.addToBuddyNextTrip(isSaved);
      }
    }

    addToBuddyNextTrip(key) {
      
          if (!this.currentShoppingItem.store) this.currentShoppingItem.store = "None";
      
          let isSaved;
          this.shoppingItemRef$ = this.db.list(`/nexttrip/${this.userId}/${this.currentShoppingItem.store}`);
          if (!this.currentShoppingItem.itemNumber) this.currentShoppingItem.itemNumber = 0;
          isSaved = this.shoppingItemRef$.push({
            itemName: this.currentShoppingItem.itemName,
            itemNumber: Number(this.currentShoppingItem.itemNumber),
            status: "shareIn",
            sharedArray: [{shopperName: this.userName, key: this.authenticatedUser.uid}]
            // store: currentShoppingItem.store? currentShoppingItem.store : "None"
          }).key;
      
          if (isSaved) {
            // this.loading.dismiss();
            this.addToUserNextTrip();
            this.presentToast('Item added to Buddy Next Trip');
            
          }
        }

    addToUserNextTrip(){
      //console.log(currentShoppingItem);
    if(!this.currentShoppingItem.store) this.currentShoppingItem.store = "None";
    this.shoppingItemRef$ = this.db.list(`/nexttrip/${this.authenticatedUser.uid}/${this.currentShoppingItem.store}`);
    if(!this.currentShoppingItem.itemNumber) this.currentShoppingItem.itemNumber = 0;
    this.shoppingItemRef$.push({
      itemName: this.currentShoppingItem.itemName,
      itemNumber: Number(this.currentShoppingItem.itemNumber),
      status: this.status,
      sharedArray: this.shareList
      // store: currentShoppingItem.store? currentShoppingItem.store : "None"
    });

    
    //reset global shopping item
    this.currentShoppingItem = {} as ShoppingItem;
    this.presentToast('Item added');
    //navigate back one on the navigation stack
    
    }

  
  ionViewDidLoad() {
    this.getUserDetails();
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
 
  }

   // Configure Toast
   public presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000
      // position: 'top'
    });
    toast.present();
  }


}
