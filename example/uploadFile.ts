import { createWriteStream, unlinkSync } from 'fs'
import { join } from 'path'
import { pipeline } from 'stream'
import {
  TonHandler,
  TonRoutes,
  sendText,
  sendJSON,
  sendError,
  create4xxError
} from '../packages/ton'
import { readFileStream } from '../packages/upload'

const uploadFile: TonHandler = async (req, res) => {
  const temp = join(__dirname, 'temp/sample.jpg')
  const writeStream = createWriteStream(temp)
  const file = await readFileStream(req, res, { limit: '10mb' })

  // when all type of fields is not file, will file.stream be undefined
  // when file of field is missing, file.name will be undefined
  if (!file.stream || !file.name) {
    sendError(res, create4xxError(422, 'Missing File', { file: 'required' }))

    file.stream.destroy()
    writeStream.destroy()
    return
  }

  pipeline(file.stream, writeStream, err => {
    if (err) {
      sendError(res, err)
      file.stream.destroy()
      writeStream.destroy()
      unlinkSync(temp)
      return
    }

    sendJSON(res, 201, { message: 'Success' }) // Created
  })
}
const uploadPage: TonHandler = (req, res) => {
  const html = `
<form method="post" action="/files" enctype="multipart/form-data">
  <input type="file" name="file" /><br>
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
    handler: uploadPage
  }
]

export default routes
