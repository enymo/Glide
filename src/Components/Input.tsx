import React, { HTMLInputTypeAttribute } from "react";
import classNames from "classnames";
import { Rule, Stylesheet } from "../Stylesheet";
import { GlideInputConfig, WithoutPrivate } from "../types";

let glideCounter = 0;

export type InputProps<InsidePrefixProps> = {
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
    type: HTMLInputTypeAttribute | "textarea",
} & InsidePrefixProps

export default <InsidePrefixProps extends object>(config: GlideInputConfig<InsidePrefixProps>) => {
    const glideClassName = `glide-input-${++glideCounter}`;
    const style = new Stylesheet();
    const rule = style.addRule(`.${glideClassName}`, {
        display: "flex",
        flexDirection: "column",
        ...config.inputStyle,
    });

    style.apply();

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
        type,
        ...props
    }: InputProps<InsidePrefixProps>) => {

        return (
            <div className={classNames(glideClassName, className)}>
                {label && config.labelPosition == "outside-top" && (
                    <span className={classNames("input-label", "top-label")}>{label}</span>
                )}
                <div className="input-wrap">
                    {config.insidePrefix?.element && React.createElement(config.insidePrefix.element, props as InsidePrefixProps)}
                </div>
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