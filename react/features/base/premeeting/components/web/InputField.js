// @flow

import React, { PureComponent } from 'react';

import { getFieldValue } from '../../../react';

type Props = {

    /**
     * Class name to be appended to the default class list.
     */
    className?: string,

    /**
     * TestId of the button. Can be used to locate element when testing UI.
     */
    testId?: string,

    /**
     * Callback for the onChange event of the field.
     */
    onChange: Function,

    /**
     * Callback to be used when the user hits Enter in the field.
     */
    onSubmit?: Function,

    /**
     * Placeholder text for the field.
     */
    placeHolder: string,

    /**
     * The field type (e.g. text, password...etc).
     */
    type: string,

    /**
     * If user has wallet - disable input.
     */
    disabled: boolean,

    /**
     * Externally provided value.
     */
    value?: string
};

type State = {

    /**
     * True if the field is focused, false otherwise.
     */
    focused: boolean,

    /**
     * The current value of the field.
     */
    value: string
}

/**
 * Implements a pre-styled input field to be used on pre-meeting screens.
 */
export default class InputField extends PureComponent<Props, State> {
    static defaultProps: {
        className: '',
        type: 'text'
    };

    /**
     * Instantiates a new component.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            focused: false,
            value: props.value || ''
        };

        this._onBlur = this._onBlur.bind(this);
        this._onChange = this._onChange.bind(this);
        this._onFocus = this._onFocus.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
    }

    /**
     * Implements {@code PureComponent.getDerivedStateFromProps}.
     *
     * @inheritdoc
     */
    static getDerivedStateFromProps(props: Props, state: State) {
        const { value } = props;

        if (state.value !== value) {
            return {
                ...state,
                value
            };
        }

        return null;
    }

    /**
     * Implements {@code PureComponent#render}.
     *
     * @inheritdoc
     */
    render() {
        const { disabled, className, testId, placeHolder, type } = this.props;
        const { value, focused } = this.state;
        const { _onBlur, _onChange, _onFocus, _onKeyDown } = this;

        return (
            <input
                className = { `field ${focused ? 'focused' : ''} ${className || ''}` }
                data-testid = { testId ? testId : undefined }
                disabled = { disabled }
                onBlur = { _onBlur }
                onChange = { _onChange }
                onFocus = { _onFocus }
                onKeyDown = { _onKeyDown }
                placeholder = { placeHolder }
                type = { type }
                value = { value } />
        );
    }

    _onBlur: () => void;

    /**
     * Callback for the onBlur event of the field.
     *
     * @returns {void}
     */
    _onBlur() {
        this.setState({
            focused: false
        });
    }

    _onChange: Object => void;

    /**
     * Callback for the onChange event of the field.
     *
     * @param {Object} evt - The static event.
     * @returns {void}
     */
    _onChange(evt) {
        const value = getFieldValue(evt);

        this.setState({
            value
        });

        const { onChange } = this.props;

        onChange && onChange(value);
    }

    _onFocus: () => void;

    /**
     * Callback for the onFocus event of the field.
     *
     * @returns {void}
     */
    _onFocus() {
        this.setState({
            focused: true
        });
    }

    _onKeyDown: Object => void;

    /**
     * Joins the conference on 'Enter'.
     *
     * @param {Event} event - Key down event object.
     * @returns {void}
     */
    _onKeyDown(event) {
        const { onSubmit } = this.props;

        onSubmit && event.key === 'Enter' && onSubmit();
    }
}
