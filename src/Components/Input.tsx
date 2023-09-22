import { useDisabled } from "@enymo/react-form-component";
import classNames from "classnames";
import _ from "lodash";
import React, { HTMLInputTypeAttribute, useCallback, useRef } from "react";
import { RegisterOptions, useFormContext } from "react-hook-form";
import { Stylesheet } from "../Stylesheet";
import { GlideInputConfig } from "../types";

let glideCounter = 0;

export type InputProps<PrefixProps, SuffixProps> = {
    /**
     * The name of the input. This is used to register the input with the form context.
     */
    name?: string,
    /**
     * The label of the input.
     */
    label?: string,
    /**
     * The class name of the input. It is appended to the default class name.
     */
    className?: string,
    /**
     * The style of the input. It is merged with the default style.
     */
    style?: React.CSSProperties,
    /**
     * The error the input should show. If not provided, the error is taken from the form context.
     */
    error?: string,
    /**
     * The placeholder of the input.
     */
    placeholder?: string,
    /**
     * The value of the input. Used for controlled inputs.
     */
    value?: string,
    /**
     * The function that is called when the value of the input changes. Used for controlled inputs.
     */
    onChange?: (value: string) => void,
    /**
     * Whether the input is disabled. If not provided, the disabled state is taken from the form context.
     */
    disabled?: boolean,
    /**
     * The flex value of the input.
     */
    flex?: number,
    /**
     * The type of the input. Defaults to "text".
     */
    type?: HTMLInputTypeAttribute | "textarea",
    /**
     * The options for the react-hook-form register function.
     */
    options?: RegisterOptions,
} & PrefixProps & SuffixProps;

export default <PrefixProps extends object, SuffixProps extends object>(config: GlideInputConfig<PrefixProps, SuffixProps>) => {
    const glideClassName = `glide-input-${++glideCounter}`;
    const style = new Stylesheet();
    const rule = style.addRule(`.${glideClassName}`, {
        display: "flex",
        flexDirection: "column",
    });

    const inputRowRule = rule.addRule(".input-row", {
        display: "flex",
        alignItems: "center",
    });
    const inputWrapRule = inputRowRule.addRule(".input-wrap", {
        display: "flex",
        flex: 1,
        alignItems: "stretch",
        cursor: "text",
        ...config.style
    });
    const inputLabelWrapRule = inputWrapRule.addRule(".inside-label-wrap", {
        display: "flex",
        flex: 1,
        flexDirection: "column",
    });
    inputLabelWrapRule.addRule(".input", {
        border: "none",
        outline: "none",
        padding: config.inputPadding ?? "0",
        backgroundColor: "transparent",
    });
    inputLabelWrapRule.addRule(".input::placeholder", config.labelPosition == "placeholder" ? config.labelStyle : config.placeholderStyle);
    
    inputWrapRule.addRule("&:hover", config.hoverStyle);
    inputWrapRule.addRule("&:focus-within:not(.error)", config.focusStyle);
    inputWrapRule.addRule("&.error", config.errorStyle);
    inputWrapRule.addRule("&.disabled", config.disabledStyle);

    const inputLabelRule = rule.addRule(".input-label", config.labelStyle);
    inputLabelRule.addRule("&.outside-top-label", {
        marginBottom: config.labelGap,
    });
    inputLabelRule.addRule("&.outside-left-label", {
        marginRight: config.labelGap,
    });
    inputLabelRule.addRule("&.inside-top-label", {
        marginBottom: config.labelGap,
    });

    rule.addRule(".input-error", {
        marginTop: config.errorGap,
        ...config.errorTextStyle
    });

    style.apply();

    return ({
        name,
        label,
        className,
        style,
        flex,
        placeholder,
        value,
        onChange,
        disabled: disabledProp,
        error: errorProp,
        type = "text",
        options,
        ...props
    }: InputProps<PrefixProps, SuffixProps>) => {

        const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>();
        const handleWrapperClick = useCallback(() => inputRef.current?.focus(), [inputRef]);
        
        const form = useFormContext();
        const disabledContext = useDisabled();
        const disabled = disabledProp ?? disabledContext ?? false;
        const error = errorProp ?? name ? _.get(form?.formState.errors, name!)?.message as string : undefined;

        const { ref: registerRef, ...register } = name && form ? form.register(name, disabled ? undefined : options) : { ref: undefined };

        return (
            <div className={classNames(glideClassName, className)} style={{ flex, ...style }}>
                {label && config.labelPosition == "outside-top" && (
                    <span className={classNames("input-label", "outside-top-label")}>{label}</span>
                )}
                <div className="input-row">
                    {label && config.labelPosition == "outside-left" && (
                        <span className={classNames("input-label", "outside-left-label")}>{label}</span>
                    )}
                    <div className={classNames("input-wrap", { error, disabled })} onClick={handleWrapperClick}>
                        {config.prefix && React.createElement(config.prefix, props as PrefixProps)}
                        <div className="inside-label-wrap">
                            {label && config.labelPosition == "inside-top" && (
                                <span className={classNames("input-label", "inside-top-label")}>{label}</span>
                            )}
                            {React.createElement(type == "textarea" ? "textarea" : "input", {
                                ref: (e: HTMLInputElement | HTMLTextAreaElement) => {
                                    registerRef?.(e);
                                    inputRef.current = e;
                                },
                                className: classNames("input", { error }),
                                type,
                                name,
                                placeholder: config.labelPosition == "placeholder" ? label : placeholder,
                                value,
                                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange?.(e.target.value),
                                disabled,
                                ...register,
                            })}
                        </div>
                        {config.suffix && React.createElement(config.suffix, props as SuffixProps)}
                    </div>
                </div>
                {error && (config.errorComponent ? (
                    React.createElement(config.errorComponent, { error: error })
                ) : (
                    <span className="input-error">{error}</span>
                ))}
            </div>
        )
    }

}