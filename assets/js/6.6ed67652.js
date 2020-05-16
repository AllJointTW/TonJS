(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{437:function(t,s,a){"use strict";a.r(s);var e=a(55),r=Object(e.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"cors"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#cors"}},[t._v("#")]),t._v(" CORS")]),t._v(" "),a("h2",{attrs:{id:"what-is-this"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#what-is-this"}},[t._v("#")]),t._v(" What is this")]),t._v(" "),a("p",[t._v("tonjs/cors is a package for providing TonJS handler a decorator of enable "),a("a",{attrs:{href:"https://developer.mozilla.org/en/docs/Web/HTTP/Access_control_CORS",target:"_blank",rel:"noopener noreferrer"}},[t._v("CORS"),a("OutboundLink")],1),t._v(" with options")]),t._v(" "),a("h2",{attrs:{id:"usage"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#usage"}},[t._v("#")]),t._v(" Usage")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" createCORS "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'@tonjs/cors'")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" yourOptions "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" cors "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("createCORS")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("yourOptions"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" app "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("createApp")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("yourhHandler")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("req"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" res")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("send")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("res"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("200")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Hi'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("route")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("app"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'get'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'/'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("cors")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("yourhHandler"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])])]),a("h2",{attrs:{id:"options"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#options"}},[t._v("#")]),t._v(" Options")]),t._v(" "),a("h3",{attrs:{id:"origins"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#origins"}},[t._v("#")]),t._v(" origins")]),t._v(" "),a("p",[t._v("Configures the 'Access-Control-Allow-Origin' CORS header.")]),t._v(" "),a("ul",[a("li",[t._v("Allow type: Array<String>")]),t._v(" "),a("li",[t._v('Set origin to specific origins. For example if you set it to ["'),a("code",[t._v("http://tonjs.com")]),t._v('", "'),a("code",[t._v("http://example.com")]),t._v('"] only requests from '),a("code",[t._v("http://tonjs.com")]),t._v(" and "),a("code",[t._v("http://example.com")]),t._v(" will be allowed.")]),t._v(" "),a("li",[t._v('You can set default origins through environment variable "CORS_ORIGINS". For example set "CORS_ORIGINS='),a("code",[t._v("http://tonjs.com")]),t._v(","),a("code",[t._v("http://example.com")]),t._v('" use "," to separat items.')])]),t._v(" "),a("h3",{attrs:{id:"maxage"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#maxage"}},[t._v("#")]),t._v(" maxAge")]),t._v(" "),a("p",[t._v("Configures the 'Access-Control-Max-Age' header in seconds.")]),t._v(" "),a("ul",[a("li",[t._v("Allow type: Number")]),t._v(" "),a("li",[t._v("default: 86400")])]),t._v(" "),a("h3",{attrs:{id:"allowmethods"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#allowmethods"}},[t._v("#")]),t._v(" allowMethods")]),t._v(" "),a("p",[t._v("Configures the 'Access-Control-Allow-Methods' header.")]),t._v(" "),a("ul",[a("li",[t._v("Allow type: Array<String>")]),t._v(" "),a("li",[t._v("default: POST, GET, PUT, PATCH, DELETE, OPTIONS")])]),t._v(" "),a("h3",{attrs:{id:"allowheaders"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#allowheaders"}},[t._v("#")]),t._v(" allowHeaders")]),t._v(" "),a("p",[t._v("Configures the 'Access-Control-Allow-Headers' header.")]),t._v(" "),a("ul",[a("li",[t._v("Allow type: Array<String>")]),t._v(" "),a("li",[t._v("default: X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization,Accept")])]),t._v(" "),a("h3",{attrs:{id:"allowcredentials"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#allowcredentials"}},[t._v("#")]),t._v(" allowCredentials")]),t._v(" "),a("p",[t._v("Configures the 'Access-Control-Allow-Credentials' header.")]),t._v(" "),a("ul",[a("li",[t._v("Allow type: Boolean")])]),t._v(" "),a("h3",{attrs:{id:"exposeheaders"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#exposeheaders"}},[t._v("#")]),t._v(" exposeHeaders")]),t._v(" "),a("p",[t._v("Configures the 'Access-Control-Expose-Headers' header.")]),t._v(" "),a("ul",[a("li",[t._v("Allow type: Array<String>")])])])}),[],!1,null,null,null);s.default=r.exports}}]);