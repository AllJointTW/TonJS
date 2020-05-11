import cors from '../packages/cors/src'

const yourHandler = () => ''
const singleWithCors = cors()(yourHandler)

export default singleWithCors
