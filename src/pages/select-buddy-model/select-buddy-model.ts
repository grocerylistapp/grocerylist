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
  // count: number = 0;
  private inviteListRef$ : FirebaseListObservable<Notification[]>
  shoppingListRef$ : FirebaseListObservable<ShoppingItem[]>;
  shoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;
  // shoppingItemRef$: FirebaseListObservable<ShoppingItem[]>;
  nextTripItemRef$: FirebaseListObservable<ShoppingItem[]>;

  buddyListCompleted: Array<any>;
  private isAvailable: boolean;
  private isExist: boolean;
  private isExistMaster: boolean;
  private modelMessage: string;
  private userName: string;
  private buddyName: string;
  private buddyId: string;
  private shoppingList: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private data: DataServiceProvider, private auth: AuthServiceProvider,
    private db : AngularFireDatabase, public toastCtrl: ToastController, public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SelectBuddyModelPage');
    this.shoppingListRef$ = this.navParams.get('shoppingList');
    this.shoppingList = this.navParams.get('shoppingList');
    this.storeName = this.navParams.get('storeName');
    this.isAvailable = false;
    this.isExist = false;
    this.isExistMaster = false;
    this.modelMessage = "Please wait ...";

  }

  ngOnInit(): void {
    this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
      this.getUserDetails();
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
              
              this.buddyListCompleted.push({
                buddy: buddyProfile,
                status: invite['status']
              });
            }
            console.log("this.buddyListCompleted");
            console.log(this.buddyListCompleted.length);
            if(this.buddyListCompleted.length==0){
                  this.isAvailable = false;
                  this.modelMessage = "No buddies exist that this list can be shared with";
            }else{
              this.isAvailable = true;
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

 

  shareWithBuddy(item){
    
    this.buddyName = item.firstName +' '+item.lastName;
    this.buddyId = item.$key;
    this.shoppingListRef$.subscribe( shoppingList  => {
      
      shoppingList.forEach((list) => {
        this.itemName = list.itemName;
        this.itemNumber = list.itemNumber;
      
        this.addShoppingItemToMasterList(item.$key,list.itemName);
        this.addShoppingItem(item.$key,list.itemName,list.itemNumber,list.$key);
        // this.updateUserNextTrip(list.$key,item.$key);

      });
      

    });
    var message = this.storeName + ' list shared with buddy';
    this.presentToast(message);
    this.back();
  
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

  addShoppingItem(userId,itemName,itemNumber,itemKey){
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
        if (data.val().itemName == itemName && data.val().sharedArray[0].key == self.authenticatedUser.uid) {
          self.isExist = true;
          // self.loading.dismiss();
        }
        return false;
      });

      

      if (!self.isExist) {
        self.saveToFirebaseNextTrip(itemName,itemNumber,itemKey);
      
      }else{ 
        // let message = self.itemName + ' cannot be shared back';       
        // self.presentToast(message);
      }
      self.isExist = false;
    });
  }
  
    /* save the item to firebase
       check the store value exist or not
       if not, save store value as None */
  saveToFirebaseNextTrip(itemName,itemNumber,itemKey) {
    console.log('saveToFirebaseNextTrip');
    var self = this;
    let isSaved;
    
    if(!itemNumber) itemNumber = 0;
    isSaved = this.nextTripItemRef$.push({
      itemName: itemName,
      itemNumber: Number(itemNumber),
      status: "shareIn",
      sharedArray: [{shopperName: this.userName,key: this.authenticatedUser.uid}]
      // store: self.currentShoppingItem.store? self.currentShoppingItem.store : "None"
      });

    if (isSaved) {
      // this.loading.dismiss();
      // this.count= this.count + 1;
      this.updateUserNextTrip(itemKey);
      
      
    }
    
    // //navigate back one on the navigation stack
    //this.navCtrl.pop();
  }

  updateUserNextTrip(key){

    this.db.object(`/nexttrip/${this.authenticatedUser.uid}/${this.storeName}/` + key)
    .update({ status: "shareOut", sharedArray: [{shopperName: this.buddyName,key: this.buddyId}] });
    
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
