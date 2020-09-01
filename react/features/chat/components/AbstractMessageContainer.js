// @flow
/* global APP  */

import { PureComponent } from 'react';

import {
    getLocalParticipant
} from '../../base/participants';

export type Props = {

    /**
     * The messages array to render.
     */
    messages: Array<Object>
}

/**
 * Abstract component to display a list of chat messages, grouped by sender.
 *
 * @extends PureComponent
 */
export default class AbstractMessageContainer<P: Props> extends PureComponent<P> {
    static defaultProps = {
        messages: []
    };

    /**
     * Iterates over all the messages and creates nested arrays which hold
     * consecutive messages sent by the same participant.
     *
     * @private
     * @returns {Array<Array<Object>>}
     */
    _getMessagesGroupedBySender() {
        const messagesCount = this.props.messages.length;
        const groups = [];
        let currentGrouping = [];
        let currentGroupParticipantId;
        const localParticipant = getLocalParticipant(APP.store.getState());

        for (let i = 0; i < messagesCount; i++) {
            const message = this.props.messages[i];
            const regExp = /\[(ak_[A-Za-z0-9]{48,50})]/;
            const akAddress = message.message.match(regExp);

            message.akAddress = (akAddress && akAddress[1]) || '';

            if (localParticipant.name === message.displayName && message.akAddress === localParticipant.akAddress) {
                message.messageType = 'local';
            }

            if (message.id === currentGroupParticipantId) {
                currentGrouping.push(message);
            } else {
                currentGrouping.length && groups.push(currentGrouping);
                currentGrouping = [ message ];
                currentGroupParticipantId = message.id;
            }
        }

        currentGrouping.length && groups.push(currentGrouping);

        return groups;
    }
}
