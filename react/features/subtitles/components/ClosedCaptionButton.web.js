// @flow

import { translate } from '../../base/i18n';
import { IconClosedCaption } from '../../base/icons';
import { connect } from '../../base/redux';

import {
    AbstractClosedCaptionButton,
    _abstractMapStateToProps,
    type Props as AbstractProps
} from './AbstractClosedCaptionButton';

type Props = AbstractProps & {

    /**
     * True if the button should be disabled, false otherwise.
     *
     * NOTE: On web, if the feature is not disabled on purpose, then we still
     * show the button but disabled and with a tooltip rendered on it,
     * explaining why it's not available.
     */
    _disabled: boolean
}

/**
 * A button which starts/stops the transcriptions.
 */
class ClosedCaptionButton
    extends AbstractClosedCaptionButton {

    accessibilityLabel = 'toolbar.accessibilityLabel.cc';
    icon = IconClosedCaption;
    tooltip = 'transcribing.ccButtonTooltip';
    disabledTooltip = 'Join the CLC for live transcription/captions!';
    label = 'toolbar.startSubtitles';
    toggledLabel = 'toolbar.stopSubtitles';

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

export function _mapStateToProps(state: Object, ownProps: Props): Object {
    const abstractProps = _abstractMapStateToProps(state, ownProps);
    let { visible } = ownProps;

    const _disabledByFeatures = abstractProps.disabledByFeatures;
    let _disabled = false;

    if (!abstractProps.visible
            && _disabledByFeatures !== undefined && !_disabledByFeatures) {
        _disabled = true;
    }

    if (typeof visible === 'undefined') {
        visible = interfaceConfig.TOOLBAR_BUTTONS.includes('closedcaptions')
            && (abstractProps.visible || _disabled);
    }

    return {
        ...abstractProps,
        visible,
        _disabled
    };
}
export default translate(connect(_mapStateToProps)(
    ClosedCaptionButton));
