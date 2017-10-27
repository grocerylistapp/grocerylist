import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-item-range-modal',
  templateUrl: 'item-range-modal.html',
})
export class ItemRangeModalPage {

  private quantitySel: number;
  private maxQuantity: number;
  private type: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,public viewCtrl: ViewController) {

    this.quantitySel = navParams.get('quantity');
    this.maxQuantity = navParams.get('quantity');
    this.type = navParams.get('type');
    
  }

  selectQtyModal(){
    this.viewCtrl.dismiss(this.quantitySel);
  }

  cancelQtyModal(){
    this.viewCtrl.dismiss();
  }
}
