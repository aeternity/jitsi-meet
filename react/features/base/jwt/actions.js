// @flow

import { SET_JWT, REJECT_JWT } from './actionTypes';

/**
 * Stores a specific JSON Web Token (JWT) into the redux store.
 *
 * @param {string} [jwt] - The JSON Web Token (JWT) to store.
 * @returns {{
 *     type: SET_TOKEN_DATA,
 *     jwt: (string|undefined)
 * }}
 */
export function setJWT(jwt: ?string) {
    return {
        type: SET_JWT,
        jwt
    };
}


/**
 * Reject JWT action.
 *
 * @returns {{
 *     type: REJECT_JWT
 * }}
 */
export function rejectJWT() {
    return {
        type: REJECT_JWT
    };
}
