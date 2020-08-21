// @flow

import { translate } from '../../../../base/i18n';
import { IconToggleRecording, IconRec, IconStopRec } from '../../../../base/icons';
import { connect } from '../../../../base/redux';
import AbstractRecordButton, {
    _mapStateToProps as _abstractMapStateToProps,
    type Props
} from '../AbstractRecordButton';

declare var interfaceConfig: Object;

/*type Props = AbstractProps & {

    /**
     * True if the button should be disabled, false otherwise.
     *
     * NOTE: On web, if the feature is not disabled on purpose, then we still
     * show the button but disabled and with a tooltip rendered on it,
     * explaining why it's not available.
     *
    _disabled: boolean,

    /**
     * Tooltip for the button when it's disabled in a certain way.
     *
    _fileRecordingsDisabledTooltipKey: ?string
}

/**
 * An implementation of a button for starting and stopping recording.
 */
class RecordButton extends AbstractRecordButton<Props> {
    icon = IconRec;

    /**
     * Returns the tooltip that should be displayed when the button is disabled.
     *
     * @private
     * @returns {string}
     */
    _getTooltip() {
        return this._isDisabled() ? this.disabledTooltip : this.tooltip;
    }

    /**
     * Helper function to be implemented by subclasses, which must return a
     * boolean value indicating if this button is disabled or not.
     *
     * @override
     * @protected
     * @returns {boolean}
     */
    _isDisabled() {
        return this.props._disabled;
    }
}

/**
 * Maps (parts of) the redux state to the associated props for the
 * {@code RecordButton} component.
 *
 * @param {Object} state - The Redux state.
 * @param {Props} ownProps - The own props of the Component.
 * @private
 * @returns {{
 *     _fileRecordingsDisabledTooltipKey: ?string,
 *     _isRecordingRunning: boolean,
 *     _disabled: boolean,
 *     visible: boolean
 * }}
 */
export function _mapStateToProps(state: Object, ownProps: Props): Object {
    const abstractProps = _abstractMapStateToProps(state, ownProps);
    let { visible } = ownProps;

    if (typeof visible === 'undefined') {
        visible = interfaceConfig.TOOLBAR_BUTTONS.includes('recording') && abstractProps.visible;
    }

    return {
        ...abstractProps,
        visible
    };
}

export default translate(connect(_mapStateToProps)(AbstractRecordButton));
