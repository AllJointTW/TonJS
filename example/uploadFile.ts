import { createWriteStream, unlinkSync } from 'fs'
import { resolve } from 'path'
import {
  TonHandler,
  TonRoutes,
  sendText,
  sendJSON,
  sendError,
  create4xxError
} from '../packages/ton/src/index'
import { readFile } from '../packages/upload/src/index'

const uploadFile: TonHandler = async (req, res) => {
  const target = resolve(__dirname, 'temp.jpg')
  const writeStream = createWriteStream(target)
  try {
    const file = await readFile(req, res, { limit: '10mb' })
    file.stream.pipe(writeStream)
    if (!file.name) {
      sendError(
        res,
        create4xxError(422, 'Missing File', { [file.field]: 'required' })
      )
      return
    }
    sendJSON(res, 202, { message: 'success' }) // Accepted
  } catch (err) {
    sendError(res, err)
    unlinkSync(target)
  }
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
