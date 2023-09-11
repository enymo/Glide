import { Clickable, ClickableProps } from "@enymo/react-clickable-router";
import { useDisabled, useLoading } from "@enymo/react-form-component";
import classNames from "classnames";
import React, { useCallback, useState } from "react";
import { Rule } from "../Stylesheet";
import { ButtonVariantStyle, GlideButtonConfig } from "../types";

interface ButtonProps<T extends string> extends ClickableProps {
    variant?: T,
    loading?: boolean,
    flex?: number
}

export default <T extends string>(config: GlideButtonConfig<T>, styleRule: Rule, glideClassName: string) => {
    styleRule.setStyle(config.style),
    styleRule.addRule("&:hover", config.hoverStyle);
    styleRule.addRule("&:active", config.clickStyle);

    const dependencies: {[variant: string]: string[]} = {}

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

    for (const [variant, variantConfig] of Object.entries<ButtonVariantStyle<T>>(config.variants)) {
        const rule = new Rule(dependencies[variant], variantConfig.style);
        rule.addRule("&:hover", variantConfig.hoverStyle);
        rule.addRule("&:active", variantConfig.clickStyle);
    }

    return ({
        className,
        variant = config.defaultVariant,
        loading: loadingProp,
        disabled: disabledProp,
        submit,
        onClick,
        flex,
        style,
        children,
        ...props
    }: ButtonProps<T>) => {
        const disabledContext = useDisabled();
        const loadingContext = useLoading();
        const [loadingState, setLoadingState] = useState(false);

        const disabled = disabledProp ?? loadingProp ?? loadingState ?? disabledContext ?? loadingContext ?? false;
        const loading = loadingProp ?? (submit && loadingContext) ?? loadingState;

        const handleClick: React.MouseEventHandler = useCallback(async e => {
            setLoadingState(true);
            await onClick?.(e);
            setLoadingState(false);
        }, [setLoadingState, onClick]);

        return (
            <Clickable
                className={classNames("glide-button", glideClassName, variant, className, {loading})}
                disabled={disabled}
                submit={submit}
                onClick={handleClick}
                style={{flex, ...style}}
                {...props}
            >
                <div className="content">
                    {children}
                </div>
                <div className="loading-wrap">
                    {config.loader}
                </div>
            </Clickable>
        )
    }
}