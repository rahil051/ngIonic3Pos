import { OrderableInterface } from './orderableInterface';
import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';

export abstract class PurchasableItem extends DBBasedEntity implements OrderableInterface
{
    public name: string;
    public color: string;
    public image: string;
    public icon: any;
    public order: number;
    public barcode?: string;
    public sku?: string; // stock keeping unit
    public categoryIDs: string[]
}