import { createCORS } from '../packages/cors'
import { TonHandler } from '../packages/ton'

const handler: TonHandler = () => ''
const cors = createCORS({ origins: ['*'] })
const single = cors(handler)
export default single
