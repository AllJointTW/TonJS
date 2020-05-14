import {
  formatContext,
  paintIn,
  print,
  LogLevel,
  printWith,
  defaultColors
} from './index'

let originalStdoutWrite = process.stdout.write
const originalEnvLogLevel = process.env.LOG_LEVEL

beforeEach(() => {
  originalStdoutWrite = process.stdout.write
  process.stdout.write = jest.fn()
})

afterEach(() => {
  process.stdout.write = originalStdoutWrite
  delete process.env.LOG_LEVEL
  if (originalEnvLogLevel) {
    process.env.LOG_LEVEL = originalEnvLogLevel
  }
})

describe('formatContext', () => {
  it(`should no do anything, \
if type of context is not object.`, () => {
    const input = 'text'
    const output = input
    expect(formatContext(input)).toBe(output)
  })

  it(`should stringify the object, \
if type of context is an object.`, () => {
    const input = { sub: { text: 'text' } }
    const output = JSON.stringify(input)
    expect(formatContext(input)).toBe(output)
  })

  it(`should stringify the object with 2 spaces, \
if type of context is an object.`, () => {
    const input = { sub: { text: 'text' } }
    const output = `${JSON.stringify(input, undefined, 2)}`
    expect(formatContext(input, true)).toBe(output)
  })
})

describe('printWithColor', () => {
  it(`should write the process.stdout without color, \
if color is not setup.`, () => {
    const input = 'text'
    const target = input
    const output = paintIn(input)
    expect(output).toBe(target)
  })

  it(`should write the process.stdout with color, \
if color is setup.`, () => {
    const input = 'text'
    const color = '90'
    const target = `\u001B[${color}m${input}\u001B[m`
    const output = paintIn(input, color)
    expect(output).toBe(target)
  })
})

describe('print', () => {
  it(`should write the process.stdout, \
if level is higher or equal to default level(debug).`, () => {
    const input = 'text'
    const output = `${input} ${input}\n`
    print(undefined, input, input)
    expect(process.stdout.write).toHaveBeenNthCalledWith(1, output)
  })

  it(`should not write the process.stdout, \
if level is smaller than process.env.LOG_LEVEL = error.`, () => {
    const input = 'text'
    process.env.LOG_LEVEL = 'error'
    print({ level: LogLevel.warn }, input)
    expect(process.stdout.write).toHaveBeenCalledTimes(0)
  })

  it(`should write the stack to process.stdout, \
if context is error.`, () => {
    const input = new Error('Hi There!')
    const outputStack = `${input.stack}\n`
    process.env.LOG_LEVEL = 'error'
    print({ level: LogLevel.error }, input)
    expect(process.stdout.write).toHaveBeenNthCalledWith(1, outputStack)
  })
})

describe('printWith', () => {
  it('should create custom logger', () => {
    const input = 'text'
    const color = '96'
    const output = `\u001B[${color}m${input} ${input}\u001B[m\n`
    const customLogger = printWith({ level: LogLevel.warn, color })
    customLogger(input, input)
    expect(process.stdout.write).toHaveBeenNthCalledWith(1, output)
  })

  it('should print break line, if argument is empty', () => {
    const color = '96'
    const output = `\u001B[${color}m\u001B[m\n`
    const customLogger = printWith({ level: LogLevel.warn, color })
    customLogger()
    expect(process.stdout.write).toHaveBeenNthCalledWith(1, output)
  })
})

describe('logger', () => {
  it('error', () => {
    const input = 'text'
    const color = defaultColors.error
    const output = `\u001B[${color}m${input} ${input}\u001B[m\n`
    const customLogger = printWith({ level: LogLevel.warn, color })
    customLogger(input, input)
    expect(process.stdout.write).toHaveBeenNthCalledWith(1, output)
  })

  it('warn', () => {
    const input = 'text'
    const color = defaultColors.warn
    const output = `\u001B[${color}m${input} ${input}\u001B[m\n`
    const customLogger = printWith({ level: LogLevel.warn, color })
    customLogger(input, input)
    expect(process.stdout.write).toHaveBeenNthCalledWith(1, output)
  })

  it('info', () => {
    const input = 'text'
    const color = defaultColors.info
    const output = `\u001B[${color}m${input} ${input}\u001B[m\n`
    const customLogger = printWith({ level: LogLevel.warn, color })
    customLogger(input, input)
    expect(process.stdout.write).toHaveBeenNthCalledWith(1, output)
  })

  it('debug', () => {
    const input = 'text'
    const color = defaultColors.debug
    const output = `\u001B[${color}m${input} ${input}\u001B[m\n`
    const customLogger = printWith({ level: LogLevel.warn, color })
    customLogger(input, input)
    expect(process.stdout.write).toHaveBeenNthCalledWith(1, output)
  })

  it('verbose', () => {
    const input = 'text'
    const color = defaultColors.verbose
    const output = `\u001B[${color}m${input} ${input}\u001B[m\n`
    const customLogger = printWith({ level: LogLevel.warn, color })
    customLogger(input, input)
    expect(process.stdout.write).toHaveBeenNthCalledWith(1, output)
  })
})
