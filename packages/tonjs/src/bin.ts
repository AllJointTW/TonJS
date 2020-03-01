import path from "path";
import uWS from "uWebSockets.js";
import { route, TonHandler, TonMethods } from "./index";

import yargs = require("yargs");

const { argv } = yargs
  .scriptName("ton")
  .usage("Usage: $0 <entry> <options>")
  .help()
  .version()
  .alias("version", "v")
  .epilogue("for more information, find our docs at https://tonjs.com")
  .example("$0 index.js", "listen on 0.0.0.0:3000 and index.js as the entry.")
  .locale("en")
  .options({
    host: {
      type: "string",
      alias: "h",
      desc: "Specify the host name",
      default: "0.0.0.0"
    },
    port: {
      type: "number",
      alias: "p",
      desc: "Specify the port number",
      default: 3000
    }
  });

async function main() {
  const [entry = "index.js"] = argv._;
  const app = uWS.App();
  const endpoints: TonHandler | { [pattern: string]: TonHandler } = (
    await import(path.resolve(process.cwd(), entry))
  ).default;
  const httpPattern = /(^GET|POST|OPTIONS|DEL|PATCH|PUT|HEAD|CONNECT|TRACE|ANY|WS|PUBLISH)\s+(\S+)/;

  console.info("\nroutes:"); // eslint-disable-line
  if (typeof endpoints === "object" && endpoints !== null) {
    Object.keys(endpoints).forEach(key => {
      const results = key.match(httpPattern);
      if (!results) {
        throw new Error(`routes: can't parse ${key}`);
      }
      const [, methods, pattern] = results;
      let handlerName = endpoints[key].name || "anonymous";
      if (handlerName === key) {
        handlerName = "anonymous";
      }
      console.info(`  ${key} => ${handlerName}()`); // eslint-disable-line
      route(app, methods as TonMethods, pattern, endpoints[key] as TonHandler);
    });
  } else {
    const handlerName = endpoints.name || "anonymous";
    console.info(`  * => ${handlerName}()`); // eslint-disable-line
    route(app, "ANY", "*", endpoints as TonHandler);
  }

  app.listen(argv.host, argv.port, token => {
    if (!token) {
      console.info(`\nfailed to listen on ${argv.host}:${argv.port}`); // eslint-disable-line
      return;
    }
    console.info(`\nyou raise me up, to listen on ${argv.host}:${argv.port}`); // eslint-disable-line
  });
}

main();
