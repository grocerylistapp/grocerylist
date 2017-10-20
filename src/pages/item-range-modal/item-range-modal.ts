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

  constructor(public navCtrl: NavController, public navParams: NavParams,public viewCtrl: ViewController) {

    this.quantitySel = navParams.get('quantity');
    this.maxQuantity = navParams.get('quantity');
  }

  selectQtyModal(){
    this.viewCtrl.dismiss(this.quantitySel);
  }

  cancelQtyModal(){
    this.viewCtrl.dismiss();
  }
}
