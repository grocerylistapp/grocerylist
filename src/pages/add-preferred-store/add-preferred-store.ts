import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
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
  private authenticatedUser$ : Subscription;
  private selectedStore: any;
  private isAddstore: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public geolocation: Geolocation,
    private network: Network, private db: AngularFireDatabase, public alertCtrl: AlertController,
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
    this.loadGoogleMaps();
    this.checkBuddyStatus();
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

    // this.loadGoogleMaps();
  }


  loadGoogleMaps(){

    this.addConnectivityListeners();

    if(typeof google == "undefined" || typeof google.maps == "undefined"){

      console.log("Google maps JavaScript needs to be loaded.");
      this.disableMap();

      //  if(this.online || this.network.type !== Connection.NONE){
          console.log("online, loading map");

          //Load the SDK
          window['mapInit'] = () => {
        this.initMap();
        this.enableMap();
          }

          let script = document.createElement("script");
          script.id = "googleMaps";

          if(this.apiKey){
        script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit&libraries=places';
          } else {
        script.src = 'http://maps.google.com/maps/api/js?callback=mapInit&libraries=places';       
          }

          document.body.appendChild(script);  

      //  } 
    }
    else {
      
      //  if(this.online || this.network.type !== Connection.NONE){
        console.log("showing map");
        this.initMap();
        this.enableMap();
      //  }
      //  else {
        console.log("disabling map");
        this.disableMap();
      //  }

    }

  }

  addMarker(){
    
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });
  }

  initMap(){

    this.mapInitialised = true;
  
    let options = {
      enableHighAccuracy: true
    };
    
    this.geolocation.getCurrentPosition(options).then((position: Geoposition) => {
        let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
    
        //this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
        this.getStores(latLng).then((results : Array<any>)=>{
          this.places = results;
          for(let i = 0 ;i < results.length ; i++)
          {
              this.createMarker(results[i]);
          }
      },(status)=>console.log(status));

      this.addMarker();
    }).catch((err) => {
        console.log('Error getting location'+ err.message);
        let alert = this.alertCtrl.create({
          message: err.message,
          buttons: [
            {
              text: "Ok",
              role: 'cancel',
              handler: () => {
                
              }
            }
          ]
        });
        alert.present();
        this.map = new google.maps.Map(document.getElementById('map'), {
          center: new google.maps.LatLng(0, 0),//{lat: -34.397, lng: 150.644},
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        
    });
  
  }

  disableMap(){
    console.log("disable map");
  }

  enableMap(){
    console.log("enable map");
    this.acService = new google.maps.places.AutocompleteService();
  }

  getStores(latLng) {
    if(this.map !== undefined){
       var service = new google.maps.places.PlacesService(this.map);
    }
     else{
        var service = new google.maps.places.PlacesService(document.createElement('div'));
     }
    let request = {
        location : latLng,
        radius : 2000 ,//in metres
        types: ["store"]//home_goods_store, shopping_mall, convenience_store
    };
    return new Promise((resolve,reject)=>{
        service.nearbySearch(request,function(results,status){
            if(status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(results);    
            }
            else {
                reject(status);
            }

        }); 
    });

  }

  addConnectivityListeners(){

    let onOnline = () => {

        setTimeout(() => {
      if(typeof google == "undefined" || typeof google.maps == "undefined"){
          this.loadGoogleMaps();
      } else {
          if(!this.mapInitialised){
            this.initMap();
          }
          this.enableMap();
      }
        }, 2000);

    };

    let onOffline = () => {
      this.disableMap();
    };

    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);
  }

  createMarker(place) {
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: place.geometry.location
      }); 
      
      let content = "<p>"+place.name+"</p>";          
      let infoWindow = new google.maps.InfoWindow({
        content: content
      });

      google.maps.event.addListener(marker, 'click', () => {
        infoWindow.open(this.map, marker);
        this.addItemToPreferredStorelist(place);
      });  
  } 

  updateSearch() {
    console.log('modal > updateSearch');
    if (this.autocomplete.query == '') {
      this.autocompleteItems = [];
      return;
    }
    let self = this; 
    let config = { 
      types:  ['establishment'], // other types: 'geocode', 'regions', and 'cities'
      input: self.autocomplete.query, 
      componentRestrictions: {  country: ['US', 'IN'] } 
    }
  
    var geocoder = new google.maps.Geocoder();

    self.acService.getPlacePredictions(config, function (predictions, status) {
      console.log('modal > getPlacePredictions > status > ', status);
      if(status == 'ZERO_RESULTS'){

          geocoder.geocode({address: self.autocomplete.query}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              //alert("got adrress loc");//searchLocationsNear(results[0].geometry.location);
            } else {
              this.presentToast(self.autocomplete.query + ' not found');
            }
          });
      }
      else{
        self.autocompleteItems = [];            
        predictions.forEach(function (prediction) {              
          self.autocompleteItems.push(prediction);
        });
      }
      
    });
  }

  chooseItem(item) {
    this.autocomplete.query = item.description;
    this.selectedStore = item;
    this.autocompleteItems = [];
    this.isStoreselected = true;
  }

  addToPreferredStore(){
    this.addItemToPreferredStorelist(this.selectedStore);
  }

  
  addItemToPreferredStorelist(item) {
    
     if(item.place_id && item.place_id !== ""){
       if(this.map === undefined){
         var service = new google.maps.places.PlacesService(this.map);
       }else{
         var service = new google.maps.places.PlacesService(document.createElement('div'));
       }
       var self = this;
       service.getDetails({
             placeId: item.place_id
           }, function(place, status) {
             if (status === google.maps.places.PlacesServiceStatus.OK) {
              
            
              self.preferredStoresList = self.db.list(`/preferredStores/${self.userId}`);
                  /* gets firebase data only once */
                  
            
                  self.preferredStoresList.$ref.once("value", function (snapshot) {
                    snapshot.forEach(data => {
                    
                      if (data.val().lat === place.geometry.location.lat() && data.val().long === place.geometry.location.lng()) {
                        self.isStorexists = true;
                        // self.showToast('Item already exists in Master List', 1000);
                        // self.loading.dismiss();
                      }
                      return false;
                    });
              
                    if (!self.isStorexists) {
                      let isSaved;
                      isSaved = self.preferredStoresList.push({
                                 storename: item.structured_formatting.main_text,
                                 address: item.structured_formatting.secondary_text,
                                 lat: place.geometry.location.lat(),
                                 long: place.geometry.location.lng()
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
                    self.checkBuddyStatus();
                    
                  });
               
             }
           });
       
     }
     
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
