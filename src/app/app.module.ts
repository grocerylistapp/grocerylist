import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { NativeStorage } from '@ionic-native/native-storage';
import { HttpModule } from '@angular/http';
import { Geofence } from '@ionic-native/geofence';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { SocialSharing } from '@ionic-native/social-sharing';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

// Import the AF2 Module
import { FIREBASE_CREDENTIALS } from './firebase.credentials';
import { AngularFireModule } from 'angularfire2';
import{ AngularFireDatabaseModule} from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireAuthModule } from 'angularfire2/auth';

//app pages
import {ComponentsModule} from '../components/components.module';
import { xoomCart } from './app.component';
import { AddBuddyPageModule } from '../pages/add-buddy/add-buddy.module';
import { AddItemToMasterListPageModule } from '../pages/add-item-to-master-list/add-item-to-master-list.module';
import { AddPreferredStorePageModule } from '../pages/add-preferred-store/add-preferred-store.module';
import { AddShoppingPageModule } from '../pages/add-shopping/add-shopping.module';
import { AddToMyNextTripPageModule } from '../pages/add-to-my-next-trip/add-to-my-next-trip.module';
import { AddToMyNextTripAndMasterFromMntPageModule } from '../pages/add-to-my-next-trip-and-master-from-mnt/add-to-my-next-trip-and-master-from-mnt.module';
import { EditProfilePageModule } from '../pages/edit-profile/edit-profile.module';
import { EditShoppingItemPageModule } from '../pages/edit-shopping-item/edit-shopping-item.module';
import { ItemRangeModalPageModule} from '../pages/item-range-modal/item-range-modal.module';
import { ListOfListsPageModule } from '../pages/list-of-lists/list-of-lists.module';
import { LoginPageModule } from '../pages/login/login.module';
import { MasterListPageModule } from '../pages/master-list/master-list.module';
import { MoveToBuddyPageModule } from '../pages/move-to-buddy/move-to-buddy.module';
import { MyNextTripPageModule } from '../pages/my-next-trip/my-next-trip.module';
import { MyNextTripShoppingListForStorePageModule } from '../pages/my-next-trip-shopping-list-for-store/my-next-trip-shopping-list-for-store.module';
import { MyPreviousTripPageModule } from '../pages/my-previous-trip/my-previous-trip.module';
import { MyPreviousTripItemListPageModule } from '../pages/my-previous-trip-item-list/my-previous-trip-item-list.module';
import { PreferredStoreListPageModule } from '../pages/preferred-store-list/preferred-store-list.module';
import { RegisterPageModule } from '../pages/register/register.module';
import { SelectBuddyModelPageModule } from '../pages/select-buddy-model/select-buddy-model.module';
import { ShoppingItemListPageModule } from '../pages/shopping-item-list/shopping-item-list.module';
import { ShoppingListPageModule } from '../pages/shopping-list/shopping-list.module';
import { ShoppingModePageModule } from '../pages/shopping-mode/shopping-mode.module';
import { TabsHomePageModule } from '../pages/tabs-home/tabs-home.module';
import { UserProfilePageModule } from '../pages/user-profile/user-profile.module';
import { WalmartSearchModalPageModule} from '../pages/walmart-search-modal/walmart-search-modal.module';

//service
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { DataServiceProvider } from '../providers/data-service/data-service';
import { WalmartApiProvider } from '../providers/walmart-api/walmart-api';
import { GoogleApiProvider } from '../providers/google-api/google-api';


@NgModule({
  declarations: [
    xoomCart
  ],
  imports: [
    BrowserModule,
    ComponentsModule,
    IonicModule.forRoot(xoomCart),
    //initialize angularfire with credentials 
    AngularFireModule.initializeApp(FIREBASE_CREDENTIALS),
    AngularFireDatabaseModule,
    AngularFireAuthModule,    
    HttpModule,
    AddBuddyPageModule,
    AddItemToMasterListPageModule,
    AddPreferredStorePageModule,
    AddShoppingPageModule,
    AddToMyNextTripPageModule,
    AddToMyNextTripAndMasterFromMntPageModule,
    EditProfilePageModule,
    EditShoppingItemPageModule,
    ItemRangeModalPageModule,
    ListOfListsPageModule,
    LoginPageModule,
    MasterListPageModule,
    MoveToBuddyPageModule,
    MyNextTripPageModule,
    MyNextTripShoppingListForStorePageModule,
    MyPreviousTripPageModule,
    MyPreviousTripItemListPageModule,
    PreferredStoreListPageModule,
    RegisterPageModule,
    SelectBuddyModelPageModule,
    ShoppingItemListPageModule,
    ShoppingListPageModule,
    ShoppingModePageModule,
    TabsHomePageModule,
    UserProfilePageModule,
    WalmartSearchModalPageModule
  ],
  bootstrap: [IonicApp],
  
  entryComponents: [
    xoomCart
],
  providers: [
    StatusBar,
    SplashScreen,
    AngularFireAuth,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthServiceProvider,
    DataServiceProvider,
    WalmartApiProvider,
    BarcodeScanner,
    NativeStorage,
    Geofence,
    Geolocation,
    Network,
    SocialSharing,
    GoogleApiProvider

  ]
})
export class AppModule {}
