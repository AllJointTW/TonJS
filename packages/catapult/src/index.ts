import simdjson from 'simdjson'

const targetSmall = JSON.stringify({ hello: 'world' })
const targetLarge = JSON.stringify({
  id: '1234qwerasdfzxcvasdfqwer',
  username: 'trylovetom',
  password: 'password',
  gender: 'male',
  birthday: new Date(),
  address: 'ROC. Taiwan Hinschu Chubei 109 no.',
  favorite: 'Code, Cake, Sex',
  single: true,
  balance: 90000000000,
  buildings: ['Taipei 101', 'Taipower Building'],
  cars: [
    {
      brand: 'Porsche',
      type: '911 Turbo S',
      price: 9000000
    },
    {
      brand: 'Ferrari',
      type: 'Roma',
      price: 12000000
    },
    {
      brand: 'Tesla',
      type: 'Cybertruck Tri Moto',
      price: 250000
    }
  ],
  family: {
    father: {
      name: 'Jack',
      age: 55
    },
    mother: {
      name: 'Mindy',
      age: 51
    },
    brothers: [
      {
        name: 'Joe',
        age: 23
      },
      {
        name: 'Mike',
        age: 19
      }
    ]
  },
  doctorDegree: undefined,
  createdAt: new Date(),
  updatedAt: new Date()
})

function benchmark(times: number, fn: () => any) {
  const start = new Date()
  for (let i = 0; i < times; i += 1) {
    fn()
  }
  const end = new Date()
  return end.getTime() - start.getTime()
}

console.log(
  `JSON.parse(targetSmall): ${benchmark(200000, () =>
    JSON.parse(targetSmall)
  )}ms`
)
console.log(
  `simdjson.parse(targetSmall): ${benchmark(200000, () =>
    simdjson.lazyParse(targetSmall)
  )}ms`
)
console.log(
  `JSON.parse(targetLarge): ${benchmark(200000, () =>
    JSON.parse(targetLarge)
  )}ms`
)
console.log(
  `simdjson.parse(targetLarge): ${benchmark(200000, () =>
    simdjson.lazyParse(targetLarge)
  )}ms`
)

// bench(200000, () => { simdjson.parse(target) })

// import { TonResponse, readBuffer, create4xxError } from '@tonjs/ton/src'
// import turbo from 'turbo-json-parse'

// export function createReadJSON(schema: any) {
//   const parse = turbo(schema, {
//     buffer: true,
//     required: false,
//     ordered: false,
//     validate: false,
//     validateStrings: false,
//     fullMatch: false,
//     unescapeStrings: false,
//     defaults: false,
//     prettyPrinted: false
//   })
//   return async function readJSON(res: TonResponse): Promise<object> {
//     return readBuffer(res)
//       .then(parse)
//       .catch(err => {
//         console.log(err)
//         return create4xxError(400, 'Invalid JSON')
//       })
//   }
// }

// export function sendJSON() {
//   return ''
// }
