import { STATUS_CODES } from "http";
import stream from "stream";
import uWS from "uWebSockets.js";
import bytes from "bytes";
import { readable } from "is-stream";

export type TonApp = uWS.TemplatedApp;
export type TonRequest = uWS.HttpRequest;
export type TonResponse = uWS.HttpResponse & { aborted: boolean };
export type TonStream = stream.Readable & { size?: number };
export type TonData = string | number | object | TonStream;
export type TonHeaders = { [key: string]: string };
export type TonHandler = (
  req: TonRequest,
  res: TonResponse
) => TonData | void | Promise<TonData | void>;
export type TonError = Error & {
  statusCode: number;
  status: number;
  originalError: Error;
};
export type TonMethods =
  | "GET"
  | "POST"
  | "OPTIONS"
  | "DEL"
  | "PATCH"
  | "PUT"
  | "HEAD"
  | "CONNECT"
  | "TRACE"
  | "ANY"
  | "WS"
  | "PUBLISH";

const ContentType = "Content-Type";

export function writeStatus(res: TonResponse, statusCode: number): void {
  if (statusCode !== 200) {
    res.writeStatus(`${statusCode} ${STATUS_CODES[statusCode]}`);
  }
}

export function writeHeaders(res: TonResponse, headers: TonHeaders = {}): void {
  Object.keys(headers).forEach(key => res.writeHeader(key, headers[key]));
}

function toArrayBuffer(target: Buffer): ArrayBuffer {
  return target.buffer.slice(
    target.byteOffset,
    target.byteOffset + target.byteLength
  );
}

function pipeStream(res: TonResponse, data: TonStream): void {
  res.onAborted(() => {
    res.aborted = true;
    data.destroy();
  });

  data.on("error", err => {
    writeStatus(res, 500);
    res.end();
    data.destroy();
    throw err;
  });

  data.on("end", res.end.bind(res));
  data.on("data", chunk => {
    const arrayBuffer = toArrayBuffer(chunk);
    const lastOffset = res.getWriteOffset();

    // first try
    const [firstTryOk, firstTryDone] = res.tryEnd(arrayBuffer, data.size);

    if (firstTryDone || firstTryOk) {
      data.destroy();
      return;
    }

    // pause because backpressure
    data.pause();

    // register async handlers for drainage
    res.onWritable(offset => {
      const [ok, done] = res.tryEnd(
        arrayBuffer.slice(offset - lastOffset),
        data.size
      );

      if (done) {
        data.destroy();
        return ok;
      }

      if (ok) {
        data.resume();
      }

      return ok;
    });
  });
}

export function redirect(
  res: TonResponse,
  statusCode = 301,
  location: string
): void {
  writeStatus(res, statusCode);
  writeHeaders(res, { Location: location });
  res.aborted = true;
  res.end();
}

export function send(
  res: TonResponse,
  statusCode = 200,
  data?: TonData | void,
  headers: TonHeaders = {}
): void {
  if (res.aborted) {
    return;
  }

  if (statusCode === 204 || typeof data === "undefined" || data === null) {
    writeStatus(res, 204);
    writeHeaders(res, headers);
    res.end();
    res.aborted = true;
    return;
  }

  if (data instanceof stream.Readable && readable(data)) {
    writeStatus(res, statusCode);
    writeHeaders(res, {
      [ContentType]: "application/octet-stream",
      ...headers
    });
    pipeStream(res, data);
    res.aborted = true;
    return;
  }

  if (typeof data === "string") {
    writeStatus(res, statusCode);
    writeHeaders(res, {
      [ContentType]: "text/plain; charset=utf-8",
      ...headers
    });
    res.end(data);
    res.aborted = true;
    return;
  }

  writeStatus(res, statusCode);
  writeHeaders(res, {
    [ContentType]: "application/json; charset=utf-8",
    ...headers
  });
  res.end(JSON.stringify(data));
  res.aborted = true;
}

export function sendError(res: TonResponse, err: TonError): void {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || STATUS_CODES[statusCode] || STATUS_CODES[500];
  const data = { message };

  if (process.env.NODE_ENV === "production" && statusCode >= 500) {
    send(res, 500, { message: STATUS_CODES[500] });
  } else {
    send(res, statusCode, data);
  }

  if (statusCode < 500) {
    return;
  }

  if (err.originalError && err.originalError instanceof Error) {
    console.error(err.originalError); // eslint-disable-line
  } else {
    console.error(err); // eslint-disable-line
  }
}

export function createError(
  statusCode: number,
  message: string,
  original?: Error
): TonError {
  const err = new Error(message) as TonError;
  err.statusCode = statusCode;
  err.originalError = original;
  return err;
}

export function buffer(
  res: TonResponse,
  { limit = "1mb" } = {}
): Promise<Buffer> {
  return new Promise(resolve => {
    const limitSize = bytes.parse(limit);
    let data = Buffer.allocUnsafe(0);

    res.onData((chunk, isLast) => {
      if (res.aborted) {
        return;
      }

      data = Buffer.concat([data, Buffer.from(chunk)]);

      if (data.length > limitSize) {
        const statusCode = 413;
        sendError(res, createError(statusCode, STATUS_CODES[statusCode]));
        res.aborted = true;
        return;
      }

      if (isLast) {
        resolve(data);
      }
    });
  });
}

export async function text(
  res: TonResponse,
  { limit = "1mb", encoding = "utf-8" } = {}
): Promise<string> {
  const body = await buffer(res, { limit });
  return body.toString(encoding);
}

export async function json(
  res: TonResponse,
  { limit = "1mb", encoding = "utf-8" } = {}
): Promise<any> {
  const body = await text(res, { limit, encoding });
  try {
    return JSON.parse(body);
  } catch (err) {
    throw createError(400, "Invalid JSON", err);
  }
}

export function handler(fn: TonHandler) {
  return async (res: TonResponse, req: TonRequest): Promise<void> => {
    res.aborted = false;
    res.onAborted(() => {
      res.aborted = true;
    });

    try {
      const result = await fn(req, res);

      if (res.aborted) {
        return;
      }

      send(res, 200, result);
    } catch (err) {
      sendError(res, createError(500, STATUS_CODES[500], err));
    }
  };
}

export function route(
  app: TonApp,
  methods: TonMethods,
  pattern: string,
  routeHandler: TonHandler
) {
  app[methods.toLocaleLowerCase()](pattern, handler(routeHandler));
}
