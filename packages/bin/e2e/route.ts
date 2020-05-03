import { TonRoute } from '@tonjs/ton'

const route: TonRoute = {
  methods: 'get',
  pattern: '/',
  handler: () => 'Hi There!'
}
export default route
