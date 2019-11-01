import { Injectable } from '@angular/core';
import { PlatformService } from './platformService';
import { Sale } from '../model/sale';
import { StoreService } from './storeService';
import { PosService } from './posService';
import { TypeHelper } from '@simpleidea/simplepos-core/dist/utility/typeHelper';
import { EndOfDayProvider } from '../provider/print/endOfDay/endOfDayProvider';
import { EndOfDayProviderContext } from '../provider/print/endOfDay/endOfDayProviderContext';
import { EscPrinterConnectorProvider } from '../provider/print/escPrinterConnectorProvider';
import { Closure } from '../model/closure';
import { ReceiptProviderContext } from '../provider/print/receipt/receiptProviderContext';
import { ReceiptProvider } from '../provider/print/receipt/receiptProvider';
import { EmployeeService } from './employeeService';
import { CategoryService } from './categoryService';
import { BasketItem } from '../model/basketItem';
import { AccountSettingService } from '../modules/dataSync/services/accountSettingService';

export enum EndOfDayReportType {
  PerProduct,
  PerCategory,
  PerEmployee
}


@Injectable()
export class PrintService {
  static tcp: any;
  static socketId: string;
  private endOfDayReportSettings = {
    [EndOfDayReportType.PerCategory]: {
      reportTitle: "End Of Day Report - Per Category",
      saleItemGetter: this.getPerCategory.bind(this)
    },
    [EndOfDayReportType.PerEmployee]: {
      reportTitle: "End Of Day Report - Per Employee",
      saleItemGetter: this.getPerEmployee.bind(this)
    },
    [EndOfDayReportType.PerProduct]: {
      reportTitle: "End Of Day Report - Per Product",
      saleItemGetter: this.getPerProduct.bind(this)
    }
  }

  constructor(
    private platformService: PlatformService,
    private storeService: StoreService,
    private posService: PosService,
    private accountSettingService: AccountSettingService,
    private employeeService: EmployeeService,
    private categoryService: CategoryService) {
  }

  public async printEndOfDayReport(closure: Closure, endOfDayReportType: EndOfDayReportType = EndOfDayReportType.PerProduct) {
    var currentStore = await this.storeService.get(closure.storeId);

    var context = new EndOfDayProviderContext();
    context.openFloat = closure.openingAmount
    context.posName = closure.posName;
    context.storeName = closure.storeName;
    context.openTime = closure.openTime;
    context.closeTime = closure.closeTime;
    context.cashIn = closure.totalCashIn;
    context.cashOut = closure.totalCashOut;
    context.cashCounted = closure.cashCounted;
    context.cashDifference = closure.cashDifference;
    context.ccCounted = closure.ccCounted;
    context.ccDifference = closure.ccDifference;
    context.totalCounted = closure.totalCounted;
    context.totalDifference = closure.totalDifference;
    context.employeeFullName = closure.employeeFullName;
    context.currentDateTime = new Date().toLocaleString();
    context.closureNumber = closure.closureNumber;
    context.dayItems = [];

    context.reportTitle = this.endOfDayReportSettings[endOfDayReportType].reportTitle;
    if (closure.sales) {
      for (let sale of closure.sales) {
        if (sale && sale.items) {
          for (let saleItem of sale.items) {

            var qty = saleItem.quantity || 0;
            var totalPrice = (saleItem.finalPrice || 0) * qty;

            let id: string;
            let name: string;

            ({ id, name } = await this.endOfDayReportSettings[endOfDayReportType].saleItemGetter(saleItem));

            if (!context.dayItems[id]) {
              context.dayItems[id] = { name: name, totalPrice: totalPrice, totalQuantity: qty };
            } else {
              context.dayItems[id].totalPrice += totalPrice || 0;
              context.dayItems[id].totalQuantity += qty || 0;
            }
          }
        }
      }
    }

    var provider = new EndOfDayProvider(context);

    provider
      .setHeader()
      .setBody()
      .setFooter()
      .cutPaper();

    await new EscPrinterConnectorProvider(currentStore.printerIP, currentStore.printerPort)
      .write(provider.getResult());
  }

  private getPerProduct(saleItem: BasketItem) {
    var id = saleItem.purchsableItemId;
    var name = saleItem.name;
    return { id, name };
  }

  private async getPerEmployee(saleItem: BasketItem) {
    var id = saleItem.employeeId;
    var name = 'NO EMPLOYEE SELECTED';

    if (id) {
      var employee = await this.employeeService.get(id);
      name = `${employee.firstName} ${employee.lastName}`;
    }
    else {
      id = "NA";
    }

    return { id, name };
  }

  private async getPerCategory(saleItem: BasketItem) {
    var id = saleItem.categoryId;
    var name = "NO CATEGORY";

    if (id) {
      var category = await this.categoryService.get(id);
      if (category && category.name) {
        name = category.name;
      }
    } else {
      id = "NA";
    }

    return { id, name };
  }

  public async printReceipt(sale: Sale) {
    if (!this.platformService.isMobileDevice()) {
      console.warn("can't print on dekstop");
      return;
    }

    var currentStore = await this.storeService.getCurrentStore();

    if (!TypeHelper.isNullOrWhitespace(currentStore.printerIP) && !TypeHelper.isNullOrWhitespace(currentStore.printerPort)) {

      var pos = await this.posService.get(sale.posID);
      var store = await this.storeService.get(pos.storeId);
      var currentAccountsetting = await this.accountSettingService.getCurrentSetting();

      var receiptProviderContext = new ReceiptProviderContext();
      receiptProviderContext.sale = sale;
      receiptProviderContext.invoiceTitle = currentAccountsetting.name;
      receiptProviderContext.shopName = store.name;
      receiptProviderContext.phoneNumber = store.phone;
      receiptProviderContext.taxFileNumber = store.taxFileNumber;
      receiptProviderContext.footerMessage = currentAccountsetting.receiptFooterMessage;

      var receiptProvider = new ReceiptProvider(receiptProviderContext)
        .setHeader()
        .setBody()
        .setFooter()
        .cutPaper();

      await new EscPrinterConnectorProvider(currentStore.printerIP, currentStore.printerPort)
        .write(receiptProvider.getResult());
    }
  }

  public async openCashDrawer() {
    
    if (!this.platformService.isMobileDevice()) {
      console.warn("can't print on dekstop");
      return;
    }

    var currentStore = await this.storeService.getCurrentStore();

    if (!TypeHelper.isNullOrWhitespace(currentStore.printerIP) && !TypeHelper.isNullOrWhitespace(currentStore.printerPort)) {

      await new EscPrinterConnectorProvider(currentStore.printerIP, currentStore.printerPort)
        .write(new ReceiptProvider(null).openCashDrawer().getResult());
    }
  }
}