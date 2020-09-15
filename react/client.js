import { RpcAepp as rpcAepp, Node as node, Universal as universal } from '@aeternity/aepp-sdk/es';
// eslint-disable-next-line max-len
import browserWindowMessageConnection from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/connection/browser-window-message';
import Detector from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/wallet-detector';

export let client;

const NODE_URL = 'https://mainnet.aeternity.io';
const TESTNET_URL = 'https://testnet.aeternity.io';
const COMPILER_URL = 'https://latest.compiler.aepps.com';

/**
 * Initialise the rpc sdk client or universal if RpcAepp fail.
 *
 * @returns {void}
 *
 */
export async function initClient(name) {
    try {
        client = await rpcAepp({
            name: name || 'Superhero',
            nodes: [ {
                name: 'ae_mainnet',
                instance: await node({
                    url: NODE_URL
                })
            }, {
                name: 'ae_uat',
                instance: await node({
                    url: TESTNET_URL
                })
            } ],
            compilerUrl: COMPILER_URL
        });
    } catch (sdkError) {
        console.log({ sdkError });
    }
}


/**
 * Start to search the wallet with sdk.
 *
 * @returns {void}
 * @param {Function} cb - Callback function.
 *
 */
export async function scanForWallets(cb) {

    const connection = await browserWindowMessageConnection({
        connectionInfo: { id: 'spy' }
    });

    // eslint-disable-next-line new-cap
    const detector = await Detector({ connection });

    detector.scan(async ({ wallets, newWallet }) => {
        const foundWallet = newWallet || Object.values(wallets)[0];

        if (foundWallet) {
            detector.stopScan();
            await client.connectToWallet(await foundWallet.getConnection());
            await client.subscribeAddress('subscribe', 'current');
            cb();
        }
    });
}
