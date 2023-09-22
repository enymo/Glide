
export type Copy<T> = T extends infer K ? K extends T ? K : never : never; // Typescript horribleness that basically copies T into K so that T is inferred from the object keys and not the extends-Property
export type WithoutPrivate<T extends string> = T extends `${"."}${infer _}` ? never : T;

interface ButtonStyle {
    style?: React.CSSProperties,
    hoverStyle?: React.CSSProperties,
    clickStyle?: React.CSSProperties
}

export interface ButtonVariantStyle<Variants extends string> extends ButtonStyle {
    extends?: Copy<Variants>
}

export interface GlideButtonConfig<Variants extends string> extends ButtonStyle {
    variants: Record<Variants, ButtonVariantStyle<Variants>>,
    defaultVariant: WithoutPrivate<Copy<Variants>>,
    loader: React.ReactNode,
    loaderPadding?: string
}

export interface GlideInputConfig<PrefixProps, SuffixProps> {
    /**
     * The style of the input wrapper. This is what you would normally use to style the input.
     */
    style: React.CSSProperties,
    /**
     * The padding around the input itself.
     */
    inputPadding?: string,
    /**
     * The style of the input wrapper in case of an error.
     */
    errorStyle?: React.CSSProperties,
    /**
     * The style of the input wrapper in case of focus.
     */
    focusStyle?: React.CSSProperties,
    /**
     * The style of the input wrapper in case of hover.
     */
    hoverStyle?: React.CSSProperties,
    /**
     * The style of the input wrapper in case the input is disabled.
     */
    disabledStyle?: React.CSSProperties,
    /**
     * The style of the placeholder.
     */
    placeholderStyle?: React.CSSProperties,
    /**
     * The position of the label.
     * - `outside-top`: The label is above the input.
     * - `outside-left`: The label is to the left of the input.
     * - `inside-top`: The label is inside the input, above the input text.
     * - `placeholder`: The label is inside the input, as a placeholder.
     */
    labelPosition: "outside-top" | "outside-left" | "inside-top" | "placeholder" | "none",
    /**
     * The style of the label.
     */
    labelStyle: React.CSSProperties,
    /**
     * The gap between the label and the input. Does not apply to `placeholder`. In case of `inside-top`, it is advised to use `inputPadding` instead.
     */
    labelGap?: string,
    /**
     * The style of the error text. It is displayed below the input.
     */
    errorTextStyle?: React.CSSProperties,
    /**
     * The gap between the input and the error text.
     */
    errorGap?: string,
    /**
     * A custom component to display the error. It is passed the error as a prop.
     */
    errorComponent?: React.FC<{ error: string }>,
    /**
     * The prefix component. It is displayed inside the input-wrapper, to the left of the input.
     * 
     * The props of the passed component are added to the props of the `Input` component.
     */
    prefix?: React.FC<PrefixProps>,
    /**
     * The suffix component. It is displayed inside the input-wrapper, to the right of the input.
     * 
     * The props of the passed component are added to the props of the `Input` component.
     */
    suffix?: React.FC<SuffixProps>,
}