export type FormatCheck =
    {result: 'ok'} | {result: 'ignored'} | {result: 'mismatch'; actual: number}

export function checkFormat(buffer: Buffer, expectedFormat: number): FormatCheck {
    if (buffer.length < 2) return {result: 'ignored'}
    const actual = buffer.readUInt16LE(0)
    return actual === expectedFormat ? {result: 'ok'} : {result: 'mismatch', actual}
}
