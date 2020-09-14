// @flow

import { setNetworkCompat, getCurrentConference } from '../base/conference';

import { NETWORK_COMPAT_DISABLED, NETWORK_COMPAT_ENABLED } from './actionTypes';
import logger from './logger';
import { setPreferredVideoQuality, setMaxReceiverVideoQuality } from '../video-quality/actions';
/**
* Signals the local participant is switching between compatibility mode on or off
*
* @param {boolean} enabled - If true enables compatibility mode, false otherwise.
* @returns {Promise}
*/
export function toggleCompatMode(enabled: boolean) {
    return function(dispatch: (Object) => Object, getState: () => any) {
        const state = getState();
        enabled ? dispatch(compatEnabled()) : dispatch(compatDisabled());
        enabled ? dispatch(setPreferredVideoQuality(360)) : dispatch(setPreferredVideoQuality(720));
        enabled ? dispatch(setMaxReceiverVideoQuality(360)) :dispatch(setMaxReceiverVideoQuality(720));
        dispatch(setNetworkCompat(enabled));
        const conference = getCurrentConference(state);
        if (conference.room.membersOnlyEnabled) {
          conference.disableLobby();
        }
        conference.sendCommand(
            'network-compatibility',
            { attributes: {on: enabled}}
        );

        if ((enabled && !state['features/base/config'].altConfigLoaded) || (!enabled && state['features/base/config'].altConfigLoaded)) {
          const url = window.location.href;
          const jwt = state['features/base/jwt'];
          let hashString = "#iAmFirst&config.prejoinPageEnabled=false";
          if (enabled) {
            hashString += "&altConfig=true";
          }
          window.location.replace(url + "?jwt=" + jwt.jwt + hashString);
        }

        return Promise.resolve();
    };
}

/**
 * Signals the local participant that compatibility mode has been enabled.
 *
 * @returns {{
 *      type: NETWORK_COMPAT_ENABLED
 * }}
 */
export function compatEnabled() {
    return {
        type: NETWORK_COMPAT_ENABLED
    };
}

/**
 * Signals the local participant that the compatibility mode has been disabled.
 *
 * @returns {{
 *      type: NETWORK_COMPAT_DISABLED
 * }}
 */
export function compatDisabled() {
    return {
        type: NETWORK_COMPAT_DISABLED
    };
}
