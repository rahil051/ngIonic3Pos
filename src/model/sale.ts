import * as moment from 'moment';
import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';
import { DBMode, DBModeEnum } from '@simpleidea/simplepos-core/dist/metadata/dbMode';
import { BasketItem } from './basketItem';

interface PaymentsInterface {
  type: string,
  amount: number
}

export interface DiscountSurchargeInterface {
  value: number;
  type: string;
  format: string;
  createdAt: string;
}

@DBMode(DBModeEnum.Current)
export class Sale extends DBBasedEntity {

  public posID: string;
  public items: Array<BasketItem>;
  public subTotal: number;
  public tax: number;
  public taxTotal: number;
  public notes: string;
  public completed: boolean;
  public totalDiscount: number;
  public state: string;
  public payments: Array<PaymentsInterface>;
  public round: number;
  public created: string;
  public completedAt: string;
  public status: string;
  public receiptNo: string;
  public customerKey: string;
  public originalSalesId: string;
  public saleAppliedValue?: number;
  public saleAppliedType?: string;
  public appliedValues: DiscountSurchargeInterface[];

  constructor() {
    super();
    this.completed = false;
    this.items = [];
    this.totalDiscount = 0;
    this.state = 'current'; // [ current, parked, discarded, refund, completed ]
    this.payments = [];
    this.notes = "";
    this.round = 0;
    this.created = moment().utc().format()
    this.customerKey = null;
    this.receiptNo = "";
    this.originalSalesId = "";
    this.saleAppliedValue = 0;
    this.saleAppliedType = null;
    this.appliedValues = [];
  }
}