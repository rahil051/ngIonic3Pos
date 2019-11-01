import { Injectable } from '@angular/core';

@Injectable()
export class TaxService {

  constructor() {

  }

  public calculateTaxAmount(price: number, isTaxInclusive: boolean, tax?: number): number {
    tax = tax || 0;

    return isTaxInclusive ? (price * tax / (tax + 100)) : (price * (tax / 100));
  }
}