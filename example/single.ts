// import cors from '../packages/cors/src'
import { TonHandler, sendEmpty } from '../packages/ton/dist'

const yourHandler = () => 'Hi There!'

function cors(handler: TonHandler) {
  const wrapper: TonHandler = (req, res) => {
    console.log(req.getMethod())
    res.writeHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8887')
    if (req.getMethod() === 'OPTIONS') {
      res.writeHeader('Access-Control-Max-Age', String(60 * 60 * 24))
      sendEmpty(res)
    } else {
      return handler(req, res)
    }
  }
  return wrapper
}

const singleWithCors = cors(yourHandler)

export default singleWithCors
