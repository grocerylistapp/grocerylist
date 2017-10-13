import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';

import {AddShoppingPage} from "../add-shopping/add-shopping";
import {EditShoppingItemPage} from "../edit-shopping-item/edit-shopping-item";
import{ShoppingItem} from "../../models/shopping-item/shopping-item.interface";
import {FirebaseListObservable, AngularFireDatabase} from 'angularfire2/database';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import firebase from 'firebase';
import { AddToMyNextTripPage } from '../add-to-my-next-trip/add-to-my-next-trip';

@IonicPage()
@Component({
  selector: 'page-master-list',
  templateUrl: 'master-list.html',
})
export class MasterListPage implements OnInit{
  shoppingListRef$ : FirebaseListObservable<ShoppingItem[]>
  private authenticatedUser : User;
  private authenticatedUser$ : Subscription;
 
  ngOnInit(): void {
   try{
    console.log("Came to masterlist oninnit");
    this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
      console.log(`Masterlist got user1 ${this.authenticatedUser.uid}`);
      })
    this.shoppingListRef$ = this.db.list(`/masterlist/${this.authenticatedUser.uid}`);
    }catch(e){
      
    }
  }

  
  constructor(public navCtrl: NavController, public navParams: NavParams, private db : AngularFireDatabase,
  private actionSheetCntrl : ActionSheetController,private auth: AuthServiceProvider, private data: DataServiceProvider) {
    try{
      console.log("Came to masterlist constructor");
      this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
        this.authenticatedUser = user;
        console.log(`Masterlist got user1 ${this.authenticatedUser.uid}`);
        })
      this.shoppingListRef$ = this.db.list(`/masterlist/${this.authenticatedUser.uid}`);
      }catch(e){
          
      }
  }

  navigateToAddItemToMasterListPage(){
    this.navCtrl.push('AddItemToMasterListPage');
  }


  editShoppingList(shoppingItem: ShoppingItem){
    this.actionSheetCntrl.create({
      title: `${shoppingItem.itemName}`,
      buttons: [
        {
          text: 'Add to Buddy List',
          handler: ()=> {
            console.log("addingto my next trip page");
            this.navCtrl.push('AddToMyNextTripPage',{shoppingItem: shoppingItem} )
          }

        },
        {
          text: 'Edit',
          handler: ()=> {
            this.navCtrl.push('EditShoppingItemPage',{shoppingItemId: shoppingItem.$key, rootNode: "masterlist",
              userid: this.authenticatedUser.uid} )
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: ()=> {
            this.shoppingListRef$.remove(shoppingItem.$key);
          }

        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: ()=> {
            
          }

        }

      ]
    }).present();
  }

  



}
