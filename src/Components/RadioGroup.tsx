import useHybridInput from "@enymo/react-hybrid-input-hook";
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
        flexDirection: "column",
    })

    rule.addRule(".error", config.errorStyle);

    style.apply();

    return <T extends string | number>({
        name,
        value: externalValue,
        onChange: externalOnChange,
        options,
        children,
        handlesError,
        gap,
    }: RadioButtonListProps<T>) => {
        const {value, onChange, error} = useHybridInput({name, externalValue, externalOnChange, options});

        const content = (
            <Context.Provider value={{ value, toggle: onChange as any }}>
                <ErrorProvider value={handlesError ? undefined : error?.message}>
                    {children}
                </ErrorProvider>
            </Context.Provider>
        );

        if (handlesError) {
            return (
                <div className={glideClassName}>
                    <div style={{ gap }}>
                        {content}
                    </div>
                    {error?.message && (
                        config.errorComponent ? (
                            React.createElement(config.errorComponent, { error: error.message })
                        ) : <span className="error">{error.message}</span>
                    )}
                </div>
            )
        }

        return content;
    }
}