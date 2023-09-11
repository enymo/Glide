interface ButtonStyle {
    style: React.CSSProperties;
    hoverStyle?: React.CSSProperties;
    clickStyle?: React.CSSProperties;
}
interface ButtonVariantStyle<T extends string> extends ButtonStyle {
    extends?: T extends infer K ? K extends T ? K : never : never;
}
interface GlideButtonConfig<T extends string> extends ButtonStyle {
    variants: Record<T, ButtonVariantStyle<T>>;
    defaultVariant: T extends infer K ? K extends T ? K : never : never;
    loader: React.ReactNode;
}
interface GlideConfig<T extends string> {
    buttons: GlideButtonConfig<T>;
}

declare const createGlide: <T extends string>(config: GlideConfig<T>) => void;

export { createGlide };
