import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { GoogleApiProvider } from '../../providers/google-api/google-api';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '../../models/store/store';

/**
 * Generated class for the AddPreferredStorePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

declare var google;
declare var Connection;

@IonicPage()
@Component({
  selector: 'page-add-preferred-store',
  templateUrl: 'add-preferred-store.html',
})
export class AddPreferredStorePage {

  @ViewChild('map') mapElement: ElementRef;

  searchAddress: string = "";
  map: any;
  mapInitialised: boolean = false;
  apiKey: any;
  online: boolean;
  public  isStorexists: boolean;
  public  isStoreselected: boolean;
  places: Array<any>; 
  autocompleteItems: any;
  autocomplete: any;
  acService:any;
  preferredStoresList: FirebaseListObservable<Store[]>;
  private authenticatedUser : User;
  private userId: string;
  private storeStatus: string;
  private message: string;
  private latitude: any;
  private longitude: any;
  private authenticatedUser$ : Subscription;
  private selectedStore: any;
  private isAddstore: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public geolocation: Geolocation,
    private network: Network, private db: AngularFireDatabase, public alertCtrl: AlertController, private googleApi: GoogleApiProvider,
    private auth: AuthServiceProvider, private data: DataServiceProvider, private toastCtrl: ToastController) {

      this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
        this.authenticatedUser = user;
        this.userId = this.authenticatedUser.uid;
        this.preferredStoresList = this.db.list(`/preferredStores/${this.authenticatedUser.uid}`);
        
        });
      this.network.onConnect().subscribe(res=>{
        this.online=true;
        return this.online;
      });

      this.network.onDisconnect().subscribe(res=>{
        this.online=false;
        return this.online;
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddPreferredStorePage');
    this.storeStatus = this.navParams.get('storeStatus');
    this.isStoreselected = false;
    this.checkBuddyStatus();
    this.getGeolocation();
  }

  checkBuddyStatus(){
    if(this.storeStatus == "addStore"){
      this.isAddstore = true;
    }else{
      // this.navCtrl.setRoot('TabsHomePage');
      // this.presentToast('Welcome In!');
      this.isAddstore = false;
    }
  }

  ngOnInit() {
    
    this.autocompleteItems = [];
    this.autocomplete = {
    query: ''
    };   

  }

  getGeolocation(){
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      var locationName = "My Location";
      this.loadMap(this.latitude,this.longitude,locationName);
     }).catch((error) => {
       console.log('Error getting location', error);
       this.presentToast('Filed to locate you! Please enable gps.');
     });

     this.autocomplete.query = "";
     this.isStoreselected = false;
  }

  

  loadMap(lat,long,locationName) {
    
       let latLng = new google.maps.LatLng(lat,long);
       
          let mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          }
       
          this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
       
        this.addMarker(locationName);
      }
   
      addMarker(locationName){
       
        let marker = new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          position: this.map.getCenter()
        });
       
        let content = "<h4>"+locationName+"</h4>";         
       
        this.addInfoWindow(marker, content);
       
      }
   
      addInfoWindow(marker, content){
       
        let infoWindow = new google.maps.InfoWindow({
          content: content
        });
       
        google.maps.event.addListener(marker, 'click', () => {
          infoWindow.open(this.map, marker);
        });
       
      }

  updateSearch(){
    console.log(this.autocomplete.query);
    this.isStoreselected = false;
    // console.log(this.autocomplete.query);
    if (this.autocomplete.query.length > 1) {
      var temp = this.autocomplete.query.split(' ').join('+');

      /* Call Api to get place details */
      this.googleApi.getPlaceSearchDetailsByLocation(temp,this.latitude,this.longitude).subscribe(
        data => {
          /* Set Api response values */
         console.log(data);
         this.autocompleteItems = data.results;
        },
        err => {
          /* Set Api response error */
          console.log(err);
        },
        () => console.log('Place Search Complete')
      );
    }
  }

  chooseItem(item) {
    this.autocomplete.query = item.name+' - '+item.formatted_address;
    this.selectedStore = item;
    this.autocompleteItems = [];
    this.isStoreselected = true;
    this.loadMap(item.geometry.location.lat,item.geometry.location.lng,item.name);
  }

  addToPreferredStore(){
    this.addItemToPreferredStorelist(this.selectedStore);
  }

  addItemToPreferredStorelist(item){
    var self = this;
    self.preferredStoresList = self.db.list(`/preferredStores/${self.userId}`);
    /* gets firebase data only once */
    

    self.preferredStoresList.$ref.once("value", function (snapshot) {
      snapshot.forEach(data => {
      
        if (data.val().lat === item.geometry.location.lat && data.val().long === item.geometry.location.lng) {
          self.isStorexists = true;
          // self.showToast('Item already exists in Master List', 1000);
          // self.loading.dismiss();
        }
        return false;
      });

      if (!self.isStorexists) {
        let isSaved;
        // let invalidChar = ['.', '#', '$', '[', ']'];
        isSaved = self.preferredStoresList.push({
                   storename: item.name.split('.').join(' '),
                   address: item.formatted_address.split('.').join(' '),
                   lat: item.geometry.location.lat,
                   long: item.geometry.location.lng
                 }).key;

                 if (isSaved) {
                  self.presentToast("Store saved");
                  
                }
      }
      else{
        self.presentToast("Store already exist");
      }
      self.isStorexists = false;
      self.autocompleteItems = [];
      self.dismiss();
      self.getGeolocation();
      
    });
  }

  dismiss() {
     this.autocomplete.query = "";
     this.isStoreselected = false;
  }
   
  skipContent(){
    if(this.storeStatus == "addStore"){
        this.navCtrl.pop();
      }else{
        this.navCtrl.setRoot('TabsHomePage');
        this.presentToast('Welcome In!');
      }
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
