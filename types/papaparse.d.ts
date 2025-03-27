declare module 'papaparse' {
  export interface ParseConfig {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    dynamicTyping?: boolean;
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean | string;
    step?: (results: ParseResult<any>, parser: Parser) => void;
    complete?: (results: ParseResult<any>, file: File) => void;
    error?: (error: Error, file: File) => void;
    download?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    fastMode?: boolean;
    withCredentials?: boolean;
    delimitersToGuess?: string[];
    transform?: (value: string, field: string | number) => any;
  }

  export interface ParseResult<T> {
    data: T[];
    errors: Array<{
      type: string;
      code: string;
      message: string;
      row: number;
      index: number;
    }>;
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      fields?: string[];
      truncated: boolean;
    };
  }

  export interface Parser {
    abort: () => void;
  }

  export interface UnparseConfig {
    quotes?: boolean | boolean[] | ((value: any) => boolean);
    quoteChar?: string;
    escapeChar?: string;
    delimiter?: string;
    header?: boolean;
    newline?: string;
    skipEmptyLines?: boolean;
    columns?: string[];
  }

  export function parse<T = any>(csv: string | File | NodeJS.ReadableStream, config?: ParseConfig): ParseResult<T>;
  export function unparse(data: any[] | { fields: any[]; data: any[] }, config?: UnparseConfig): string;
}
