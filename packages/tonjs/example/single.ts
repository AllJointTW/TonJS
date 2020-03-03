import { send, TonHandler } from '../src/index'

const server: TonHandler = (req, res) => send(res, 200, '')
export default server
