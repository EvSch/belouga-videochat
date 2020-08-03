/* @flow */
import { faPaperclip } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';

import { getConferenceName } from '../../../base/conference/functions';
import { i18next } from '../../../base/i18n';
import { getParticipantCount } from '../../../base/participants/functions';
import { connect } from '../../../base/redux';
import {
    NOTIFICATION_TIMEOUT,
    showNotification
} from '../../../notifications';
import { isToolboxVisible } from '../../../toolbox';
import {
    TileViewButton,
    shouldDisplayTileView,
    toggleTileView
} from '../../../video-layout';
import ConferenceTimer from '../ConferenceTimer';


import ParticipantsCount from './ParticipantsCount';

/**
 * The type of the React {@code Component} props of {@link Subject}.
 */
type Props = {

    /**
     * Whether then participant count should be shown or not.
     */
    _showParticipantCount: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Dispatch<any>,

    /**
     * The subject or the of the conference.
     * Falls back to conference name.
     */
    _subject: string,

    /**
     * Whether or not the tile view is enabled.
     */
    _tileViewEnabled: boolean,

    /**
     * Indicates whether the component should be visible or not.
     */
    _visible: boolean
};

/**
 * Subject react component.
 *
 * @class Subject
 */
class Subject extends Component<Props> {

    /**
     * Initializes a new {@code Subject} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);
        const { _subject } = this.props;
        const meetingLink = `${window.location.origin}/${_subject.replace(/ /g, '')}`;
        const prettyMeetingLink = `${window.location.hostname}/${_subject.replace(/ /g, '')}`;

        this._onCopyShareLink = this._onCopyShareLink.bind(this);

        this.state = {
            meetingLink,
            prettyMeetingLink
        };
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _showParticipantCount, _visible } = this.props;
       

        return (
            <div className = 'header-wrapper'>
                <div className = { 'subject visible' }>
                    <span className = 'subject-text'>
                        { this.state.prettyMeetingLink }
                        <FontAwesomeIcon
                            icon = { faPaperclip }
                            onClick = { this._onCopyShareLink }
                            size = { '1x' } />
                    </span>
                    { _showParticipantCount && <ParticipantsCount /> }
                    <ConferenceTimer />
                </div>
                <TileViewButton />

            </div>

        );
    }

    /**
     * Copies the meeting share link.
     *
     * @private
     * @returns {void}
     */
    _onCopyShareLink() {
        navigator.clipboard.writeText(this.state.meetingLink);
        this.props.dispatch(showNotification({
            title: i18next.t('Meeting link copied to clipboard.')
        }, NOTIFICATION_TIMEOUT));

    }


    /**
     * Dispaches an action to toggle tile view.
     *
     * @private
     * @returns {void}
     */
    _doToggleTileView() {
        this.props.dispatch(toggleTileView());
    }


}


/**
 * Maps (parts of) the Redux state to the associated
 * {@code Subject}'s props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     _subject: string,
 *     _visible: boolean
 * }}
 */
function _mapStateToProps(state) {
    const participantCount = getParticipantCount(state);

    return {
        _showParticipantCount: participantCount > 2,
        _subject: getConferenceName(state),
        _visible: isToolboxVisible(state) && participantCount > 1
    };
}

export default connect(_mapStateToProps)(Subject);
