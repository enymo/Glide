import React, { HTMLInputTypeAttribute } from "react";
import classNames from "classnames";
import { Rule } from "../Stylesheet";
import { GlideInputConfig, InputVariantStyle, WithoutPrivate } from "../types";

export interface InputProps<T extends string> {
    name?: string,
    label?: string,
    className?: string,
    style?: React.CSSProperties,
    error?: string,
    placeholder?: string,
    value?: string,
    onChange?: (value: string) => void,
    disabled?: boolean
    flex?: number,
    variant?: WithoutPrivate<T>,
    type: HTMLInputTypeAttribute | "textarea",
}

export default <T extends string>(config: GlideInputConfig<T>, styleRule: Rule, glideClassName: string) => {
    styleRule.setStyle({
        display: "flex",
        flexDirection: "column",
        ...config.inputStyle,
    });


    const dependencies: { [variant: string]: string[] } = {}

    for (const variant of Object.keys(config.variants) as T[]) {
        if (variant[0] !== ".") {
            let cur: T | undefined = variant;
            while (cur) {
                dependencies[cur] ??= [];
                dependencies[cur].push(variant);
                cur = config.variants[cur].extends
            }
        }
    }
    console.log(dependencies);

    for (const [variant, variantConfig] of Object.entries<InputVariantStyle<T>>(config.variants)) {
        const dependencyString = "&." + dependencies[variant].join(", &.");
        styleRule.addRule(dependencyString, variantConfig.inputStyle);
        styleRule.addRule(dependencyString + " .input-label", variantConfig.labelStyle);
    }

    // for (const [variant, variantConfig] of Object.entries<InputVariantStyle<T>>(config.variants)) {
    //     const inputStyles = dependencies[variant].map((v) => config.variants[v as T].inputStyle);
    //     const labelStyles = dependencies[variant].map((v) => config.variants[v as T].labelStyle);
    //     const rule = styleRule.addRule(`&.${variant}`, {
    //         ...inputStyles.reduce((acc, cur) => ({ ...acc, ...cur }), {}),
    //     });
    //     rule.addRule(".input-label", {
    //         ...labelStyles.reduce((acc, cur) => ({ ...acc, ...cur }), {}),
    //     });
    // }

    return ({
        name,
        label,
        className,
        style,
        error,
        placeholder,
        value,
        onChange,
        disabled,
        flex,
        variant = config.defaultVariant,
        type,
    }: InputProps<T>) => {

        const configVariant = config.variants[variant];

        return (
            <div className={classNames(glideClassName, variant, className)}>
                {label && configVariant.labelPosition == "outside-top" && (
                    <span className={classNames("input-label", "top-label")}>{label}</span>
                )}
                {type == "textarea" ? (
                    <textarea
                        className={classNames("input", {error})}
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        onChange={e => onChange?.(e.target.value)}
                        disabled={disabled}
                    />
                ) : (
                    <input
                        className={classNames("input", {error})}
                        type={type}
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        onChange={e => onChange?.(e.target.value)}
                        disabled={disabled}
                    />
                )}
            </div>
        )
    }

}