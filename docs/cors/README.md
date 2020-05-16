# CORS

## What is this

tonjs/cors is a package for providing TonJS handler a decorator of enable [CORS](https://developer.mozilla.org/en/docs/Web/HTTP/Access_control_CORS) with options

## Usage

``` js
import { createCORS } from '@tonjs/cors'
const yourOptions = {}
const cors = createCORS(yourOptions)

const app = createApp()
const yourhHandler = (req, res) => send(res, 200, 'Hi')
route(app, 'get', '/', cors(yourhHandler))
```

## Options

### origins
  Configures the 'Access-Control-Allow-Origin' CORS header.
  * Allow type: Array\<String\>
  * Set origin to specific origins. For example if you set it to ["`http://tonjs.com`", "`http://example.com`"] only requests from `http://tonjs.com` and `http://example.com` will be allowed.
  * You can set default origins through environment variable "CORS_ORIGINS". For example set "CORS_ORIGINS=`http://tonjs.com`,`http://example.com`" use "," to separat items.

### maxAge
  Configures the 'Access-Control-Max-Age' header in seconds.
  * Allow type: Number
  * default: 86400

### allowMethods
  Configures the 'Access-Control-Allow-Methods' header.
  * Allow type: Array\<String\>
  * default: POST, GET, PUT, PATCH, DELETE, OPTIONS

### allowHeaders
  Configures the 'Access-Control-Allow-Headers' header.
  * Allow type: Array\<String\>
  * default: X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization,Accept

### allowCredentials
  Configures the 'Access-Control-Allow-Credentials' header.
  * Allow type: Boolean

### exposeHeaders
  Configures the 'Access-Control-Expose-Headers' header.
  * Allow type: Array\<String\>
