// @flow

import { PersistenceRegistry, ReducerRegistry } from '../base/redux';

import { NETWORK_COMPAT_ENABLED, NETWORK_COMPAT_DISABLED } from './actionTypes';

PersistenceRegistry.register('features/network-compatibility');

ReducerRegistry.register('features/network-compatibility', (state = {}, action) => {

    switch (action.type) {
    case NETWORK_COMPAT_ENABLED: {
        return {
            ...state,
            compatEnabled: true
        };
    }
    case NETWORK_COMPAT_DISABLED: {
        return {
            ...state,
            compatEnabled: false
        };
    }
    }

    return state;
});
