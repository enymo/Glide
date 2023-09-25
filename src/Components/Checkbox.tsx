import React, { useMemo } from "react";
import { RegisterOptions, useFormContext } from "react-hook-form";
import { Stylesheet } from "../Stylesheet";
import { GlideCheckboxConfig } from "../types";
import classNames from "classnames";
import { useDisabled } from "@enymo/react-form-component";
import _ from "lodash";
import { useCheckboxError, useCheckboxList } from "./CheckboxList";

let glideCounter = 0;

interface CheckboxProps {
    name?: string,
    label?: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
    error?: string,
    checked?: boolean,
    onChange?: (value: boolean) => void,
    disabled?: boolean,
    options?: RegisterOptions,
}

export default (config: GlideCheckboxConfig) => {
    const glideClassName = `glide-checkbox-${++glideCounter}`;
    const style = new Stylesheet();

    const rule = style.addRule(`.${glideClassName}`, {
        display: "flex",
        flexDirection: "column",
        gap: config.errorGap,
        ...config.wrapperStyle,
    });
    const labelWrapperRule = rule.addRule(`.label-wrapper`, {
        display: "flex",
        flexDirection: config.labelPosition === "left" ? "row-reverse" : "row",
        flex: "1",
        gap: config.labelGap,
        ...config.labelWrapperStyle,
    });
    labelWrapperRule.addRule('span', {
        alignSelf: config.labelAlignment,
        ...config.labelStyle
    });
    const inputRule = labelWrapperRule.addRule('input', {
        display: "none",
    });
    const checkboxRule = labelWrapperRule.addRule('.checkbox', {
        alignSelf: config.checkboxAlignment,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...config.style
    });

    checkboxRule.addRule('.checkmark', {
        display: "none",
    });

    inputRule.addRule('&:checked + div .checkmark', {
        display: "flex",
    });
    inputRule.addRule('&:checked + div.checkbox', config.checkedStyle);

    rule.addRule('.input-error', config.errorTextStyle);
    rule.addRule('&.error .checkbox', config.errorStyle);
    rule.addRule('&.disabled .checkbox', config.disabledStyle);
    rule.addRule('&.checked .checkbox', config.checkedStyle);

    style.apply();

    return ({
        name,
        label,
        className,
        style,
        checked: checkedProp,
        onChange: onChangeProp,
        disabled: disabledProp,
        error: errorProp,
        options,
    }: CheckboxProps) => {
        const listContext = useCheckboxList();
        const form = useFormContext();
        const disabledContext = useDisabled();
        const disabled = disabledProp ?? disabledContext ?? false;
        const errorContext = useCheckboxError();
        const error = errorProp ?? (
            name ? (errorContext ?? _.get(form?.formState.errors, name!))?.message as string : undefined
        );

        const { onChange: onChangeForm, ...register } = (name && form && !listContext) ? form.register(name, disabled ? undefined : options) : { onChange: undefined };
        const checked = useMemo(() => checkedProp ?? (name ? listContext?.value.includes(name!) : undefined), [checkedProp, listContext?.value, name]);

        const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
            onChangeProp?.(e.target.checked);
            name && listContext?.toggle(name);
            onChangeForm?.(e);
        }

        return (
            <div className={classNames(glideClassName, className, { error, disabled, checked })} style={style}>
                <label className="label-wrapper">
                    <input
                        type="checkbox"
                        name={name}
                        id={name}
                        checked={checked}
                        onChange={handleChange}
                        disabled={disabled}
                        {...register}
                    />
                    <div className="checkbox"><div className="checkmark">{config.checkmark}</div></div>
                    <span>{label}</span>
                </label>
                {error && (config.errorComponent ? (
                    React.createElement(config.errorComponent, { error: error })
                ) : (
                    <span className="input-error">{error}</span>
                ))}
            </div>
        )
    }

};