// @flow
/* global APP  */

import { PureComponent } from 'react';

import {
    getLocalParticipant,
    getParticipants
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
        let currentGroupParticipantName;
        const localParticipant = getLocalParticipant(APP.store.getState());
        const participantsList = getParticipants(APP.store.getState());

        for (let i = 0; i < messagesCount; i++) {
            const message = this.props.messages[i];
            const participant = participantsList.find(item => item.name === message.displayName);

            message.akAddress = participant.akAddress;

            if (message.displayName === currentGroupParticipantName) {
                currentGrouping.push(message);
            } else {
                currentGrouping.length && groups.push(currentGrouping);
                if (localParticipant.name === message.displayName) {
                    message.messageType = 'local';
                }
                currentGrouping = [ message ];
                currentGroupParticipantName = message.displayName;
            }
        }

        currentGrouping.length && groups.push(currentGrouping);

        return groups;
    }
}
