function isObject(target: any): target is object {
  return target !== null && typeof target === 'object'
}

function isError(target: any): target is Error {
  return target instanceof Error
}

export enum LogLevel {
  error = 0,
  warn = 1,
  info = 2,
  debug = 3,
  verbose = 4
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
 * })
 * error('Hello World!')
 *
 */
export function printWith(options: LogOptions) {
  return (message: any = '', ...args: any[]) => print(options, message, ...args)
}

export const error = printWith({
  level: LogLevel.error,
  color: defaultColors.error
})

export const warn = printWith({
  level: LogLevel.warn,
  color: defaultColors.warn
})

export const info = printWith({
  level: LogLevel.info,
  color: defaultColors.info
})

export const debug = printWith({
  level: LogLevel.debug,
  color: defaultColors.debug
})

export const verbose = printWith({
  level: LogLevel.verbose,
  color: defaultColors.verbose
})
