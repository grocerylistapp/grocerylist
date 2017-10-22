import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { ShoppingItem } from '../../models/shopping-item/shopping-item.interface';
import { User } from 'firebase/app';
import { Profile } from '../../models/profile/profile';
import { Subscription } from 'rxjs/Subscription';
import { FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';

/**
 * Generated class for the SelectBuddyModelPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-select-buddy-model',
  templateUrl: 'select-buddy-model.html',
})
export class SelectBuddyModelPage {

  userProfile: Profile;
  private authenticatedUser : User;
  storeName: string;
  itemName: string;
  itemNumber: number;
  count: number = 0;
  private inviteListRef$ : FirebaseListObservable<Notification[]>
  shoppingListRef$ : FirebaseListObservable<ShoppingItem[]>;
  shoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;
  // shoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;
  nextTripItemRef$: FirebaseListObservable<ShoppingItem[]>;

  buddyListCompleted: Array<any>;
  private isExist: boolean;
  private isExistMaster: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, private data: DataServiceProvider, private auth: AuthServiceProvider,
    private db : AngularFireDatabase, public toastCtrl: ToastController, public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SelectBuddyModelPage');
    this.shoppingListRef$ = this.navParams.get('shoppingList');
    this.storeName = this.navParams.get('storeName');
    this.isExist = false;
    this.isExistMaster = false;
    

  }

  ngOnInit(): void {
    this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
      //this.buddyList = [];
      this.inviteListRef$ = this.db.list(`/grocerybuddylist/${user.uid}`);
      this.inviteListRef$.subscribe( inviteList  => {
        console.log(inviteList);
        inviteList.forEach((invite) => {
          let profileData = this.db.object(`/profiles/${invite['$key']}`);
          //this.buddyList = [];
          
          this.buddyListCompleted  = [];
          profileData.subscribe((buddyProfile) => {
            
            if(invite['status'] == 'completed') {
              console.log(this.buddyListCompleted)
              this.buddyListCompleted.push({
                buddy: buddyProfile,
                status: invite['status']
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

  shareWithBuddy(item){
    console.log(item);
    this.shoppingListRef$.subscribe( shoppingList  => {
      
      shoppingList.forEach((list) => {
        this.itemName = list.itemName;
        this.itemNumber = list.itemNumber;
        console.log(item.$key);
        this.addShoppingItemToMasterList(item.$key,list.itemName);
        this.addShoppingItem(item.$key,list.itemName,list.itemNumber);
        

      });
      var message = this.count + ' items shared with buddy';
      this.presentToast(message);

    });
  }

  /* check whether the item name exist in masterlist, 
     if not save the value */
     addShoppingItemToMasterList(userId,itemName) {
      // this.loading = this.loadingCtrl.create({
      //   content: 'Please wait...'
      // });
      // this.loading.present();
      var self = this;
  
      self.shoppingItemRef$ = self.db.list(`/masterlist/${userId}`);
      /* gets firebase data only once */
      self.shoppingItemRef$.$ref.once("value", function (snapshot) {
        snapshot.forEach(data => {
  
          if (data.val().itemName == itemName) {
            self.isExistMaster = true;
            // self.showToast('Item already exists in Master List', 1000);
            // self.loading.dismiss();
          }
          return false;
        });
  
        if (!self.isExistMaster) {
          self.saveToFirebaseMasterItemList(itemName);
        }
        self.isExistMaster = false;
      });
    }

    /* save the item to firebase
     check the store value exist or not
     if not, save store value as None */
  saveToFirebaseMasterItemList(itemName) {
    console.log('saveToFirebaseMasterItemList');
    let isSaved;
    if (this.storeName) {
      isSaved = this.shoppingItemRef$.push({
        itemName: itemName,
        store: this.storeName
      }).key;
    } else {
      isSaved = this.shoppingItemRef$.push({
        itemName: itemName,
        store: "None"
      }).key;
    }

    if (isSaved) {
      // this.loading.dismiss();
      
    }
  }

  addShoppingItem(userId,itemName,itemNumber){
    // console.log(currentShoppingItem);
    var self = this;
    // self.loading = this.loadingCtrl.create({
    //   content: 'Please wait...'
    // });
    // self.loading.present();

    if(!self.storeName) self.storeName = "None";
    self.nextTripItemRef$ = this.db.list(`/nexttrip/${userId}/${self.storeName}`);
    
    self.nextTripItemRef$.$ref.once("value", function (snapshot) {
      snapshot.forEach(data => {
        if (data.val().itemName == itemName) {
          self.isExist = true;
          // self.loading.dismiss();
        }
        return false;
      });

      if (!self.isExist) {
        self.saveToFirebaseNextTrip(itemName,itemNumber);
      
      }else{ 
        let message = self.itemName + ' already exists';       
        self.presentToast(message);
      }
      self.isExist = false;
    });
  }
  
    /* save the item to firebase
       check the store value exist or not
       if not, save store value as None */
  saveToFirebaseNextTrip(itemName,itemNumber) {
    console.log('saveToFirebaseNextTrip');
    var self = this;
    let isSaved;
    
    if(!itemNumber) itemNumber = 0;
    isSaved = this.nextTripItemRef$.push({
      itemName: itemName,
      itemNumber: Number(itemNumber),
      // store: self.currentShoppingItem.store? self.currentShoppingItem.store : "None"
      });

    if (isSaved) {
      // this.loading.dismiss();
      this.count= this.count + 1;
      
    }
    
    // //navigate back one on the navigation stack
    //this.navCtrl.pop();
  }

  // Model page back button
  back(){
    this.viewCtrl.dismiss();
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
