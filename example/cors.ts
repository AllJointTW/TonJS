import { createCORS } from '../packages/cors'
import { TonHandler } from '../packages/ton'

const handler: TonHandler = () => ''
const cors = createCORS()
const single = cors(handler)
export default single
