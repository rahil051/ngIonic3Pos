import { PurchasableItem } from './purchasableItem';

export class Service extends PurchasableItem {
    constructor() {
        super();
        this.name = "";
        this.color = "";
        this.image = "";
        this.order = 0;
    }
}
