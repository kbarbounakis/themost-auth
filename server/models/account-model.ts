import {EdmMapping,EdmType} from '@themost/data/odata';
import Thing = require('./thing-model');

/**
 * @class
 */
@EdmMapping.entityType('Account')
class Account extends Thing {

    public id?: number; 
    /**
     * @constructor
     */
    constructor() {
        super();
    }
}

export = Account;
