import { Component, OnInit  } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { ShoppingItem } from '../../models/shopping-item/shopping-item.interface';
import { User } from 'firebase/app';
import { Profile } from '../../models/profile/profile';
import { Subscription } from 'rxjs/Subscription';
import { FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';

/**
 * Generated class for the MoveToBuddyPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-move-to-buddy',
  templateUrl: 'move-to-buddy.html',
})
export class MoveToBuddyPage {

  
  storeName: string;
  userProfile: Profile;
  masterListItemRef$: FirebaseListObservable<ShoppingItem[]>;
  nextTripItemRef$: FirebaseListObservable<ShoppingItem[]>;
  
  private inviteListRef$ : FirebaseListObservable<Notification[]>
  private shoppingItemRef$ : FirebaseObjectObservable<ShoppingItem>;

  private authenticatedUser : User;
  private userId: string;
  private userName: string;
  private isExist: boolean;
  private isSelect: boolean; 
   shoppingItem = {} as ShoppingItem;
   public shopperNames: Array<any>=[];
   private status: string; 
  

  constructor(public navCtrl: NavController, public navParams: NavParams, private data: DataServiceProvider, private auth: AuthServiceProvider,
    private db : AngularFireDatabase, public toastCtrl: ToastController) {
        const shoppingItemId = this.navParams.get('shoppingItemId');
    const storeName = this.navParams.get('storeName');
    const userid = this.navParams.get('userid');
    const rootNode = this.navParams.get('rootNode');
    if(storeName){
    this.shoppingItemRef$ = this.db.object(`${rootNode}/${userid}/${storeName}/${shoppingItemId}`);
    }else{
      this.shoppingItemRef$ = this.db.object(`${rootNode}/${userid}/${shoppingItemId}`);
    }
    console.log(`In EditShopping page, shoppingitemid is ${rootNode}/${userid}/${storeName}/${shoppingItemId}`);

    this.shoppingItemRef$.subscribe(
      shoppingItem  => this.shoppingItem = shoppingItem);
      this.storeName = storeName;
      
  }
     
  

  ionViewDidLoad() {
    console.log('ionViewDidLoad MoveToBuddyPage');
    this.isSelect = false;
    
  }

  ngOnInit(): void {
    this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
      this.getUserDetails();
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

  userSelect(userId){
    this.userId = userId;
    this.isSelect = true;
    
  }

  /* check whether the item name exist in masterlist, 
     if not save the value */
     addShoppingItemToMasterList() {
      // this.loading = this.loadingCtrl.create({
      //   content: 'Please wait...'
      // });
      // this.loading.present();
      if(this.isSelect==true){
      var self = this;
      let key;
      self.masterListItemRef$ = self.db.list(`/masterlist/${self.userId}`);
      /* gets firebase data only once */
      self.masterListItemRef$.$ref.once("value", function (snapshot) {
        snapshot.forEach(data => {
         
          if (data.val().itemName == self.shoppingItem.itemName) {
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
    }else{
      this.presentToast('Please select buddy');
    }
    }
  
    /* save the item to firebase
       check the store value exist or not
       if not, save store value as None */
    saveToFirebaseMasterItemList() {
      console.log('saveToFirebaseMasterItemList');
      let isSaved;
      if (this.storeName) {
        isSaved = this.masterListItemRef$.push({
          itemName: this.shoppingItem.itemName,
          store: this.storeName
        }).key;
      } else {
        isSaved = this.masterListItemRef$.push({
          itemName: this.shoppingItem.itemName,
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

      var self = this;
      
          if (!self.storeName) self.storeName = "None";
      
          
          self.nextTripItemRef$ = this.db.list(`/nexttrip/${self.userId}/${self.storeName}`);

          self.nextTripItemRef$.$ref.once("value", function (snapshot) {
            snapshot.forEach(data => {
              if (data.val().itemName == self.shoppingItem.itemName && data.val().sharedArray[0].key == self.authenticatedUser.uid) {
                self.isExist = true;
                // self.loading.dismiss();
              }
              return false;
            });
      
            
      
            if (!self.isExist) {
              self.saveToFirebaseNextTrip(key);
            
            }else{ 
              let message = self.shoppingItem.itemName + ' cannot be shared back';       
              self.presentToast(message);
            }
            self.isExist = false;
          });

         
        }

        saveToFirebaseNextTrip(key){

          let isSaved;
          isSaved = this.nextTripItemRef$.push({
            itemName: this.shoppingItem.itemName,
            itemNumber: Number(this.shoppingItem.itemNumber),
            status: "shareIn",
            sharedArray: [{shopperName: this.userName, key: this.authenticatedUser.uid}]
            // store: currentShoppingItem.store? currentShoppingItem.store : "None"
          }).key;
      
          if (isSaved) {
            // this.loading.dismiss();
            this.deleteFromUserList();
            this.presentToast('Item moved to Buddy Next Trip');
            
          }
        }

    deleteFromUserList(){
      this.db.object(`/nexttrip/${this.authenticatedUser.uid}/${this.storeName}/` + this.shoppingItem.$key).remove();
      this.navCtrl.pop();
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
