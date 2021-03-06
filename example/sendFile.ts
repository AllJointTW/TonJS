import { resolve } from 'path'
import { createReadStream, statSync } from 'fs'
import { TonHandler, TonStream, sendStream } from '../packages/ton'
// import { sendCompressedStream } from '../packages/compress'

const target = resolve(__dirname, 'public/sample.jpg')
const { size } = statSync(target)
const sendFile: TonHandler = (req, res) => {
  const stream: TonStream = createReadStream(target)
  // stream.size can be undefined
  // if stream.size === undefined, it will use res.write
  // if stream.size has been set, it will use res.tryEnd
  // and `res.tryEnd` is faster than `res.write`
  // reference: https://github.com/uNetworking/uWebSockets.js/issues/209
  stream.size = size
  // need compress
  // sendCompressedStream(req, res, 200, stream)

  // just send
  sendStream(res, 200, stream)
}
export default sendFile
