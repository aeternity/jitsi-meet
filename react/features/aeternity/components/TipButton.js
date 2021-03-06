// @flow
/* eslint-disable comma-dangle, max-len */

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';
import TIPPING_V1_INTERFACE from 'tipping-contract/contracts/v1/Tipping_v1_Interface.aes';

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

        this.contract = await client.getContractInstance(TIPPING_V1_INTERFACE, { contractAddress: CONTRACT_ADDRESS });
    },
    async tip(url, title, amount): Promise {
        return this.initTippingContractIfNeeded().then(() => this.contract.methods.tip(url, title, { amount }));
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

        this.state = {
            isOpen: false,
            currency: 'eur',
            value: '',
            message: '',
            error: '',
            showLoading: false,
            success: ''
        };

        this._changeCurrency = this._changeCurrency.bind(this);
        this._onToggleTooltip = this._onToggleTooltip.bind(this);
        this._tokensToCurrency = this._tokensToCurrency.bind(this);
        this._onSendTip = this._onSendTip.bind(this);
        this._onSendTipComment = this._onSendTipComment.bind(this);
        this._onChangeValue = this._onChangeValue.bind(this);
        this._onTipDeepLink = this._onTipDeepLink.bind(this);
        this._onChangeMessage = this._onChangeMessage.bind(this);
        this._onDismiss = this._onDismiss.bind(this);
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
     * WIP.
     * Chane currency.
     *
     * @param {string} currency - New currency.
     * @returns {void}
     */
    _changeCurrency(currency) {
        this.setState({ currency });
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

        this.setState({
            isOpen: !this.state.isOpen,
            message: '',
            error: '',
            value: ''
        });
    }

    /**
     * Change ae value.
     *
     * @param {Object} event - Contains new value.
     * @returns {void}
     */
    _onChangeValue({ target: { value } }) {
        if (!value) {
            this.setState({ value: '' });

            return;
        }

        const [ result ] = value.match(/^\d+\.?\d*$/) ?? [];

        if (result === undefined) {
            this.setState({ value: this.state.value || '' });

            return;
        }

        this.setState({ value: result });
    }

    /**
     * WIP.
     * Get token price for the current currency.
     *
     * @returns {number}
     */
    async _getPriceRates() {
        const getPriceRates = () => '';

        return await getPriceRates[this.state.currency];
    }

    /**
     * WIP.
     * Converts tokens to current currency.
     *
     * @returns {nubmer}
     */
    async _tokensToCurrency({ target: { value: amount } }) {
        const rate = await this._getPriceRates();

        return (amount * rate).toLocaleString('en-US', {
            style: 'currency',
            currency: this.state.currency
        });
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
        const { t } = this.props;

        let value = this.state.value;
        if (value.endsWith('.')) {
            value = value.substring(0, value.length -1);
        }
        const amount = aeternity.util.aeToAtoms(Number(value));

        const url = `${URLS.SUPER}/user-profile/${this.props.account}`;
        const { message } = this.state;

        try {
            this.setState({ showLoading: true });
            await aeternity.tip(url, message, amount);
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
     * On change message.
     *
     * @param {Object} event - OnChange event.
     *
     * @returns {void}
     */
    _onChangeMessage({ target: { value: message } }) {
        this.setState({ message });
    }
    /**
     * On dismiss message.
     *
     * @param {Object} event - OnChange event.
     *
     * @returns {void}
     */
    _onDismiss() {
        this.setState({ message: '', value: '', success:null, error: null });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { isOpen, error, showLoading, value, success, message } = this.state;
        const { hasWallet, layout } = this.props;
        const isNotValidValue = String(value).endsWith('.');
        const isTipButtonDisabled = !value || showLoading || isNotValidValue || !message;

        return (
            <div className = 'tip-component'>
                {hasWallet ? <>
                    <div className = 'tip-icon' >
                        <TipIcon onClick = { this._onToggleTooltip } />
                    </div>
                    {isOpen && (
                        <div className = { `tip-container tip-container__${layout}` }>
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
                            {!success && <div className = 'tip-popup'>
                                <input
                                    className = 'tip-message'
                                    onChange = { this._onChangeMessage }
                                    placeholder = 'What do you appreciate?'
                                    type = 'text'
                                    value = { message || '' } />
                                <div className = 'tip-wrapper'>
                                    <input
                                        className = 'tip-input'
                                        onChange = { this._onChangeValue }
                                        placeholder = 'Amount'
                                        type = 'text'
                                        value = { value || '' } />
                                    <button
                                        className = 'tip-button'
                                        disabled = { isTipButtonDisabled }
                                        onClick = { this._onSendTip }>Tip</button>
                                </div>
                            </div>}
                            {(success || error) && <button
                                className = 'tip-button'
                                onClick = { this._onDismiss }>Ok</button> }
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
