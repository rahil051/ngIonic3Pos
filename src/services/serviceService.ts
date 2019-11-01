import { Injectable } from '@angular/core';
import { Service } from '../model/service';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";

@Injectable()
export class ServiceService  extends BaseEntityService<Service> {  
    constructor() 
    {
        super(Service);
    }
}