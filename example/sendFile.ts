import { join } from 'path'
import { createReadStream, statSync } from 'fs'
import { TonHandler, TonStream, sendStream } from '../packages/ton'

const target = join(__dirname, 'public/sample.jpg')
const { size } = statSync(target)
const sendFile: TonHandler = (req, res) => {
  const stream: TonStream = createReadStream(target)
  // stream.size can be undefined
  // if stream.size === undefined, it will use res.write
  // if stream.size has been set, it will use res.tryEnd
  // and `res.tryEnd` is faster than `res.write`
  // reference: https://github.com/uNetworking/uWebSockets.js/issues/209
  stream.size = size
  sendStream(res, 200, stream)
}
export default sendFile
