import React, { useMemo } from "react";
import { RegisterOptions, useFormContext } from "react-hook-form";
import { Stylesheet } from "../Stylesheet";
import { GlideChoiceConfig } from "../types";
import classNames from "classnames";
import { useDisabled } from "@enymo/react-form-component";
import _ from "lodash";
import { useCheckboxList } from "./CheckboxList";
import { useRadioGroup } from "./RadioGroup";
import { requireNotNull } from "../common";
import { useError } from "../Hooks/ErrorContext";

let glideCounter = 0;

interface ChoiceProps {
    name?: string,
    value?: string | number,
    children?: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
    error?: string,
    checked?: boolean,
    onChange?: (value: boolean) => void,
    disabled?: boolean,
    options?: RegisterOptions,
}

export default <LabelProps extends object>({
    errorPosition = "inside",
    ...config
}: GlideChoiceConfig<LabelProps>) => {
    const glideClassName = `glide-choice-${++glideCounter}`;
    const style = new Stylesheet();
    const rule = style.addRule(`.${glideClassName}`, errorPosition == "under" ? {
        display: "flex",
        flexDirection: "column",
        gap: config.errorGap,
    } : {});
    const inputRule = rule.addRule("input", {
        "display": "none",
    });
    const choiceWrapperRule = rule.addRule(".choice-wrapper", {
        display: "flex",
        flexDirection: "column",
        gap: errorPosition == "inside" ? config.errorGap : undefined,
        ...config.wrapperStyle,
    });

    const labelWrapperRule = choiceWrapperRule.addRule(".label-wrapper", {
        display: "flex",
        gap: config.childrenGap,
        flexDirection: config.indicator?.childrenPosition === "left" ? "row-reverse" : "row",
    });

    labelWrapperRule.addRule(".label", {
        display: "flex",
        alignItems: config.childrenVerticalAlignment,
        justifyContent: config.childrenHorizontalAlignment,
        flex: 1,
    });
    rule.addRule(".input-error", config.errorTextStyle);

    inputRule.addRule("&:checked  + .choice-wrapper", config.selectedWrapperStyle);
    rule.addRule("&.disabled .choice-wrapper", config.disabledWrapperStyle);
    rule.addRule("&.error .choice-wrapper", config.errorWrapperStyle);

    if (config.indicator) {
        const indicatorRule = labelWrapperRule.addRule(".indicator", {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            alignSelf: config.indicator.alignment,
            ...config.indicator.style,
        });

        indicatorRule.addRule(">*", {
            display: "none",
        });

        const inputCheckedRule = inputRule.addRule("&:checked + .choice-wrapper .indicator", config.indicator.selectedStyle);
        inputCheckedRule.addRule(">*", {
            display: "flex",
        });

        rule.addRule("&.disabled .indicator", config.indicator.disabledStyle);
        rule.addRule("&.error .indicator", config.indicator.errorStyle);

    } else {
        labelWrapperRule.addRule(".indicator", {
            display: "none",
        });
    }

    style.apply();
    /**
     * If type is "radio", then RadioList required for intended function.
     */
    return ({
        name,
        value,
        children,
        className,
        style,
        checked: checkedProp,
        onChange: onChangeProp,
        disabled: disabledProp,
        error: errorProp,
        options,
        ...props
    }: ChoiceProps & LabelProps) => {
        const radioListContext = useRadioGroup();
        const checkboxListContext = useCheckboxList();
        const listContext = checkboxListContext ?? radioListContext;
        const form = useFormContext();
        const disabledContext = useDisabled();
        const disabled = disabledProp ?? disabledContext ?? false;
        const errorContext = useError();
        const error = errorProp ?? errorContext ?? (name && _.get(form?.formState.errors, name)?.message as string);

        const { onChange: onChangeForm, ...register } = (name && form && !listContext) ? form.register(name, disabled ? undefined : options) : { onChange: undefined };

        const checked = checkedProp ?? ( listContext && value ? (
            Array.isArray(listContext.value) ? listContext.value.includes(value) : listContext.value === value
        ) : undefined);

        const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
            onChangeProp?.(e.target.checked);
            value && listContext?.toggle(value);
            onChangeForm?.(e);
        }

        const errorComponent = useMemo(() => (
            error && (config.errorComponent ? (
                React.createElement(config.errorComponent, { error: error })
            ) : (
                <span className="input-error">{error}</span>
            ))
        ), [error, config.errorComponent])

        return (
            <label className={classNames(glideClassName, className, { error, disabled })} style={style}>
                <input
                    type={radioListContext ? "radio" : "checkbox"}
                    checked={checked}
                    onChange={handleChange}
                    disabled={disabled}
                    {...register}
                />
                <div className="choice-wrapper">
                    <div className="label-wrapper">
                        {config.indicator && <div className="indicator">{config.indicator.element}</div>}
                        {config.element ? (
                            React.createElement(config.element, props as LabelProps)
                        ) : (<span className="label">{children}</span>)}
                    </div>
                    {errorPosition == "inside" && errorComponent}
                </div>
                {errorPosition == "under" && errorComponent}
            </label>
        )
    }
};