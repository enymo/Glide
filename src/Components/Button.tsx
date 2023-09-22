import { Clickable, ClickableProps } from "@enymo/react-clickable-router";
import { useDisabled, useLoading } from "@enymo/react-form-component";
import classNames from "classnames";
import React, { useCallback, useState } from "react";
import { Stylesheet } from "../Stylesheet";
import { ButtonVariantStyle, GlideButtonConfig, WithoutPrivate } from "../types";

const globalStyle = new Stylesheet();

const buttonRule = globalStyle.addRule(".glide-button", {
    position: "relative"
});
buttonRule.addRule(".loading-wrap", {
    display: "none",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
});

const loadingButtonRule = globalStyle.addRule("&.loading");
loadingButtonRule.addRule(".content", {
    visibility: "hidden"
});
loadingButtonRule.addRule(".loading-wrap", {
    display: "flex"
});

globalStyle.apply();

let glideCounter = 0;

export interface ButtonProps<T extends string> extends ClickableProps {
    variant?: WithoutPrivate<T>,
    loading?: boolean,
    flex?: number
}

export default <T extends string>(config: GlideButtonConfig<T>) => {
    const glideClassName = `glide-button-${++glideCounter}`;
    const style = new Stylesheet();
    const rule = style.addRule(`.${glideClassName}`, config.style);
    rule.addRule("&:hover", config.hoverStyle);
    rule.addRule("&:active", config.clickStyle);
    rule.addRule(".loader-wrap", {
        padding: config.loaderPadding
    });

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
        const variantRule = rule.addRule(dependencies[variant].map(variant => `&.${variant}`), variantConfig.style);
        variantRule.addRule("&:hover", variantConfig.hoverStyle);
        variantRule.addRule("&:active", variantConfig.clickStyle);
    }

    style.apply();

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