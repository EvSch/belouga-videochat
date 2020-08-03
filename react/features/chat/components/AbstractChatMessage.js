// @flow

import { PureComponent } from 'react';

import { getLocalizedDateFormatter } from '../../base/i18n';
import { MESSAGE_TYPE_ERROR, MESSAGE_TYPE_LOCAL } from '../constants';

/**
 * Formatter string to display the message timestamp.
 */
const TIMESTAMP_FORMAT = 'H:mm';

/**
 * The type of the React {@code Component} props of {@code AbstractChatMessage}.
 */
export type Props = {

    /**
     * The representation of a chat message.
     */
    message: Object,

    /**
     * Whether or not the avatar image of the participant which sent the message
     * should be displayed.
     */
    showAvatar: boolean,

    /**
     * Whether or not the name of the participant which sent the message should
     * be displayed.
     */
    showDisplayName: boolean,

    /**
     * Whether or not the time at which the message was sent should be
     * displayed.
     */
    showTimestamp: boolean,

    /**
     * Invoked to receive translated strings.
     */
    t: Function
};

/**
 * Abstract component to display a chat message.
 */
export default class AbstractChatMessage<P: Props> extends PureComponent<P> {
    /**
     * Returns the timestamp to display for the message.
     *
     * @returns {string}
     */
    _getFormattedTimestamp() {
        return this._getTimeInterval(new Date(this.props.message.timestamp));

        // return getLocalizedDateFormatter(new Date(this.props.message.timestamp))
        //     .format(TIMESTAMP_FORMAT);
    }

    /**
     * Returns the human form timestamp to display for the message.
     *
     * @param {Date} date - The date to convert.
     * @returns {string}
     */
    _getTimeInterval(date) {
        let seconds = Math.floor((Date.now() - date) / 1000);
        let unit = 'second';
        let direction = 'ago';

        if (seconds < 0) {
            seconds = -seconds;
            direction = 'from now';
        }
        let value = seconds;

        if (seconds >= 31536000) {
            value = Math.floor(seconds / 31536000);
            unit = 'year';
        } else if (seconds >= 86400) {
            value = Math.floor(seconds / 86400);
            unit = 'day';
        } else if (seconds >= 3600) {
            value = Math.floor(seconds / 3600);
            unit = 'hour';
        } else if (seconds >= 60) {
            value = Math.floor(seconds / 60);
            unit = 'minute';
        }
        if (value < 10 && unit === 'second') {
            return 'just now';
        }

        if (value !== 1) {
            unit = `${unit}s`;
        }

        return `${value} ${unit} ${direction}`;
    }

    /**
     * Generates the message text to be redered in the component.
     *
     * @returns {string}
     */
    _getMessageText() {
        const { message } = this.props;

        return message.messageType === MESSAGE_TYPE_ERROR
            ? this.props.t('chat.error', {
                error: message.message
            })
            : message.message;
    }

    /**
     * Returns the message that is displayed as a notice for private messages.
     *
     * @returns {string}
     */
    _getPrivateNoticeMessage() {
        const { message, t } = this.props;

        return t('chat.privateNotice', {
            recipient: message.messageType === MESSAGE_TYPE_LOCAL ? message.recipient : t('chat.you')
        });
    }
}
