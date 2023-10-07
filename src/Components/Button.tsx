import { Clickable, ClickableProps } from "@enymo/react-clickable-router";
import { useDisabled, useLoading } from "@enymo/react-form-component";
import classNames from "classnames";
import React, { useCallback, useState } from "react";
import { Stylesheet } from "../Stylesheet";
import { ButtonVariantStyle, DefaultElementProps, GlideButtonConfig, WithoutPrivate } from "../types";

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

export interface ButtonProps<Variants extends string> extends ClickableProps {
    variant?: WithoutPrivate<Variants>,
    loading?: boolean,
    flex?: number
}

export default <Variants extends string, ElementProps extends DefaultElementProps>(config: GlideButtonConfig<Variants, ElementProps>) => {
    const glideClassName = `glide-button-${++glideCounter}`;
    const style = new Stylesheet();
    const rule = style.addRule(`.${glideClassName}`, config.style);
    rule.addRule("&:hover:not(.disabled)", config.hoverStyle);
    rule.addRule("&:active:not(.disabled)", config.clickStyle);
    rule.addRule("&.disabled", config.disabledStyle);
    rule.addRule(".loading-wrap", {
        padding: config.loaderPadding
    });

    const dependencies: {[variant: string]: string[]} = {}

    if (config.variants) {
        for (const variant of Object.keys(config.variants) as Variants[]) {
            if (variant[0] !== ".") {
                let cur: Variants | undefined = variant;
                while (cur) {
                    dependencies[cur] ??= [];
                    dependencies[cur].push(variant);
                    cur = config.variants[cur].extends
                }
            }
        }

        for (const [variant, variantConfig] of Object.entries<ButtonVariantStyle<Variants>>(config.variants)) {
            const variantRule = rule.addRule(dependencies[variant].map(variant => `&.${variant}`), variantConfig.style);
            variantRule.addRule("&:hover", variantConfig.hoverStyle);
            variantRule.addRule("&:active", variantConfig.clickStyle);
        }
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
        linkType,
        to,
        ...props
    }: ButtonProps<Variants> & ElementProps) => {
        const disabledContext = useDisabled();
        const loadingContext = useLoading();
        const [loadingState, setLoadingState] = useState(false);

        const disabled = disabledProp ?? loadingProp ?? loadingState ?? disabledContext ?? loadingContext ?? false;
        const loading = config.loader ? (loadingProp ?? (submit && loadingContext) ?? loadingState ?? false) : false;

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
                linkType={linkType}
                to={to}
                {...props}
            >
                <div className="content">
                    {config.element ? React.createElement(config.element, {children, variant, ...props} as ElementProps) : children}
                </div>
                <div className="loading-wrap">
                    {config.loader}
                </div>
            </Clickable>
        )
    }
}