import { useDisabled } from "@enymo/react-form-component";
import classNames from "classnames";
import _ from "lodash";
import React, { useMemo } from "react";
import { RegisterOptions, useFormContext } from "react-hook-form";
import { useError } from "../Hooks/ErrorContext";
import { StyleRule, Stylesheet } from "../Stylesheet";
import { ChoiceStyle, GlideChoiceConfig } from "../types";
import { useCheckboxList } from "./CheckboxList";
import { useRadioGroup } from "./RadioGroup";

let glideCounter = 0;

interface ChoiceProps {
    /**
     * The name of the input. This is used to register the input with the form context. If the Choice is part of a CheckboxList or RadioGroup, this is not needed.
     */
    name?: string,
    /**
     * The value of the input. This is used to register the input with the CheckboxList or RadioGroup.
     */
    value?: string | number,
    /**
     * The children of the input. It will be rendered as the label of the input.
     */
    children?: React.ReactNode,
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
     * Whether the input is checked. Used for controlled inputs.
     */
    checked?: boolean,
    /**
     * The function that is called when the value of the input changes. Used for controlled inputs.
     */
    onChange?: (value: boolean) => void,
    /**
     * Whether the input is disabled. If not provided, the disabled state is taken from the form context.
     */
    disabled?: boolean,
    /**
     * The options for the react-hook-form register function.
     */
    options?: RegisterOptions,
    /**
     * The function that is called when the input is clicked.
     */
    onClick?: () => void,
}

function addChoiceRules(rule: StyleRule, styles: ChoiceStyle) {
    const inputRule = rule.addRule("input", {
        "display": "none",
    });
    const choiceWrapperRule = rule.addRule(".choice-wrapper", {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: styles.errorPosition == "inside" ? styles.errorGap : undefined,
        ...styles.wrapperStyle,
    });

    const labelWrapperRule = choiceWrapperRule.addRule(".label-wrapper", {
        display: "flex",
        gap: styles.childrenGap,
        flexDirection: styles.indicator?.childrenPosition === "left" ? "row-reverse" : "row",
        alignItems: styles.childrenVerticalAlignment,
        flex: 1,
    });

    labelWrapperRule.addRule(".label", {
        flex: 1,
        ...styles.labelStyle
    });
    const errorComponentRule = rule.addRule(".error-component", {
        display: "flex",
        flex: 1,
    });
    errorComponentRule.addRule("&.inside", {
        display: styles.errorPosition == "inside" ? "flex" : "none",
    });
    errorComponentRule.addRule("&.under", {
        display: styles.errorPosition == "under" ? "flex" : "none",
    });
    errorComponentRule.addRule(".input-error", styles.errorTextStyle);

    inputRule.addRule("&:checked  + .choice-wrapper", styles.selectedWrapperStyle);
    rule.addRule("&.disabled .choice-wrapper", styles.disabledWrapperStyle);
    rule.addRule("&:hover .choice-wrapper", styles.hoverWrapperStyle);
    rule.addRule("&.error .choice-wrapper", styles.errorWrapperStyle);

    if (styles.indicator) {
        const indicatorRule = labelWrapperRule.addRule(".indicator", {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            alignSelf: styles.indicator.alignment,
            ...styles.indicator.style,
        });

        indicatorRule.addRule(">*", {
            display: "none",
        });

        const inputCheckedRule = inputRule.addRule("&:checked + .choice-wrapper .indicator", styles.indicator.selectedStyle);
        inputCheckedRule.addRule(">*", {
            display: "flex",
        });

        rule.addRule("&.disabled .indicator", styles.indicator.disabledStyle);
        rule.addRule("&.error .indicator", styles.indicator.errorStyle);

    } else {
        labelWrapperRule.addRule(".indicator", {
            display: "none",
        });
    }
}

export default <LabelProps extends object>(configProp: GlideChoiceConfig<LabelProps>) => {
    const glideClassName = `glide-choice-${++glideCounter}`;
    const style = new Stylesheet();
    const config = {
        errorPosition: configProp.errorPosition ?? "inside",
        ...configProp,
    }
    const rule = style.addRule(`.${glideClassName}`, {
        display: "flex",
        flexDirection: "column",
        width: config.choiceWidth,
        height: config.choiceHeight,
        gap: config.errorPosition == "under" ? config.errorGap : undefined,
    });
    
    addChoiceRules(rule, config);

    if (config.responsive) {
        for (const { mode, width, ...styles } of config.responsive) {
            const responsiveRule = style.addMediaRule([{ mode, width }]);
            const rule = responsiveRule.addRule(`.${glideClassName}`, {
                display: "flex",
                flexDirection: "column",
                width: styles.choiceWidth,
                height: styles.choiceHeight,
                gap: styles.errorPosition == "under" ? styles.errorGap : undefined,
            });
            addChoiceRules(rule, {
                ...config,
                ...styles,
                indicator: config.indicator ? {
                    ...config.indicator,
                    ...styles.indicator,
                } : undefined,
            });
        }
    }

    style.apply();

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
        onClick,
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
            <label className={classNames(glideClassName, className, config.className, { error, disabled })} style={style}>
                <input
                    type={radioListContext ? "radio" : "checkbox"}
                    checked={checked}
                    onChange={handleChange}
                    onClick={onClick}
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
                    {error && <div className={classNames("error-component", "inside")}>{errorComponent}</div>}
                </div>
                {error && <div className={classNames("error-component", "under")}>{errorComponent}</div>}
            </label>
        )
    }
};