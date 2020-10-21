// @flow

import { createToolbarEvent, sendAnalytics } from '../../analytics';
import { translate } from '../../base/i18n';
import { IconDownload } from '../../base/icons';
import { connect } from '../../base/redux';
import { AbstractButton, type AbstractButtonProps } from '../../base/toolbox/components';
import { openURLInBrowser } from '../../base/util';
import Platform from '../../base/react/Platform';
import { jitsiLocalStorage } from '@jitsi/js-utils';

type Props = AbstractButtonProps & {

    /**
     * The URL to the applications page.
     */
    _downloadAppsUrl: string,

    _label: string
};

/**
 * Implements an {@link AbstractButton} to open the applications page in a new window.
 */
class DownloadButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.download';
    icon = IconDownload;
    label = this.props._label;

    /**
     * Handles clicking / pressing the button, and opens a new window with the user documentation.
     *
     * @private
     * @returns {void}
     */
    _handleClick() {
        sendAnalytics(createToolbarEvent('download.pressed'));
        openURLInBrowser(this.props._downloadAppsUrl);
    }
}


/**
 * Maps part of the redux state to the component's props.
 *
 * @param {Object} state - The redux store/state.
 * @returns {Object}
 */
function _mapStateToProps(state: Object) {
    //const { downloadAppsUrl } = state['features/base/config'].deploymentUrls || {};
    let visible = false;
    let usePkg = false;
    let version;
    let platformString = '';
    let downloadAppsUrl = 'https://github.com/EvSch/belouga-videochat-electron/releases/latest/download/belouga-live';
    if (jitsiLocalStorage.getItem('useApp') == null && !navigator.userAgent.includes('Electron')) {
      if (Platform.OS == 'macos') {
        visible = true;
        try {
          version = navigator.userAgent.split('OS X ').pop().split(')')[0].split("_");
          if (parseInt(version[0]) < 11 && (parseInt(version[1]) < 14 || (parseInt(version[1]) == 14 && parseInt(version[2]) < 5))) {
            usePkg = true;
          }
        } catch (e) {

        }
        if (usePkg) {
          downloadAppsUrl += '.pkg';
        } else {
          downloadAppsUrl += '.dmg'
        }
        platformString = 'macOS';
      } else if (Platform.OS == 'windows') {
        visible = true;
        downloadAppsUrl += '.exe';
        platformString = 'Windows';
      } else if (Platform.OS == 'linux') {
        visible = true;
        downloadAppsUrl += '-x86_64.AppImage';
        platformString = 'Linux';
      }
    }
    const label = 'Download app for ' + platformString;
    return {
        _downloadAppsUrl: downloadAppsUrl,
        _label: label,
        visible: visible
    };
}

export default translate(connect(_mapStateToProps)(DownloadButton));
