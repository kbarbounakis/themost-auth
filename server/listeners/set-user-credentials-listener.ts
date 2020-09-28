// MOST Web Framework 2.0 Codename Blueshift, Copyright (c) 2020 THEMOST LP, All rights reserved
import {DataEventArgs, DataObjectState} from '@themost/data';
/**
 * @param {DataEventArgs} event
 * @param {Function} callback
 */
export function beforeSave(_event: DataEventArgs, callback: (err?: Error) => void) {
    return callback();
}

/**
 * @param {DataEventArgs} event
 * @param {Function} callback
 */
export function afterSave(event: DataEventArgs, callback: (err?: Error) => void) {
    if (event.state === DataObjectState.Insert && event.target && event.target.hasOwnProperty('userCredentials')) {
        return event.model.context.model('UserCredential')
            .silent()
            .insert(Object.assign(event.target.userCredentials, {
                id: event.target.id
            }))
            .then(() => {
               return callback();
            })
            .catch( err => {
               return callback(err);
            });
    }
    return callback();
}
