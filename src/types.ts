
export type Copy<T> = T extends infer K ? K extends T ? K : never : never; // Typescript horribleness that basically copies T into K so that T is inferred from the object keys and not the extends-Property
export type WithoutPrivate<T extends string> = T extends `${"."}${infer _}` ? never : T;

interface ButtonStyle {
    style: React.CSSProperties,
    hoverStyle?: React.CSSProperties,
    clickStyle?: React.CSSProperties
}

export interface ButtonVariantStyle<Variants extends string> extends ButtonStyle {
    extends?: Copy<Variants>
}

export interface GlideButtonConfig<Variants extends string> extends ButtonStyle {
    variants?: Record<Variants, ButtonVariantStyle<Variants>>,
    defaultVariant?: WithoutPrivate<Copy<Variants>>,
    loader: React.ReactNode
}

interface InputStyle<InsidePrefixProps> {
    labelPosition: "outside-top" | "outside-left" | "inside-top" | "placeholder" | "none",
    labelStyle: React.CSSProperties,
    labelGap?: number,
    inputStyle: React.CSSProperties,
    errorStyle?: React.CSSProperties,
    errorGap?: number,
    errorComponent?: React.FunctionComponent<{ error: string }>,
    insidePrefix?: {
        border?: boolean,
        padding?: string,
        element?: React.FC<InsidePrefixProps>
    }
}

export interface InputVariantStyle<Variants extends string, InsidePrefixProps> extends InputStyle<InsidePrefixProps> {
    extends?: Copy<Variants>
}

export interface GlideInputConfig<Variants extends string, InsidePrefixProps> extends InputStyle<InsidePrefixProps> {
    variants?: Record<Variants, InputVariantStyle<Variants, InsidePrefixProps>>,
    defaultVariant?: WithoutPrivate<Copy<Variants>>
}

export interface GlideConfig<
    ButtonVariants extends string, 
    InputVariants extends string,
    InputInsidePrefixProps
> {
    buttons: GlideButtonConfig<ButtonVariants>,
    inputs: GlideInputConfig<InputVariants, InputInsidePrefixProps>
}