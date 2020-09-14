// @flow

import React from 'react';

import { Dialog } from '../../base/dialog';
import { translate } from '../../base/i18n';

type Props = {

    /**
     * Invoked to obtain translated strings.
     */
    t: Function,

    /**
     * The redux {@code dispatch} function.
     */
    onSubmit: Function
};

/**
 * Component that renders the confirm set compatibility mode dialog.
 *
 * @returns {React$Element<any>}
 */
export function ConfirmSetNetworkDialog({t, onSubmit}: Props) {
    return (
        <Dialog
          okKey = 'dialog.enableNetworkCompatButton'
          onSubmit = { onSubmit }
          titleKey = 'dialog.enableNetworkCompat'
          width = 'small'>
          { t('dialog.enableNetworkCompatInfo') }
        </Dialog>
    );
}

export default translate(ConfirmSetNetworkDialog);
