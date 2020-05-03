function isObject(target: any): target is object {
  return target !== null && typeof target === 'object'
}

function isError(target: any): target is Error {
  return target instanceof Error
}

export enum LogLevel {
  silent = 0,
  error = 1,
  warn = 2,
  info = 3,
  debug = 4,
  verbose = 5
}

export type LogColor = {
  error: string
  warn: string
  info: string
  debug: string
  verbose: string
}

/**
 * ref: https://en.wikipedia.org/wiki/ANSI_escape_code#3/4_bit
 */
export const defaultColors: LogColor = {
  error: '91',
  warn: '93',
  info: '92',
  debug: '97',
  verbose: '90'
}

/**
 * format the context
 * @param context something you want to format
 * @param format should beautify the object?
 */
export function formatContext(context: any, format?: boolean) {
  if (!isObject(context)) {
    return `${context}\n`
  }

  if (!format) {
    return `${JSON.stringify(context)}\n`
  }

  return `${JSON.stringify(context, undefined, 2)}\n`
}

/**
 * print the context with color
 * @param context something you want to print
 * @param color ansi code
 * @see https://en.wikipedia.org/wiki/ANSI_escape_code#3/4_bit
 */
export function printWithColor(context: any, color?: string) {
  if (!color) {
    process.stdout.write(context)
    return
  }

  process.stdout.write(`\u001B[${color}m${context}\u001B[m`)
}

export type LogOptions = {
  level?: LogLevel
  color?: string
  format?: boolean
}

/**
 * print it, suggest use the `printWith` to create customer logger
 * @param param0 the options of logger
 * @param args something you want to print
 */
export function print(
  { level = LogLevel.debug, color, format }: LogOptions,
  ...args: any[]
) {
  if (level <= LogLevel[process.env.LOG_LEVEL || 'debug']) {
    args.forEach(context => {
      if (isError(context)) {
        printWithColor(
          formatContext(context.stack || context.message, format),
          color
        )
        return
      }
      printWithColor(formatContext(context, format), color)
    })
  }
}

/**
 * create the custom logger function
 * @param options the options of your custom logger
 * @example
 * const error = printWith({
 *   level: LogLevel.error,
 *   color: defaultColors.error
 *   format: process.env.NODE_ENV !== 'production'
 * })
 * error('Hello World!')
 *
 */
export function printWith(options: LogOptions) {
  return (message: any = '', ...args: any[]) => print(options, message, ...args)
}

export const error = printWith({
  level: LogLevel.error,
  color: defaultColors.error,
  format: process.env.NODE_ENV !== 'production'
})

export const warn = printWith({
  level: LogLevel.warn,
  color: defaultColors.warn,
  format: process.env.NODE_ENV !== 'production'
})

export const info = printWith({
  level: LogLevel.info,
  color: defaultColors.info,
  format: process.env.NODE_ENV !== 'production'
})

export const debug = printWith({
  level: LogLevel.debug,
  color: defaultColors.debug,
  format: process.env.NODE_ENV !== 'production'
})

export const verbose = printWith({
  level: LogLevel.verbose,
  color: defaultColors.verbose,
  format: process.env.NODE_ENV !== 'production'
})
