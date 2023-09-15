import { HTMLInputTypeAttribute } from "react";

export type Copy<T> = T extends infer K ? K extends T ? K : never : never; // Typescript horribleness that basically copies T into K so that T is inferred from the object keys and not the extends-Property
export type WithoutPrivate<T extends string> = T extends `${"."}${infer _}` ? never : T;

interface ButtonStyle {
    style: React.CSSProperties,
    hoverStyle?: React.CSSProperties,
    clickStyle?: React.CSSProperties
}

export interface ButtonVariantStyle<T extends string> extends ButtonStyle {
    extends?: Copy<T>
}

export interface GlideButtonConfig<T extends string> extends ButtonStyle {
    variants: Record<T, ButtonVariantStyle<T>>,
    defaultVariant: WithoutPrivate<Copy<T>>,
    loader: React.ReactNode
}

interface InputStyle {
    labelPosition: "outside-top" | "outside-left" | "inside-top" | "placeholder" | "none",
    labelStyle: React.CSSProperties,
    labelGap?: number,
    inputStyle: React.CSSProperties,
    errorStyle?: React.CSSProperties,
    errorGap?: number,
    errorComponent?: React.FunctionComponent<{ error: string }>,
}

export interface InputVariantStyle<T extends string> extends InputStyle {
    extends?: Copy<T>
}

export interface GlideInputConfig<T extends string> extends InputStyle {
    variants: Record<T, InputVariantStyle<T>>,
    defaultVariant: WithoutPrivate<Copy<T>>
}

export interface GlideConfig<T extends string, U extends string> {
    buttons: GlideButtonConfig<T>,
    inputs: GlideInputConfig<U>
}