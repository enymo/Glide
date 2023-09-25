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

export default <LabelProps extends object>(config: GlideCheckboxConfig<LabelProps>) => {
    const glideClassName = `glide-checkbox-${++glideCounter}`;
    const style = new Stylesheet();
    const rule = style.addRule(`.${glideClassName}`);
    const inputRule = rule.addRule("input", {
        "display": "none",
    });
    const checkboxWrapperRule = rule.addRule(".checkbox-wrapper", {
        display: "flex",
        flexDirection: "column",
        gap: config.errorGap,
        ...config.wrapperStyle,
    });

    const labelWrapperRule = checkboxWrapperRule.addRule(".label-wrapper", {
        display: "flex",
        gap: config.labelGap,
    });

    labelWrapperRule.addRule(".label", {
        display: "flex",
        alignItems: config.labelVerticalAlignment,
        justifyContent: config.labelHorizontalAlignment,
        flex: 1,
    });
    rule.addRule(".input-error", config.errorTextStyle);

    inputRule.addRule("&:checked + .checkbox-wrapper", config.checkedWrapperStyle);
    rule.addRule("&.checked .checkbox-wrapper", config.checkedWrapperStyle);
    rule.addRule("&.disabled .checkbox-wrapper", config.disabledWrapperStyle);
    rule.addRule("&.error .checkbox-wrapper", config.errorWrapperStyle);

    if (config.checkmark) {
        const checkboxRule = labelWrapperRule.addRule(".checkbox", {
            display: config.checkmark ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            alignSelf: config.checkboxAlignment,
            ...config.checkboxStyle,
        });

        checkboxRule.addRule(".checkmark", {
            display: "none",
            alignItems: "center",
            justifyContent: "center",
        });

        const inputCheckedRule = inputRule.addRule("&:checked + .checkbox-wrapper .checkbox", config.checkedCheckboxStyle);
        inputCheckedRule.addRule(".checkmark", {
            display: "flex",
        });
        rule.addRule("&.checked .checkbox-wrapper .checkbox", config.checkedCheckboxStyle);
        rule.addRule("&.checked .checkbox-wrapper .checkbox .checkmark", { display: "block" });

        rule.addRule("&.disabled .checkbox", config.disabledCheckboxStyle);
        rule.addRule("&.error .checkbox", config.errorCheckboxStyle);

    } else {
        labelWrapperRule.addRule(".checkbox", {
            display: "none",
        });
    }

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
        ...props
    }: CheckboxProps & LabelProps) => {
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
            <label className={classNames(glideClassName, className, { error, disabled, checked })} style={style}>
                <input
                    type="checkbox"
                    name={name}
                    id={name}
                    checked={checked}
                    onChange={handleChange}
                    disabled={disabled}
                    {...register}
                />
                <div className="checkbox-wrapper">
                    <div className="label-wrapper">
                        <div className="checkbox"><div className="checkmark">{config.checkmark}</div></div>
                        {config.label ? (
                            React.createElement(config.label, props as LabelProps)
                        ): (<span className="label">{label}</span>)}
                    </div>
                    {error && (config.errorComponent ? (
                        React.createElement(config.errorComponent, { error: error })
                    ) : (
                        <span className="input-error">{error}</span>
                    ))}
                </div>
            </label>
        )
    }

};