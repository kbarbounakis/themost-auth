import {EdmMapping,EdmType} from '@themost/data/odata';

import {DataObject} from '@themost/data/data-object';
/**
 * @class
 */
@EdmMapping.entityType('AccessToken')
class AccessToken extends DataObject {

    public access_token?: string; 
    public client_id?: string; 
    public user_id?: string; 
    public expires?: Date; 
    public refresh_token?: string; 
    public scope?: string; 
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    isExpired() {
        if (this.expires == null) {
                return true;
            }
        return this.expires.getTime()<(new Date()).getTime();
    }

}

export = AccessToken;
