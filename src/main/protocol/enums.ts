export type EnumObject = Readonly<Record<string, number>>

export type EnumValue<E extends EnumObject> = E[keyof E]

export function enumLabel(enumObject: EnumObject, value: number): string | undefined {
    return Object.keys(enumObject).find((name) => enumObject[name] === value)
}

export function hasFlag(value: number, flag: number): boolean {
    return (value & flag) !== 0
}
