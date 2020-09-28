// MOST Web Framework 2.0 Codename Blueshift, Copyright (c) 2020 THEMOST LP, All rights reserved
import {TraceUtils} from '@themost/common/utils';
import {getMailer} from '@themost/mailer';
import { DataEventArgs, DataObjectState } from '@themost/data';
/**
 *
 * @param {DataEventArgs} event
 * @param {Function} callback
 */
export function afterSave(event: DataEventArgs, callback: (err?: Error) => void) {

    if (event.state === DataObjectState.Insert) {
        const context = event.model.context;
        return getMailer(context)
            .to(event.target.object.name)
            .subject('Password Reminder (theMOST Authentication Services)')
            .template('reminder').send(event.target, (err) => {
                if (err) {
                    TraceUtils.error('An error occured while sending password reminder message for password reset action with ID:' + event.target.id);
                    TraceUtils.error(err);
                }
                return callback();
        });
    }
    return callback();

}