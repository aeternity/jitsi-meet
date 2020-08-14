import { Node as node, Universal as universalSDK, MemoryAccount as memoryAccount } from '@aeternity/aepp-sdk/es';

export let client;
export let staticClient;

const NODE_URL = 'https://mainnet.aeternity.io';
const TESTNET_URL = 'https://testnet.aeternity.io';
const COMPILER_URL = 'https://latest.compiler.aepps.com';

export const initClient = async () => {

    client = await universalSDK({
        name: 'Superhero-league',
        nodes: [ {
            name: 'mainnet',
            instance: await node({
                url: NODE_URL
            }) }, {
            name: 'test-net',
            instance: await node({
                url: TESTNET_URL
                // internalUrl: NODE_INTERNAL_URL
            })
        } ],
        compilerUrl: COMPILER_URL,
        accounts: [
            memoryAccount({
                keypair: {
                    secretKey: process.env.PRIVATE_KEY,
                    publicKey: process.env.PUBLIC_KEY
                }
            })
        ]
    });

    staticClient = false;
    return initProvider(true);

};

/**
 * Initialize a static client, mainnet or testnet
 * This client can not sign transactions that require funds (everything except static contract calls)
 * @returns {Promise<*>}
 */

export const initStaticClient = async () => {
    staticClient = true;

    return universalSDK({
        nodes: [ {
            name: 'mainnet',
            instance: await node({
                url: NODE_URL
            })
        } ],
        compilerUrl: COMPILER_URL
    });
};

export const hasActiveWallet = () => Boolean(client);
