import React, { createContext, useCallback, useContext } from "react";
import { FieldError, RegisterOptions, useController, useForm, useFormContext } from "react-hook-form";

const CheckboxListContext = createContext<{
    value: (string | number)[],
    toggle: (names: string | number | (string | number)[]) => void
} | null>(null);
export const useCheckboxList = () => useContext(CheckboxListContext);

const CheckboxErrorContext = createContext<FieldError | null>(null);
export const useCheckboxError = () => useContext(CheckboxErrorContext);

interface CheckboxListProps<T extends string | number> {
    name?: string,
    value?: T[],
    onChange?: (value: T[]) => void,
    options?: RegisterOptions,
    children: React.ReactNode
}

export function CheckboxList<T extends string | number>({
    name,
    value: externalValue,
    onChange: externalOnChange,
    options,
    children
}: CheckboxListProps<T>) {
    const {control: fallbackControl} = useForm();
    const form = useFormContext();
    const { field: { onChange: internalOnChange, value: internalValue }, fieldState: { error } } = 
        useController({ name: name ?? "", control: form?.control ?? fallbackControl, rules: options, defaultValue: [] });
    const value: T[] = form ? internalValue : externalValue;

    const onChange = useCallback((value: T[]) => {
        externalOnChange?.(value);
        internalOnChange?.(value);
    }, [externalOnChange, internalOnChange]);

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

    return (
        <CheckboxListContext.Provider value={{ value, toggle: handleToggle as any }}>
            <CheckboxErrorContext.Provider value={error ?? null}>
                {children}
            </CheckboxErrorContext.Provider>
        </CheckboxListContext.Provider>
    )
}