// @flow
/* eslint-disable comma-dangle, max-len */

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';
import TIPPING_INTERFACE from 'tipping-contract/contracts/v2/Tipping_v2_Interface.aes';

import { client } from '../../../client';
import { translate } from '../../base/i18n';
import TipIcon from '../../base/icons/svg/tip.svg';
import { createDeepLinkUrl } from '../../base/util/createDeepLinkUrl';
import {
    isAccountOrChainName
} from '../utils';

declare var APP: Object;

type Props = {

    /**
     * Account or chain name
     */
    account: string,

    /**
     * Whether sdk is connected to extension and client is inited
     */
   connectedToExtension: boolean,

    /**
     * Whether user has wallet
     */
    hasWallet: boolean,

    /**
     * Tile view or vertical filmstrip
     */
    layout: string,

    /**
     * Used for translation
     */
    t: Function
};

type State = {

    /**
     * Whether tooltip is open or not.
     */
    isOpen: boolean,

    /**
     * Fiat currency.
     */
    currency: string,

    /**
     * AE value
     */
    value: string,

    /**
     * Any error
     */
    error: string,

    /**
     * Is show loading
     */
    showLoading: boolean,

    /**
     * Message for the author
     */
    message: string,

    /**
     * Display this message if transaction is successful
     */
    success: string,
};

const URLS = {
    SUPER: 'https://superhero.com',
    RAENDOM: 'https://raendom-backend.z52da5wt.xyz'
};
const CONTRACT_ADDRESS = 'ct_2AfnEfCSZCTEkxL5Yoi4Yfq6fF7YapHRaFKDJK3THMXMBspp5z';

const aeternity = {
    contract: null,
    async initTippingContractIfNeeded(): void {
        if (!client) {
            throw new Error('Init sdk first');
        }
        if (this.contract) {
            return;
        }

        this.contract = await client.getContractInstance(TIPPING_INTERFACE, { contractAddress: CONTRACT_ADDRESS });
    },
    async tip({ address, message, amount }): Promise {
        return this.initTippingContractIfNeeded().then(() => this.contract.methods.tip_direct(address, message, { amount }));
    },
    util: {
        aeToAtoms(ae) {
            return (new BigNumber(ae)).times(new BigNumber(1000000000000000000));
        }
    }
};

/**
 * Aeternity tip button react version.
 */
class TipButton extends Component<Props, State> {
    /**
     * Initializes a new TipButton instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);
        const room = APP.conference.roomName;

        this.state = {
            isOpen: false,
            currency: 'eur',
            value: '',
            message: `Appreciation from conference : ${room} on ${window.location.host}.`,
            error: '',
            showLoading: false,
            success: ''
        };

        this._onToggleTooltip = this._onToggleTooltip.bind(this);
        this._onSendTip = this._onSendTip.bind(this);
        this._onChangeValue = this._onChangeValue.bind(this);
        this._onTipDeepLink = this._onTipDeepLink.bind(this);
    }

    /**
     * Implements {@code Component#componentDidUpdate}.
     *
     * @inheritdoc
     */
    componentDidUpdate() {
        this.state.isOpen
            ? document.addEventListener('click', this._onToggleTooltip)
            : document.removeEventListener('click', this._onToggleTooltip);
    }


    /**
     * Toggle tooltip.
     *
     * @param {Object} event - Event object.
     * @returns {void}
     */
    _onToggleTooltip(event) {
        const tipRegExp = /tip/;
        const isTip = tipRegExp.test(event.target.className);

        if (isTip) {
            return;
        }

        this.setState({ isOpen: !this.state.isOpen });
    }

    /**
     * Change ae value.
     *
     * @param {Object} event - Contains new value.
     * @returns {void}
     */
    _onChangeValue({ target: { value } }) {
        const validationRegExp = /^\d+\.?\d*$/;
        const [ result ] = value.match(validationRegExp) ?? [];

        if (result?.endsWith('.')) {
            this.setState({ value: result });

            return;
        } else if (!value) {
            this.setState({ value: '' });

            return;
        }

        result ? this.setState({ value: Number(result) }) : this.setState({ value: this.state.value });
    }

    /**
     * Send the tip comment, not the tip itself.
     *
     * @param {{ id: string, account: string, text: string, author: string, signCb: Function, parentId: string }} options - Options.
     * @returns {Promise}
     */
    async _onSendTipComment({
        id,
        text = this.state.message,
        author = this.props.account,
        signCb,
        parentId = ''
    }) {
        const { t } = this.props;

        if (!isAccountOrChainName(author)) {
            this.setState({ error: t('tipping.error.invalidAccount') });

            return;
        }

        const sendComment = body => fetch(`${URLS.RAENDOM}/${'comment/api'}`, {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });

        const { challenge } = await sendComment({
            id,
            text,
            author
        });
        const signature = await signCb(challenge);

        const commentPayload = {
            challenge,
            signature,
            parentId
        };

        return sendComment(commentPayload);
    }

    /**
     * Send the tip itself.
     *
     * @returns {void}
     */
    async _onSendTip() {
        const { account: address, t } = this.props;
        const { message, value } = this.state;
        const amount = aeternity.util.aeToAtoms(value);

        try {
            this.setState({ showLoading: true });
            await aeternity.tip({
                address,
                message,
                amount
            });
            this.setState({ success: t('tipping.success') });
        } catch (e) {
            // todo: translates
            console.log({ e });
            this.setState({ error: t('tipping.error.tippingFailed') });
        } finally {
            this.setState({ showLoading: false });
        }
    }

    /**
     * Create tip deeplink URL object.
     *
     * @returns {Object}
     */
    _deepLinkTip() {
        const url = createDeepLinkUrl({ type: 'tip' });

        url.searchParams.set('url', `https://superhero.com/user-profile/${this.props.account}`);

        return url;
    }

    /**
     * On tip deeplink popup.
     *
     * @returns {void}
     */
    _onTipDeepLink() {
        window.open(this._deepLinkTip().toString(), 'popup', 'width=374, height=600, top=20, left=20');
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { isOpen, error, showLoading, value, success } = this.state;
        const { hasWallet, layout } = this.props;
        const isNotValidValue = String(value).endsWith('.');

        return (
            <div className = 'tip-component'>
                {hasWallet ? <>
                    <div className = 'tip-icon' >
                        <TipIcon onClick = { this._onToggleTooltip } />
                    </div>
                    {isOpen && (
                        <div className = { `tip-container tip-container__${layout}` } >
                            {!showLoading && error && <div className = 'tip-error'> {error} </div>}
                            {!showLoading && !error && success && <div className = 'tip-success'> {success} </div>}
                            {showLoading && <div className = 'tip-loader'>
                                <div className = 'lds-ellipsis'>
                                    <div />
                                    <div />
                                    <div />
                                    <div />
                                </div>
                            </div>}
                            <div className = 'tip-wrapper'>
                                <input
                                    className = 'tip-input'
                                    onChange = { this._onChangeValue }
                                    placeholder = 'Amount'
                                    type = 'text'
                                    value = { value } />
                                <button
                                    className = 'tip-button'
                                    disabled = { !value || showLoading || isNotValidValue }
                                    onClick = { this._onSendTip }>Tip</button>
                            </div>
                        </div>
                    )}
                </> : <div className = 'tip-icon' >
                    <TipIcon onClick = { this._onTipDeepLink } />
                </div>}
            </div>
        );
    }
}

export default translate(TipButton);
