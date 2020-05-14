import { createReadStream, statSync } from 'fs'
import { TonHandler, TonStream, sendStream } from '../packages/ton'

const target = 'README.md'
const { size } = statSync(target)
const sendFile: TonHandler = (req, res) => {
  const stream: TonStream = createReadStream(target)
  stream.size = size
  sendStream(res, 200, stream)
}
export default sendFile
