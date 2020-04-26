/* eslint-disable max-classes-per-file */
import 'reflect-metadata'

export function Controller(namespace: string): ClassDecorator {
  return function ClassDecorator(target) {
    const defaultNamespace = '/'
    Reflect.defineMetadata(
      'namespace',
      `${defaultNamespace}${namespace}` || defaultNamespace,
      target
    )
  }
}

export function Method(method: string) {
  return function createMethodDecorator(path: string): MethodDecorator {
    return function MethodDecorator(target, key, descriptor) {
      const defaultMethod = 'any'
      Reflect.defineMetadata('path', path, descriptor.value)
      Reflect.defineMetadata(
        'method',
        method || defaultMethod,
        descriptor.value
      )
    }
  }
}

export const GET = Method('get')

@Controller('a')
export default class App {
  word = 'you'

  @GET('/hi')
  hi() {
    process.stdout.write(`Hi! ${this.word}`)
  }
}

@Controller('b')
class B extends App {
  constructor(word: string) {
    super()
    this.word = word
  }

  @GET('/hello')
  hello() {
    process.stdout.write(`Hello! ${this.word}`)
  }
}

const app = new App()
const b = new B('Tom')

b.hi()

process.stdout.write(`${Reflect.getMetadata('method', app.hi)}\n`)

// const prototype = Object.getPrototypeOf(b)
// const methodsName = Object.getOwnPropertyNames(prototype).filter(
//   item => item !== 'constructor' && typeof prototype[item] === 'function'
// )

// function getMethods(target: object) {
//   const properties = new Set()
//   const
// }

// const getMethods = obj => {
//   const properties = new Set()
//   let currentObj = obj
//   do {
//     Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
//   } while ((currentObj = Object.getPrototypeOf(currentObj)))
//   return [...properties.keys()].filter(item => typeof obj[item] === 'function')
// }

// process.stdout.write(`${methodsName}\n`)
