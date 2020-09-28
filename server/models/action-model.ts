import {EdmMapping,EdmType} from '@themost/data/odata';
import Thing = require('./thing-model');
import ActionStatusType = require('./action-status-type-model');
import EntryPoint = require('./entry-point-model');
import User = require('./user-model');
import * as moment from 'moment';
/**
 * @class
 */
@EdmMapping.entityType('Action')
class Action extends Thing {

    public result?: Thing|any; 
    public actionStatus?: ActionStatusType|any; 
    public target?: EntryPoint|any; 
    public agent?: User|any; 
    public startTime?: Date; 
    public endTime?: Date; 
    public instrument?: Thing|any; 
    public object?: Thing|any; 
    public error?: Thing|any; 
    public id?: number; 
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    async isOverdue() {
        let endTime;
        if (this.hasOwnProperty('endTime')) {
            endTime = moment(this.endTime);
            // validate endTime
            if (endTime.isValid()) {
                return endTime.toDate()<(new Date());
            }
            // otherwise return false
            return false;
        }
        const value = await this.getModel()
                .where('id').equal(this.getId())
                .silent()
                .select('endTime').value();
        endTime = moment(value);
        if (endTime.isValid()) {
            return endTime.toDate()<(new Date());
        }
        return false;
    }

}

export = Action;
