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
            const splitedMessage = message.message.split('_');
            const akAddress = splitedMessage.length > 1 ? splitedMessage.slice(0, 2).join('_') : '';
            const text = splitedMessage.pop();

            message.akAddress = akAddress;
            message.message = text;

            if (localParticipant.name === message.displayName && message.akAddress) {
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
