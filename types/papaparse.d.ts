declare module 'papaparse' {
  export interface ParseConfig {
    header?: boolean
    skipEmptyLines?: boolean
    complete?: (results: ParseResult<any>) => void
    error?: (error: Error) => void
  }

  export interface ParseResult<T> {
    data: T[]
    errors: any[]
    meta: {
      delimiter: string
      linebreak: string
      aborted: boolean
      truncated: boolean
      cursor: number
    }
  }

  export function parse(
    csv: string,
    config?: ParseConfig
  ): void
}
