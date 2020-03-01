/* eslint-disable */
const { send,  redirect } = require("./dist");

module.exports = {
  "GET /": (req, res) => send(res, 200, "TonJS!"),
  "GET /redirect-to-alljoint.tw": function redirect302(req, res) {
    redirect(res, 302, "https://alljoint.tw");
  }
};

// module.exports = function redirectToAlljoint(req, res) {
//   redirect(res, 301, "https://alljoint.tw");
// };
