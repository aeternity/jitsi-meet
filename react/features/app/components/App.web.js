// @flow
// eslint-disable-next-line max-len
/* globals APP */
import browserWindowMessageConnection from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/connection/browser-window-message';
import Detector from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/wallet-detector';
import { AtlasKitThemeProvider } from '@atlaskit/theme';
import React from 'react';

import { client, initClient } from '../../../client';
import { walletFound } from '../../aeternity/actions';
import { DialogContainer } from '../../base/dialog';
import { sign } from '../../base/jwt/functions';
import { ChromeExtensionBanner } from '../../chrome-extension-banner';
import '../../base/user-interaction';
import '../../chat';
import '../../external-api';
import '../../no-audio-signal';
import '../../noise-detection';
import '../../power-monitor';
import '../../room-lock';
import '../../talk-while-muted';
import '../../video-layout';
import '../../old-client-notification';

import { AbstractApp } from './AbstractApp';

/**
 * Root app {@code Component} on Web/React.
 *
 * @extends AbstractApp
 */
export class App extends AbstractApp {
    /**
     *
     */
    constructor(props) {
        super(props);
        this._scanForWallets = this._scanForWallets.bind(this);
    }
    /**
     * Initializes the app.
     *
     * @inheritdoc
     */
    componentDidMount() {
        super.componentDidMount();

        initClient().then(() => {
            this._scanForWallets(sign);
        });
    }

    /**
     * Start to search the wallet with sdk.
     *
     * @private
     * @param {Function} signFn - Sign function.
     * @returns {void}
     *
     */
    async _scanForWallets(signFn) {
        const connection = await browserWindowMessageConnection({
            connectionInfo: { id: 'spy' }
        });

        // eslint-disable-next-line new-cap
        const detector = await Detector({ connection });

        detector.scan(async ({ newWallet }) => {
            if (newWallet) {
                detector.stopScan();
                await client.connectToWallet(await newWallet.getConnection());
                await client.subscribeAddress('subscribe', 'current');
                APP.store.dispatch(walletFound());
                signFn();
            }
        });
    }

    /**
     * Overrides the parent method to inject {@link AtlasKitThemeProvider} as
     * the top most component.
     *
     * @override
     */
    _createMainElement(component, props) {
        return (
            <AtlasKitThemeProvider mode = 'dark'>
                <ChromeExtensionBanner />
                { super._createMainElement(component, props) }
            </AtlasKitThemeProvider>
        );
    }

    /**
     * Renders the platform specific dialog container.
     *
     * @returns {React$Element}
     */
    _renderDialogContainer() {
        return (
            <AtlasKitThemeProvider mode = 'dark'>
                <DialogContainer />
            </AtlasKitThemeProvider>
        );
    }
}
