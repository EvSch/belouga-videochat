// @flow

import React from 'react';

import { openDialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { IconExclamation } from '../../base/icons';
import { connect } from '../../base/redux';
import { AbstractButton } from '../../base/toolbox/components';
import type { AbstractButtonProps } from '../../base/toolbox/components';
import {isLocalParticipantModerator, getParticipants} from '../../base/participants';
import { toggleCompatMode } from '../actions';
import { ConfirmSetNetworkDialog } from './ConfirmSetNetworkDialog';

/**
 * The type of the React {@code Component} props.
 */
type Props = AbstractButtonProps & {

    /**
     * True if compat mode is on, false if not.
     */
    _isNetworkCompatEnabled: boolean,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function

};

/**
 * An abstract implementation of a button that toggles network compatibility mode.
 */
class NetworkCompatButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.networkCompat';
    icon = IconExclamation;
    label = this.props._isNetworkCompatEnabled ? 'toolbar.networkCompatOff' : 'toolbar.networkCompatOn';
    //tooltip = 'toolbar.networkCompatOn';
    //toggledLabel = 'toolbar.networkCompatOn';

    /**
     * Handles clicking / pressing the button, and toggles the blur effect
     * state accordingly.
     *
     * @protected
     * @returns {void}
     */
    _handleClick() {
        const { _isNetworkCompatEnabled, dispatch } = this.props;
        const value = !_isNetworkCompatEnabled;
        const mapDispatchToProps = {
            onSubmit: () => toggleCompatMode(true)
        };
        //sendAnalytics(createVideoBlurEvent(value ? 'started' : 'stopped'));
        dispatch(value ? openDialog(translate(connect(null, mapDispatchToProps)(ConfirmSetNetworkDialog))) : toggleCompatMode(value));
    }

    /**
     * Returns {@code boolean} value indicating if network compatibility mode is
     * enabled or not.
     *
     * @protected
     * @returns {boolean}
     */
    _isToggled() {
        return this.props._isNetworkCompatEnabled;
    }

    _isVisible() {

    }
}

/**
 * Maps (parts of) the redux state to the associated props for the
 * {@code NetworkCompatButton} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     _isNetworkCompatEnabled: boolean
 * }}
 */
function _mapStateToProps(state): Object {
    const shouldOverride = (state['features/base/conference'].networkCompatActive !== undefined);
    const isModerator = isLocalParticipantModerator(state);
    const participants = getParticipants(state).filter(p => !p.local);
    const anyOtherModerator = participants.filter(p => p.role == "moderator").length;

    return {
        _isNetworkCompatEnabled: Boolean(state['features/base/config'].altConfigLoaded !== undefined),
        visible: (shouldOverride || (isModerator && anyOtherModerator == 0))
    };
}

export default translate(connect(_mapStateToProps)(NetworkCompatButton));
