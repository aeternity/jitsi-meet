// eslint-disable-next-line max-len
/* global APP */
import browserWindowMessageConnection from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/connection/browser-window-message';

import { isInIframe } from './../../aeternity/utils';
import { setParentLocationURL } from '../../../features/base//connection';


// todo: rename function or move some parts
const sendRoomNameSignal = async function(room) {
    if (isInIframe()) {
        const connection = await browserWindowMessageConnection();

        connection.sendMessage({ room });

        connection.connect(({ url }) => {
            APP.store.dispatch(setParentLocationURL({ url }));
            console.log({ state: APP.store.getState()['features/base/connection'] });
        });

        return;
    }
};

export default sendRoomNameSignal;
