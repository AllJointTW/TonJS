/**
 * @type {import('@tonjs/ton').TonRoute}
 */
const route = {
  methods: 'get',
  pattern: '/',
  handler: () => 'Hi There!'
}
module.exports = route
