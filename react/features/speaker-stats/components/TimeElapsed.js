/* @flow */

import React, { Component } from 'react';

import { translate } from '../../base/i18n';

/**
 * The type of the React {@code Component} props of {@link TimeElapsed}.
 */
type Props = {

    /**
     * The function to translate human-readable text.
     */
    t: Function,

    /**
     * The milliseconds to be converted into a human-readable format.
     */
    time: number,

    /**
     * Parent component
     */
    parent?: string
};

/**
 * React component for displaying total time elapsed. Converts a total count of
 * milliseconds into a more humanized form: "# hours, # minutes, # seconds".
 * With a time of 0, "0s" will be displayed.
 *
 * @extends Component
 */
class TimeElapsed extends Component<Props> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { time, parent } = this.props;
        const hours = _getHoursCount(time);
        const minutes = _getMinutesCount(time);
        const seconds = _getSecondsCount(time);
        const timeElapsed = [];

        if (hours) {
            const hourPassed
                = this._createTimeDisplay(hours, 'speakerStats.hours', 'hours');

            timeElapsed.push(hourPassed);
        }

        if (hours || minutes) {
            const minutesPassed
                = this._createTimeDisplay(
                    minutes,
                    'speakerStats.minutes',
                    'minutes');

            timeElapsed.push(minutesPassed);
        }

        const secondsPassed
            = this._createTimeDisplay(
                seconds,
                'speakerStats.seconds',
                'seconds');

        timeElapsed.push(secondsPassed);

        const subjectTime = parent === 'subject' && _getSubjectTime(seconds, minutes);

        return (
            <div className = 'time' >
                { subjectTime || timeElapsed }
            </div>
        );
    }

    /**
     * Returns a ReactElement to display the passed in count and a count noun.
     *
     * @private
     * @param {number} count - The number used for display and to check for
     * count noun plurality.
     * @param {string} countNounKey - Translation key for the time's count noun.
     * @param {string} countType - What is being counted. Used as the element's
     * key for react to iterate upon.
     * @returns {ReactElement}
     */
    _createTimeDisplay(count, countNounKey, countType) {
        const { t } = this.props;

        return (
            <span key = { countType } >
                { t(countNounKey, { count }) }
            </span>
        );
    }
}

export default translate(TimeElapsed);

/**
 * Counts how many whole hours are included in the given time total.
 *
 * @param {number} milliseconds - The millisecond total to get hours from.
 * @private
 * @returns {number}
 */
function _getHoursCount(milliseconds) {
    return Math.floor(milliseconds / (60 * 60 * 1000));
}

/**
 * Counts how many whole minutes are included in the given time total.
 *
 * @param {number} milliseconds - The millisecond total to get minutes from.
 * @private
 * @returns {number}
 */
function _getMinutesCount(milliseconds) {
    return Math.floor(milliseconds / (60 * 1000) % 60);
}

/**
 * Counts how many whole seconds are included in the given time total.
 *
 * @param {number} milliseconds - The millisecond total to get seconds from.
 * @private
 * @returns {number}
 */
function _getSecondsCount(milliseconds) {
    return Math.floor(milliseconds / 1000 % 60);
}

/**
 * Get time for Subject.
 *
 * @param {number} seconds - The seconds from millisecond.
 * @param {number} minutes - The minutes from millisecond..
 * @private
 * @returns {string}
 */
function _getSubjectTime(seconds, minutes) {
    const newSec = seconds.toString().length === 1 ? `0${seconds}` : seconds;
    const newMin = minutes.toString().length === 1 ? `0${minutes}` : minutes;

    return `${newMin}:${newSec}`;
}
