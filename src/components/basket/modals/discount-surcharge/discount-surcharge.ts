import * as moment from 'moment';
import { DiscountSurchargeInterface } from './../../../../model/sale';
import { ViewController, ToastController } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'discount-surcharge-modal',
  templateUrl: 'discount-surcharge.html',
})
export class DiscountSurchargeModal {

  public static readonly DISCOUNT: string = 'discount';
  public static readonly SURCHARGE: string = 'surcharge';
  public static readonly CASH: string = 'cash';
  public static readonly PRECENTAGE: string = 'percentage';

  public value: number;
  public action: string;
  public inputType: string;

  constructor(
    private viewCtrl: ViewController,
    private toastCtrl: ToastController
  ) {
    this.action = DiscountSurchargeModal.DISCOUNT;
    this.inputType = DiscountSurchargeModal.CASH;
  }

  public confirmChanges() {
    if (this.value > 0) {
      this.viewCtrl.dismiss(<DiscountSurchargeInterface>{
        value: this.value,
        type: this.action,
        format: this.inputType,
        createdAt: moment().utc().format()
      });
    } else {
      let toast = this.toastCtrl.create({
        message: 'Value must be positive',
        duration: 3000
      });
      toast.present();
    }
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}