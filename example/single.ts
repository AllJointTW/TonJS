import { TonHandler } from '../packages/ton'
import { createReadJSON } from '../packages/catapult/src/index'

const readJSON = createReadJSON({
  type: 'object',
  properties: {
    hello: { type: 'string' }
  }
})
const single: TonHandler = async (req, res) => {
  try {
    return await readJSON(res)
  } catch (err) {
    return err
  }
}
export default single
