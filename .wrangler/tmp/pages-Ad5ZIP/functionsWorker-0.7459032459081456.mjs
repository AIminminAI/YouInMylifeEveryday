var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/_db.ts
var users = {};
var orders = {};
function findUserById(userId) {
  return users[userId];
}
__name(findUserById, "findUserById");
function getOrCreateUser(userId) {
  if (!users[userId]) {
    users[userId] = { id: userId, plan: "free" };
  }
  return users[userId];
}
__name(getOrCreateUser, "getOrCreateUser");
function updateUserPlan(userId, plan) {
  const user = getOrCreateUser(userId);
  user.plan = plan;
}
__name(updateUserPlan, "updateUserPlan");
function createOrderRecord(order) {
  orders[order.id] = order;
}
__name(createOrderRecord, "createOrderRecord");
function findOrderById(orderId) {
  return orders[orderId];
}
__name(findOrderById, "findOrderById");
function findOrderByIdAndUser(orderId, userId) {
  const order = orders[orderId];
  if (order && order.user_id === userId) return order;
  return void 0;
}
__name(findOrderByIdAndUser, "findOrderByIdAndUser");
function updateOrderStatus(orderId, status, tradeNo, paidAt) {
  const order = orders[orderId];
  if (order) {
    order.status = status;
    order.trade_no = tradeNo;
    order.paid_at = paidAt;
  }
}
__name(updateOrderStatus, "updateOrderStatus");

// api/pay.ts
var PRICES = {
  full: { amount: 1990, label: "\u9AD8\u7EA7\u7248 \xA519.9" },
  premium: { amount: 9900, label: "\u7EAA\u5FF5\u7248 \xA599" }
};
function simpleId() {
  return "xxxx-xxxx-xxxx".replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
}
__name(simpleId, "simpleId");
function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(jsonResp, "jsonResp");
var onRequest = /* @__PURE__ */ __name(async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  try {
    if (action === "create-order" && request.method === "POST") {
      const body = await request.json();
      const { userId, plan } = body;
      if (!userId || !plan || !PRICES[plan]) {
        return jsonResp({ error: "\u53C2\u6570\u9519\u8BEF" }, 400);
      }
      const orderId = simpleId() + "-" + Date.now();
      const price = PRICES[plan];
      createOrderRecord({
        id: orderId,
        user_id: userId,
        plan,
        amount: price.amount,
        channel: "qrcode",
        status: "pending",
        trade_no: "",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        paid_at: ""
      });
      return jsonResp({
        orderId,
        amount: price.amount,
        description: price.label,
        payHint: "\u8BF7\u626B\u7801\u652F\u4ED8 \xA5" + (price.amount / 100).toFixed(1) + "\uFF0C\u5907\u6CE8\uFF1A" + orderId.slice(-6),
        orderSuffix: orderId.slice(-6)
      });
    }
    if (action === "confirm-pay" && request.method === "POST") {
      const body = await request.json();
      const { orderId, userId } = body;
      if (!orderId || !userId) return jsonResp({ error: "\u53C2\u6570\u9519\u8BEF" }, 400);
      const order = findOrderByIdAndUser(orderId, userId);
      if (!order) return jsonResp({ error: "\u8BA2\u5355\u4E0D\u5B58\u5728" }, 404);
      if (order.status === "paid") return jsonResp({ success: true, plan: order.plan });
      const now = (/* @__PURE__ */ new Date()).toISOString();
      updateOrderStatus(orderId, "paid", "manual_" + Date.now(), now);
      updateUserPlan(userId, order.plan);
      return jsonResp({ success: true, plan: order.plan });
    }
    if (action === "order-status") {
      const id = url.searchParams.get("id");
      if (!id) return jsonResp({ error: "\u7F3A\u5C11 ID" }, 400);
      const order = findOrderById(id);
      if (!order) return jsonResp({ error: "\u8BA2\u5355\u4E0D\u5B58\u5728" }, 404);
      return jsonResp({ id: order.id, plan: order.plan, amount: order.amount, status: order.status });
    }
    if (action === "user-status") {
      const id = url.searchParams.get("id");
      if (!id) return jsonResp({ error: "\u7F3A\u5C11 ID" }, 400);
      const user = findUserById(id);
      return jsonResp({ plan: user ? user.plan : "free", isPaid: !!(user && user.plan !== "free") });
    }
    return jsonResp({ error: "\u672A\u77E5\u64CD\u4F5C" }, 400);
  } catch (err) {
    console.error("[Pay Error]", err);
    return jsonResp({ error: "\u670D\u52A1\u9519\u8BEF" }, 500);
  }
}, "onRequest");

