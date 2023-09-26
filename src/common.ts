export function isNotNull<T>(value: T): value is NonNullable<T> {
    return value !== undefined && value !== null;
}

export function requireNotNull<T>(value: T, reason?: string): NonNullable<T> {
    if (isNotNull(value)) {
        return value;
    }
    throw new Error(reason ?? "Value cannot be null or undefined");
}