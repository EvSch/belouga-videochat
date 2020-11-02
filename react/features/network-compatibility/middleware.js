import { setNetworkCompat, getCurrentConference } from '../base/conference';
import { CONFERENCE_WILL_JOIN } from '../base/conference/actionTypes';
import { getParticipantById, PARTICIPANT_JOINED } from '../base/participants';
import { MiddlewareRegistry } from '../base/redux';
import { setPreferredVideoQuality, setMaxReceiverVideoQuality } from '../video-quality/actions';
import logger from './logger';

MiddlewareRegistry.register(store => next => action => {
    switch (action.type) {

    case CONFERENCE_WILL_JOIN: {
        const { conference } = action;
        const networkCompatibility = store.getState()['features/network-compatibility'] || {};
        if (store.getState()['features/base/config'].altConfigLoaded !== undefined ) {
          store.dispatch(setPreferredVideoQuality(360));
          store.dispatch(setMaxReceiverVideoQuality(360));
        } else {
          store.dispatch(setPreferredVideoQuality(720));
          store.dispatch(setMaxReceiverVideoQuality(720));
        }
        if (store.getState()['features/base/config'].iAmFirst !== undefined && networkCompatibility.hasOwnProperty('compatEnabled')){
          const enabled = APP.store.getState()['features/network-compatibility'].compatEnabled;
          //store.dispatch(setNetworkCompat(enabled));
          if (conference.room.membersOnlyEnabled) {
            conference.disableLobby();
          }
          conference.sendCommand(
              'network-compatibility',
              { attributes: {on: enabled}}
          );
        }

        conference.addCommandListener(
            'network-compatibility', ({ attributes }, id) => {
                _onNetworkCompatibilityCommand(attributes, id, store);
            });
        break;
    }
  }
  return next(action);
});

/**
 * Notifies this instance about a "Follow Me" command received by the Jitsi
 * conference.
 *
 * @param {Object} attributes - The attributes carried by the command.
 * @param {string} id - The identifier of the participant who issuing the
 * command. A notable idiosyncrasy to be mindful of here is that the command
 * may be issued by the local participant.
 * @param {Object} store - The redux store. Used to calculate and dispatch
 * updates.
 * @private
 * @returns {void}
 */
function _onNetworkCompatibilityCommand(attributes = {}, id, store) {
    const state = store.getState();
    const enabled = attributes.on;
    // We require to know who issued the command because (1) only a
    // moderator is allowed to send commands and (2) a command MUST be
    // issued by a defined commander.
    if (typeof id === 'undefined') {
        return;
    }

    const participantSendingCommand = getParticipantById(state, id);

    // The Command(s) API will send us our own commands and we don't want
    // to act upon them.
    if (participantSendingCommand == undefined || participantSendingCommand.local) {
        return;
    }

    if (participantSendingCommand.role !== 'moderator') {
        logger.warn('Received network compat command not from moderator');

        return;
    }

    const url = window.location.href;
    const jwt = state['features/base/jwt'];

    if (enabled == "true" && !state['features/base/config'].altConfigLoaded) {
      if (!url.includes('altConfig')) {
        window.location.replace(url + "?jwt=" + jwt.jwt + "#altConfig=true&config.prejoinPageEnabled=false");
      }
    } else if (enabled == "false" && state['features/base/config'].altConfigLoaded) {
        window.location.replace(url + "?jwt=" + jwt.jwt + "#config.prejoinPageEnabled=false");
    }
}
