/* @flow */
import InlineDialog from '@atlaskit/inline-dialog';
import { faStopwatch } from '@fortawesome/pro-light-svg-icons';
import { faShareAlt, faCommentsAlt, faUsers, faExpand, faCompress } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';

import {
    createShortcutEvent,
    createToolbarEvent,
    sendAnalytics
} from '../../../analytics';
import { getConferenceName } from '../../../base/conference/functions';
import { i18next, translate } from '../../../base/i18n';
import { IconArrowDown } from '../../../base/icons';
import { getParticipantCount } from '../../../base/participants/functions';
import { connect, equals } from '../../../base/redux';
import { CHAT_SIZE, ChatCounter, toggleChat } from '../../../chat';
import { beginAddPeople } from '../../../invite';
import {
    NOTIFICATION_TIMEOUT,
    showNotification
} from '../../../notifications';
import {
    RecordButton
} from '../../../recording';
import { setFullScreen } from '../../../toolbox/actions';
import MuteEveryoneButton from '../../../toolbox/components/web/MuteEveryoneButton';
import { isToolboxVisible } from '../../../toolbox/functions.web';
import { ToolboxButtonWithIcon } from '../../../base/toolbox/components';

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
     * Whether or not the chat feature is currently displayed.
     */
    _chatOpen: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Dispatch<any>,

    /**
     * Whether or not the app is currently in full screen.
     */
    _fullScreen: boolean,

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
    _visible: boolean,

    /**
     * What buttons are visible to the user
     */
    _visibleButtons: Set<string>,
};

declare var interfaceConfig: Object;