// api/timeline.ts
function simpleId2() {
  return "xxxx-xxxx-xxxx".replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
}
__name(simpleId2, "simpleId");
function generateDescription(year, title) {
  const y = year || (/* @__PURE__ */ new Date()).getFullYear();
  const t = title || "";
  const templates = {
    "\u51FA\u751F": "\u4E00\u58F0\u557C\u54ED\u5212\u7834\u4E86" + y + "\u5E74\u7684\u6E05\u6668\uFF0C\u4F60\u5E26\u7740\u5168\u5BB6\u7684\u671F\u76FC\u6765\u5230\u8FD9\u4E2A\u4E16\u754C\u3002",
    "\u4E0A\u5B66": "\u80CC\u7740\u4E66\u5305\u8E0F\u8FDB\u6821\u95E8\uFF0C" + y + "\u5E74\u7684\u6821\u56ED\u65F6\u5149\uFF0C\u662F\u751F\u547D\u4E2D\u6700\u7EAF\u7CB9\u7684\u7AE0\u8282\u3002",
    "\u6BD5\u4E1A": y + "\u5E74\uFF0C\u8D70\u51FA\u6821\u95E8\u7684\u90A3\u4E00\u523B\uFF0C\u9752\u6625\u7684\u7BC7\u7AE0\u753B\u4E0A\u4E86\u53E5\u53F7\uFF0C\u4EBA\u751F\u7684\u65B0\u7BC7\u7AE0\u5373\u5C06\u5F00\u542F\u3002",
    "\u5DE5\u4F5C": y + "\u5E74\uFF0C\u4F60\u7B2C\u4E00\u6B21\u7A7F\u4E0A\u6B63\u88C5\u8D70\u8FDB\u5199\u5B57\u697C\uFF0C\u773C\u775B\u91CC\u6709\u5149\u3002",
    "\u604B\u7231": y + "\u5E74\uFF0C\u4F60\u9047\u89C1\u4E86\u90A3\u4E2A\u8BA9\u5FC3\u8DF3\u6F0F\u4E86\u4E00\u62CD\u7684\u4EBA\u3002",
    "\u517B\u5BA0": y + "\u5E74\uFF0C\u4E00\u4E2A\u5C0F\u5BB6\u4F19\u602F\u602F\u5730\u63A2\u51FA\u8111\u888B\uFF0C\u671B\u8FDB\u4E86\u4F60\u7684\u5FC3\u91CC\u3002",
    "\u7ED3\u5A5A": y + '\u5E74\uFF0C\u4F60\u8BF4\u51FA\u4E86\u90A3\u53E5"\u6211\u613F\u610F"\u3002',
    "\u7236\u6BCD": y + "\u5E74\uFF0C\u4F60\u7B2C\u4E00\u6B21\u5F53\u4E0A\u4E86\u7236\u6BCD\uFF0C\u660E\u767D\u4E86\u4EC0\u4E48\u53EB\u505A\u65E0\u6761\u4EF6\u7684\u7231\u3002",
    "\u4E2D\u5E74": y + "\u5E74\uFF0C\u4F60\u5B66\u4F1A\u4E86\u548C\u5C81\u6708\u548C\u89E3\uFF0C\u73CD\u60DC\u773C\u524D\u7684\u6BCF\u4E00\u4E2A\u5E73\u51E1\u65E5\u5B50\u3002",
    "\u66AE\u5E74": y + "\u5E74\uFF0C\u56DE\u5934\u770B\uFF0C\u90A3\u4E9B\u5E74\u7684\u8F9B\u82E6\uFF0C\u90FD\u53D8\u6210\u4E86\u6B64\u523B\u7684\u4ECE\u5BB9\u3002"
  };
  for (const [key, desc] of Object.entries(templates)) {
    if (t.includes(key)) return desc;
  }
  return "\u90A3\u662F" + y + "\u5E74\u7684\u6545\u4E8B\uFF0C\u65F6\u5149\u5728\u90A3\u4E00\u523B\u5B9A\u683C\uFF0C\u6210\u4E3A\u661F\u8F68\u4E0A\u6C38\u6052\u7684\u5149\u70B9\u3002";
}
__name(generateDescription, "generateDescription");
function jsonResp2(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(jsonResp2, "jsonResp");
var onRequest2 = /* @__PURE__ */ __name(async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  try {
    if (action === "create-user" && request.method === "POST") {
      const body = await request.json();
      const userId = simpleId2() + "-" + Date.now();
      return jsonResp2({ userId, plan: "free", nickname: body.nickname || "\u7528\u6237" });
    }
    if (action === "generate-description" && request.method === "POST") {
      const body = await request.json();
      const description = generateDescription(body.year, body.title);
      return jsonResp2({ description, aiGenerated: true });
    }
    if (action === "upload" && request.method === "POST") {
      const body = await request.json();
      const nodeId = simpleId2() + "-" + Date.now();
      const aiDesc = body.description || generateDescription(body.year, body.title);
      return jsonResp2({
        id: nodeId,
        year: body.year || null,
        title: body.title || "\u672A\u547D\u540D\u65F6\u523B",
        description: aiDesc,
        imageUrl: body.imageUrl || "",
        aiGenerated: !body.description
      });
    }
    return jsonResp2({ error: "\u672A\u77E5\u64CD\u4F5C" }, 400);
  } catch (err) {
    console.error("[Timeline Error]", err);
    return jsonResp2({ error: "\u670D\u52A1\u9519\u8BEF" }, 500);
  }
}, "onRequest");

// ../.wrangler/tmp/pages-Ad5ZIP/functionsRoutes-0.11473393124113296.mjs
var routes = [
  {
    routePath: "/api/pay",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/timeline",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  }
];

// ../node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-CRVKAd/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-CRVKAd/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.7459032459081456.mjs.map
