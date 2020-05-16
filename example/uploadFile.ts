import { createWriteStream, unlinkSync } from 'fs'
import { resolve } from 'path'
import {
  TonHandler,
  readStream,
  sendJSON,
  sendError,
  TonError,
  TonRoutes,
  sendText
} from '../packages/ton/src'
import { error } from '../packages/logger/dist'

const uploadFile: TonHandler = async (req, res) => {
  const target = resolve(__dirname, 'temp.jpg')
  const bodyStream = readStream(req, res, { limit: '10mb' })
  const fileStream = createWriteStream(target)

  bodyStream
    .on('error', (err: Error | TonError) => {
      sendError(res, err)
      fileStream.destroy()
      unlinkSync(target) // delete the file
    })
    .on('end', () => {
      sendJSON(res, 202, { message: 'success' }) // Accepted
    })
    .pipe(fileStream)
    .on('error', error)
}
const index: TonHandler = (req, res) => {
  const html = `
<form method="post" action="/files" enctype="multipart/form-data">
  <input type="file" name="file" /><br>
  <input type="text" name="name" value="ton" /><br>
  <input type="submit" />
</form>
`
  sendText(res, 200, html, { 'Content-Type': 'text/html' })
}
const routes: TonRoutes = [
  {
    methods: 'post',
    pattern: '/files',
    handler: uploadFile
  },
  {
    methods: 'get',
    pattern: '/',
    handler: index
  }
]

export default routes
