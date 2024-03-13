import useHybridInput from "@enymo/react-hybrid-input-hook";
import classNames from "classnames";
import React, { createContext, useContext } from "react";
import { RegisterOptions } from "react-hook-form";
import { ErrorProvider } from "../Hooks/ErrorContext";
import { Stylesheet } from "../Stylesheet";
import { GlideChoiceGroupConfig } from "../types";

let glideCounter = 0;

const Context = createContext<{
    value: string | number,
    toggle: (id: string | number) => void
} | null>(null);
export const useRadioGroup = () => useContext(Context);

interface RadioButtonListProps<T extends string | number> {
    name?: string,
    value?: T,
    onChange?: (value: T) => void,
    options?: RegisterOptions,
    children: React.ReactNode,
    handlesError?: boolean,
    gap?: string,
    className?: string,
    flexDirection?: "row" | "column",
    error?: string,
}

export default (config: GlideChoiceGroupConfig) => {
    const glideClassName = `glide-choice-group-${++glideCounter}`;
    const style = new Stylesheet();

    const rule = style.addRule(`.${glideClassName}`, {
        display: "flex",
        flexDirection: "column",
        gap: config.errorGap,
    });

    rule.addRule(">div:first-child", {
        display: "flex",
        flexDirection: config.flexDirection ?? "column",
        ...config.style
    })

    rule.addRule(".error", config.errorStyle);

    style.apply(config.debug);

    return <T extends string | number>({
        name,
        className,
        value: externalValue,
        onChange: externalOnChange,
        options,
        children,
        handlesError,
        gap,
        flexDirection,
        error: errorProp
    }: RadioButtonListProps<T>) => {
        const {value, onChange, error: formError } = useHybridInput({name, externalValue, externalOnChange, options});
        const error = errorProp ?? formError?.message;

        const content = (
            <Context.Provider value={{ value, toggle: onChange as any }}>
                <ErrorProvider value={handlesError ? undefined : error}>
                    {children}
                </ErrorProvider>
            </Context.Provider>
        );

        if (handlesError) {
            return (
                <div className={classNames(glideClassName, className)}>
                    <div style={{gap, flexDirection }}>
                        {content}
                    </div>
                    {error && (
                        config.errorComponent ? (
                            React.createElement(config.errorComponent, { error })
                        ) : <span className="error">{error}</span>
                    )}
                </div>
            )
        }

        return content;
    }
}