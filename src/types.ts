export type WithoutPrivate<T extends string> = T extends `${"."}${infer _}` ? never : T;

interface ButtonStyle {
    style: React.CSSProperties,
    hoverStyle?: React.CSSProperties,
    clickStyle?: React.CSSProperties
}

export interface ButtonVariantStyle<T extends string> extends ButtonStyle {
    extends?: T extends infer K ? K extends T ? K : never : never // Typescript horribleness that basically copies T into K so that T is inferred from the object keys and not the extends-Property
}

export interface GlideButtonConfig<T extends string> extends ButtonStyle {
    variants: Record<T, ButtonVariantStyle<T>>,
    defaultVariant: T extends infer K ? K extends T ? K : never : never // See above,
    loader: React.ReactNode
}

export interface GlideConfig<T extends string> {
    buttons: GlideButtonConfig<T>
}