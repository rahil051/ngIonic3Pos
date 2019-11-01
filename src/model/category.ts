import { OrderableInterface } from './orderableInterface';
import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';

export class Category extends DBBasedEntity implements OrderableInterface {
  public name: string;
  public icon: any;
  public order: number;

  constructor() {
    super();
    this.order = 0;
  }
}