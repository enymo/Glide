import useHybridInput from "@enymo/react-hybrid-input-hook";
import React, { createContext, useContext } from "react";
import { RegisterOptions } from "react-hook-form";
import { ErrorProvider } from "../Hooks/ErrorContext";
import { Stylesheet } from "../Stylesheet";
import { GlideChoiceGroupConfig } from "../types";
import classNames from "classnames";

let glideCounter = 0;

const Context = createContext<{
    value: (string | number)[],
    toggle: (names: string | number | (string | number)[]) => void
} | null>(null);
export const useCheckboxList = () => useContext(Context);

interface CheckboxListProps<T extends string | number> {
    name?: string,
    value?: T[],
    onChange?: (value: T[]) => void,
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
    })

    rule.addRule(".error", config.errorStyle);

    style.apply();

    return <T extends string | number>({
        name,
        value: externalValue,
        onChange: externalOnChange,
        className,
        options,
        children,
        handlesError,
        gap,
        flexDirection,
        error: errorProp,
    }: CheckboxListProps<T>) => {
        const {value, onChange, error: formError} = useHybridInput({name, externalValue, externalOnChange, options, defaultValue: []});

        const error = errorProp ?? formError?.message;

        const handleToggle = (names: T | T[]) => {
            const add: T[] = [];
            const remove: T[] = [];
            for (const name of Array.isArray(names) ? names : [names]) {
                if (value.includes(name)) {
                    remove.push(name);
                }
                else {
                    add.push(name);
                }
            }
            onChange([...value.filter(value => !remove.includes(value)), ...add]);
        }

        const content = (
            <Context.Provider value={{ value, toggle: handleToggle as any }}>
                <ErrorProvider value={handlesError ? undefined : error}>
                    {children}
                </ErrorProvider>
            </Context.Provider>
        );

        if (handlesError) {
            return (
                <div className={classNames(glideClassName, className)}>
                    <div style={{ gap, flexDirection }}>
                        {content}
                    </div>
                    {error && (
                        config.errorComponent ? (
                            React.createElement(config.errorComponent, { error: error })
                        ) : <span className="error">{errorProp ?? error}</span>
                    )}
                </div>
            )
        }

        return content;
    }
}