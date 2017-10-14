import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http';

import { inSCANout } from './app.component';
import { ShoppingListPage } from '../pages/shopping-list/shopping-list';
import { AddShoppingPage } from '../pages/add-shopping/add-shopping';
import { EditShoppingItemPage} from '../pages/edit-shopping-item/edit-shopping-item';
import { WalmartSearchModalPage} from '../pages/walmart-search-modal/walmart-search-modal';

// Import the AF2 Module
import { AngularFireModule } from 'angularfire2';
import{ AngularFireDatabaseModule} from 'angularfire2/database';
import { FIREBASE_CREDENTIALS } from './firebase.credentials';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { DataServiceProvider } from '../providers/data-service/data-service';
import { WalmartApiProvider } from '../providers/walmart-api/walmart-api';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';


@NgModule({
  declarations: [
    inSCANout,
    EditShoppingItemPage,
    AddShoppingPage,
    WalmartSearchModalPage

  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(inSCANout),
    //initialize angularfire with credentials 
    AngularFireModule.initializeApp(FIREBASE_CREDENTIALS),
    AngularFireDatabaseModule,
    AngularFireAuthModule,    
    HttpModule
  ],
  bootstrap: [IonicApp],
  
  entryComponents: [
  inSCANout, 
    EditShoppingItemPage, 
    AddShoppingPage,
    WalmartSearchModalPage
],
  providers: [
    StatusBar,
    SplashScreen,
    AngularFireAuth,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthServiceProvider,
    DataServiceProvider,
    WalmartApiProvider,
    BarcodeScanner
  ]
})
export class AppModule {}