// XXX: We are not currently using state here, but in the future, when
// interfaceConfig is part of redux we will. This will have to be retrieved from the store.
const visibleButtons = new Set(interfaceConfig.TOOLBAR_BUTTONS);

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
        this._onToolbarToggleChat = this._onToolbarToggleChat.bind(this);
        this._onToolbarToggleFullScreen = this._onToolbarToggleFullScreen.bind(this);
        this._onToolbarOpenInvite = this._onToolbarOpenInvite.bind(this);
        this._onToggleModeratorDialog = this._onToggleModeratorDialog.bind(this);


        this.state = {
            meetingLink,
            prettyMeetingLink,
            moderatorDialogIsOpen: false
        };
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _showParticipantCount, _visible, _chatOpen, _fullScreen, t } = this.props;
        const moderatorMenuContent = this._renderModeratorMenuContent();

        return (
            <div className = 'header-wrapper'>
                <div className = 'header-left'>
                    <div className = 'subject visible'>
                        <span className = 'subject-text'>
                            <span className = 'meeting-name'>
                                { this.state.prettyMeetingLink }
                            </span>
                        </span>
                        {/* <div className = 'participants-and-timer'>
                            { _showParticipantCount && <ParticipantsCount /> }
                        </div> */}
                    </div>
                    <div className = 'btn-container'>
                        <RecordButton />
                        <FontAwesomeIcon
                            icon = { faShareAlt }
                            onClick = { this._onToolbarOpenInvite }
                            size = { '1x' } />
                        <div
                            aria-disabled = { false }
                            aria-label = { t('toolbar.accessibilityLabel.fullScreen') }
                            className = 'toolbox-button'
                            key = 'fullscreen'
                            onClick = { this._onToolbarToggleFullScreen }
                            role = 'button'
                            tabIndex = '0'>
                            { _fullScreen
                                ? <FontAwesomeIcon
                                    icon = { faCompress }
                                    size = { '1x' } />
                                : <FontAwesomeIcon
                                    icon = { faExpand }
                                    size = { '1x' } />
                            }
                            </div>

                        <TileViewButton />
                    </div>
                </div>
                <div className = 'right-toolbar'>
                    <button
                        className = { _chatOpen ? '' : 'active' }
                        id = 'toggleParticipantsButton'
                        onClick = { _chatOpen ? this._onToolbarToggleChat : null }>
                        <FontAwesomeIcon
                            icon = { faUsers }
                            size = { '2x' } />
                        <span className = 'btn-text'>Participants</span>
                        { this._shouldShowButton('mute-everyone')
                            && 
                            <div className = 'participants-menu'>
                                <InlineDialog
                                    content = { moderatorMenuContent }
                                    isOpen = { this.state.moderatorDialogIsOpen }
                                    onClose = { () => {
                                        this.setState({ moderatorDialogIsOpen: false });
                                    } }
                                    position = 'bottom right'>
                                    <ToolboxButtonWithIcon
                                        icon = { IconArrowDown }
                                        iconDisabled = { false }
                                        onIconClick = { this._onToggleModeratorDialog } />
                                </InlineDialog>
                            </div>
                        }

                    </button>
                    <button
                        className = { _chatOpen ? 'active' : '' }
                        id = 'toggleChatButton'
                        onClick = { _chatOpen ? null : this._onToolbarToggleChat }>
                        <FontAwesomeIcon
                            icon = { faCommentsAlt }
                            size = { '2x' } />
                        <span className = 'btn-text'>Chat</span>
                        <ChatCounter />

                    </button>
                </div>

            </div>

        );
    }

    /**
     * Toggles articipants moderation menu.
     *
     * @private
     * @returns {void}
     */
    _onToggleModeratorDialog() {
        this.setState({ moderatorDialogIsOpen: !this.state.moderatorDialogIsOpen });
    }

    /**
     * Returns the participants moderation menu.
     *
     * @returns  {ReactElement}
     */
    _renderModeratorMenuContent() {
        return (
            <div>
                { this._shouldShowButton('mute-everyone')
                && <div className = 'menu-item'>
                    <MuteEveryoneButton
                        key = 'mute-everyone'
                        showLabel = { true }
                        visible = { this._shouldShowButton('mute-everyone') } />
                </div>
                }
            </div>
        );

    }


    /**
     * Dispatches an action to toggle the display of chat.
     *
     * @private
     * @returns {void}
     */
    _doToggleChat() {
        this.props.dispatch(toggleChat());
    }

    /**
     * Dispatches an action to toggle screensharing.
     *
     * @private
     * @returns {void}
     */
    _doToggleFullScreen() {
        const fullScreen = !this.props._fullScreen;

        this.props.dispatch(setFullScreen(fullScreen));
    }

    _onToolbarOpenInvite: () => void;


    _onToolbarOpenInvite() {
        sendAnalytics(createToolbarEvent('invite'));
        this.props.dispatch(beginAddPeople());
    }

    _onToolbarToggleChat: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * the display of chat.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleChat() {
        sendAnalytics(createToolbarEvent(
            'toggle.chat',
            {
                enable: !this.props._chatOpen
            }));

        this._doToggleChat();
    }

    _onToolbarToggleFullScreen: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * full screen mode.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleFullScreen() {
        sendAnalytics(createToolbarEvent(
            'toggle.fullscreen',
                {
                    enable: !this.props._fullScreen
                }));

        this._doToggleFullScreen();
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


    _shouldShowButton: (string) => boolean;

    /**
     * Returns if a button name has been explicitly configured to be displayed.
     *
     * @param {string} buttonName - The name of the button, as expected in
     * {@link interfaceConfig}.
     * @private
     * @returns {boolean} True if the button should be displayed.
     */
    _shouldShowButton(buttonName) {
        return this.props._visibleButtons.has(buttonName);
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
    const {
        fullScreen
    } = state['features/toolbox'];

    const buttons = new Set(interfaceConfig.TOOLBAR_BUTTONS);

    return {
        _showParticipantCount: participantCount > 2,
        _chatOpen: state['features/chat'].isOpen,
        _fullScreen: fullScreen,
        _subject: getConferenceName(state),
        _visible: isToolboxVisible(state) && participantCount > 1,
        _visibleButtons: equals(visibleButtons, buttons) ? visibleButtons : buttons
    };
}

export default translate(connect(_mapStateToProps)(Subject));
