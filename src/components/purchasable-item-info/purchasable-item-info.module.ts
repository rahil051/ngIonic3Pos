import { SharedModule } from './../../modules/shared.module';
import { IonicPageModule } from 'ionic-angular';
import { PurchasableItemInfoComponent } from './purchasable-item-info.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [ PurchasableItemInfoComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(PurchasableItemInfoComponent),
    SharedModule
  ],
  exports: [ PurchasableItemInfoComponent ]
})
export class PurchasableItemInfoModule { }