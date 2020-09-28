import {EdmMapping,EdmType} from '@themost/data/odata';
import Account = require('./account-model');
import Group = require('./group-model');

/**
 * @class
 */
@EdmMapping.entityType('User')
class User extends Account {

    public lockoutTime?: Date; 
    public logonCount?: number; 
    public enabled?: boolean; 
    public lastLogon?: Date; 
    public groups?: Array<Group|any>; 
    public userFlags?: number; 
    public id?: number; 
    /**
     * @constructor
     */
    constructor() {
        super();
    }
}

export = User;
