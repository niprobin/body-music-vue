import { createHooks } from "hookable";
import { toValue, isRef, defineComponent, ref, onMounted, createSSRApp, useSSRContext, onUnmounted, resolveComponent, mergeProps, withCtx, createVNode, createTextVNode, computed, resolveDynamicComponent, Transition, createBlock, openBlock } from "vue";
import { createRouter, createMemoryHistory, createWebHistory } from "vue-router";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderVNode, ssrRenderList, ssrRenderClass } from "vue/server-renderer";
import "howler";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faPlay, faPause, faHouse, faCalendar, faMusic, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
const DupeableTags = /* @__PURE__ */ new Set(["link", "style", "script", "noscript"]);
const TagsWithInnerContent = /* @__PURE__ */ new Set(["title", "titleTemplate", "script", "style", "noscript"]);
const ValidHeadTags = /* @__PURE__ */ new Set([
  "title",
  "base",
  "htmlAttrs",
  "bodyAttrs",
  "meta",
  "link",
  "style",
  "script",
  "noscript"
]);
const UniqueTags = /* @__PURE__ */ new Set(["base", "title", "titleTemplate", "bodyAttrs", "htmlAttrs", "templateParams"]);
const TagConfigKeys = /* @__PURE__ */ new Set(["key", "tagPosition", "tagPriority", "tagDuplicateStrategy", "innerHTML", "textContent", "processTemplateParams"]);
const UsesMergeStrategy = /* @__PURE__ */ new Set(["templateParams", "htmlAttrs", "bodyAttrs"]);
const MetaTagsArrayable = /* @__PURE__ */ new Set([
  "theme-color",
  "google-site-verification",
  "og",
  "article",
  "book",
  "profile",
  "twitter",
  "author"
]);
const allowedMetaProperties = ["name", "property", "http-equiv"];
const StandardSingleMetaTags = /* @__PURE__ */ new Set([
  "viewport",
  "description",
  "keywords",
  "robots"
]);
function isMetaArrayDupeKey(v) {
  const parts = v.split(":");
  if (!parts.length)
    return false;
  return MetaTagsArrayable.has(parts[1]);
}
function dedupeKey(tag) {
  const { props, tag: name } = tag;
  if (UniqueTags.has(name))
    return name;
  if (name === "link" && props.rel === "canonical")
    return "canonical";
  const altKey = props.hreflang || props.type;
  if (name === "link" && props.rel === "alternate" && altKey) {
    return `alternate:${altKey}`;
  }
  if (props.charset)
    return "charset";
  if (tag.tag === "meta") {
    for (const n of allowedMetaProperties) {
      if (props[n] !== void 0) {
        const propValue = props[n];
        const isStructured = propValue && typeof propValue === "string" && propValue.includes(":");
        const isStandardSingle = propValue && StandardSingleMetaTags.has(propValue);
        const shouldAlwaysDedupe = isStructured || isStandardSingle;
        const keyPart = !shouldAlwaysDedupe && tag.key ? `:key:${tag.key}` : "";
        return `${name}:${propValue}${keyPart}`;
      }
    }
  }
  if (tag.key) {
    return `${name}:key:${tag.key}`;
  }
  if (props.id) {
    return `${name}:id:${props.id}`;
  }
  if (TagsWithInnerContent.has(name)) {
    const v = tag.textContent || tag.innerHTML;
    if (v) {
      return `${name}:content:${v}`;
    }
  }
}
function walkResolver(val, resolve, key) {
  const type = typeof val;
  if (type === "function") {
    if (!key || key !== "titleTemplate" && !(key[0] === "o" && key[1] === "n")) {
      val = val();
    }
  }
  const v = resolve ? resolve(key, val) : val;
  if (Array.isArray(v)) {
    return v.map((r) => walkResolver(r, resolve));
  }
  if ((v == null ? void 0 : v.constructor) === Object) {
    const next = {};
    for (const k of Object.keys(v)) {
      next[k] = walkResolver(v[k], resolve, k);
    }
    return next;
  }
  return v;
}
function normalizeStyleClassProps(key, value) {
  const store = key === "style" ? /* @__PURE__ */ new Map() : /* @__PURE__ */ new Set();
  function processValue(rawValue) {
    if (rawValue == null || rawValue === void 0)
      return;
    const value2 = String(rawValue).trim();
    if (!value2)
      return;
    if (key === "style") {
      const [k, ...v] = value2.split(":").map((s) => s ? s.trim() : "");
      if (k && v.length)
        store.set(k, v.join(":"));
    } else {
      value2.split(" ").filter(Boolean).forEach((c) => store.add(c));
    }
  }
  if (typeof value === "string") {
    key === "style" ? value.split(";").forEach(processValue) : processValue(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => processValue(item));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([k, v]) => {
      if (v && v !== "false") {
        key === "style" ? store.set(String(k).trim(), String(v)) : processValue(k);
      }
    });
  }
  return store;
}
function normalizeProps(tag, input) {
  tag.props = tag.props || {};
  if (!input) {
    return tag;
  }
  if (tag.tag === "templateParams") {
    tag.props = input;
    return tag;
  }
  Object.entries(input).forEach(([key, value]) => {
    if (value === null) {
      tag.props[key] = null;
      return;
    }
    if (key === "class" || key === "style") {
      tag.props[key] = normalizeStyleClassProps(key, value);
      return;
    }
    if (TagConfigKeys.has(key)) {
      if (["textContent", "innerHTML"].includes(key) && typeof value === "object") {
        let type = input.type;
        if (!input.type) {
          type = "application/json";
        }
        if (!(type == null ? void 0 : type.endsWith("json")) && type !== "speculationrules") {
          return;
        }
        input.type = type;
        tag.props.type = type;
        tag[key] = JSON.stringify(value);
      } else {
        tag[key] = value;
      }
      return;
    }
    const strValue = String(value);
    const isDataKey = key.startsWith("data-");
    const isMetaContentKey = tag.tag === "meta" && key === "content";
    if (strValue === "true" || strValue === "") {
      tag.props[key] = isDataKey || isMetaContentKey ? strValue : true;
    } else if (!value && isDataKey && strValue === "false") {
      tag.props[key] = "false";
    } else if (value !== void 0) {
      tag.props[key] = value;
    }
  });
  return tag;
}
function normalizeTag(tagName, _input) {
  const input = typeof _input === "object" && typeof _input !== "function" ? _input : { [tagName === "script" || tagName === "noscript" || tagName === "style" ? "innerHTML" : "textContent"]: _input };
  const tag = normalizeProps({ tag: tagName, props: {} }, input);
  if (tag.key && DupeableTags.has(tag.tag)) {
    tag.props["data-hid"] = tag._h = tag.key;
  }
  if (tag.tag === "script" && typeof tag.innerHTML === "object") {
    tag.innerHTML = JSON.stringify(tag.innerHTML);
    tag.props.type = tag.props.type || "application/json";
  }
  return Array.isArray(tag.props.content) ? tag.props.content.map((v) => ({ ...tag, props: { ...tag.props, content: v } })) : tag;
}
function normalizeEntryToTags(input, propResolvers) {
  if (!input) {
    return [];
  }
  if (typeof input === "function") {
    input = input();
  }
  const resolvers = (key, val) => {
    for (let i = 0; i < propResolvers.length; i++) {
      val = propResolvers[i](key, val);
    }
    return val;
  };
  input = resolvers(void 0, input);
  const tags = [];
  input = walkResolver(input, resolvers);
  Object.entries(input || {}).forEach(([key, value]) => {
    if (value === void 0)
      return;
    for (const v of Array.isArray(value) ? value : [value])
      tags.push(normalizeTag(key, v));
  });
  return tags.flat();
}
const sortTags = (a, b) => a._w === b._w ? a._p - b._p : a._w - b._w;
const TAG_WEIGHTS = {
  base: -10,
  title: 10
};
const TAG_ALIASES = {
  critical: -8,
  high: -1,
  low: 2
};
const WEIGHT_MAP = {
  meta: {
    "content-security-policy": -30,
    "charset": -20,
    "viewport": -15
  },
  link: {
    "preconnect": 20,
    "stylesheet": 60,
    "preload": 70,
    "modulepreload": 70,
    "prefetch": 90,
    "dns-prefetch": 90,
    "prerender": 90
  },
  script: {
    async: 30,
    defer: 80,
    sync: 50
  },
  style: {
    imported: 40,
    sync: 60
  }
};
const ImportStyleRe = /@import/;
const isTruthy = (val) => val === "" || val === true;
function tagWeight(head, tag) {
  if (typeof tag.tagPriority === "number")
    return tag.tagPriority;
  let weight = 100;
  const offset = TAG_ALIASES[tag.tagPriority] || 0;
  const weightMap = head.resolvedOptions.disableCapoSorting ? {
    link: {},
    script: {},
    style: {}
  } : WEIGHT_MAP;
  if (tag.tag in TAG_WEIGHTS) {
    weight = TAG_WEIGHTS[tag.tag];
  } else if (tag.tag === "meta") {
    const metaType = tag.props["http-equiv"] === "content-security-policy" ? "content-security-policy" : tag.props.charset ? "charset" : tag.props.name === "viewport" ? "viewport" : null;
    if (metaType)
      weight = WEIGHT_MAP.meta[metaType];
  } else if (tag.tag === "link" && tag.props.rel) {
    weight = weightMap.link[tag.props.rel];
  } else if (tag.tag === "script") {
    const type = String(tag.props.type);
    if (isTruthy(tag.props.async)) {
      weight = weightMap.script.async;
    } else if (tag.props.src && !isTruthy(tag.props.defer) && !isTruthy(tag.props.async) && type !== "module" && !type.endsWith("json") || tag.innerHTML && !type.endsWith("json")) {
      weight = weightMap.script.sync;
    } else if (isTruthy(tag.props.defer) && tag.props.src && !isTruthy(tag.props.async) || type === "module") {
      weight = weightMap.script.defer;
    }
  } else if (tag.tag === "style") {
    weight = tag.innerHTML && ImportStyleRe.test(tag.innerHTML) ? weightMap.style.imported : weightMap.style.sync;
  }
  return (weight || 100) + offset;
}
function registerPlugin(head, p) {
  const plugin = typeof p === "function" ? p(head) : p;
  const key = plugin.key || String(head.plugins.size + 1);
  const exists = head.plugins.get(key);
  if (!exists) {
    head.plugins.set(key, plugin);
    head.hooks.addHooks(plugin.hooks || {});
  }
}
// @__NO_SIDE_EFFECTS__
function createUnhead(resolvedOptions = {}) {
  var _a;
  const hooks = createHooks();
  hooks.addHooks(resolvedOptions.hooks || {});
  const ssr = !resolvedOptions.document;
  const entries = /* @__PURE__ */ new Map();
  const plugins = /* @__PURE__ */ new Map();
  const normalizeQueue = /* @__PURE__ */ new Set();
  const head = {
    _entryCount: 1,
    // 0 is reserved for internal use
    plugins,
    dirty: false,
    resolvedOptions,
    hooks,
    ssr,
    entries,
    headEntries() {
      return [...entries.values()];
    },
    use: (p) => registerPlugin(head, p),
    push(input, _options) {
      const options = { ..._options || {} };
      delete options.head;
      const _i = options._index ?? head._entryCount++;
      const inst = { _i, input, options };
      const _ = {
        _poll(rm = false) {
          head.dirty = true;
          !rm && normalizeQueue.add(_i);
          hooks.callHook("entries:updated", head);
        },
        dispose() {
          if (entries.delete(_i)) {
            head.invalidate();
          }
        },
        // a patch is the same as creating a new entry, just a nice DX
        patch(input2) {
          if (!options.mode || options.mode === "server" && ssr || options.mode === "client" && !ssr) {
            inst.input = input2;
            entries.set(_i, inst);
            _._poll();
          }
        }
      };
      _.patch(input);
      return _;
    },
    async resolveTags() {
      const ctx = {
        tagMap: /* @__PURE__ */ new Map(),
        tags: [],
        entries: [...head.entries.values()]
      };
      await hooks.callHook("entries:resolve", ctx);
      while (normalizeQueue.size) {
        const i = normalizeQueue.values().next().value;
        normalizeQueue.delete(i);
        const e = entries.get(i);
        if (e) {
          const normalizeCtx = {
            tags: normalizeEntryToTags(e.input, resolvedOptions.propResolvers || []).map((t) => Object.assign(t, e.options)),
            entry: e
          };
          await hooks.callHook("entries:normalize", normalizeCtx);
          e._tags = normalizeCtx.tags.map((t, i2) => {
            t._w = tagWeight(head, t);
            t._p = (e._i << 10) + i2;
            t._d = dedupeKey(t);
            return t;
          });
        }
      }
      let hasFlatMeta = false;
      ctx.entries.flatMap((e) => (e._tags || []).map((t) => ({ ...t, props: { ...t.props } }))).sort(sortTags).reduce((acc, next) => {
        const k = String(next._d || next._p);
        if (!acc.has(k))
          return acc.set(k, next);
        const prev = acc.get(k);
        const strategy = (next == null ? void 0 : next.tagDuplicateStrategy) || (UsesMergeStrategy.has(next.tag) ? "merge" : null) || (next.key && next.key === prev.key ? "merge" : null);
        if (strategy === "merge") {
          const newProps = { ...prev.props };
          Object.entries(next.props).forEach(([p, v]) => (
            // @ts-expect-error untyped
            newProps[p] = p === "style" ? new Map([...prev.props.style || /* @__PURE__ */ new Map(), ...v]) : p === "class" ? /* @__PURE__ */ new Set([...prev.props.class || /* @__PURE__ */ new Set(), ...v]) : v
          ));
          acc.set(k, { ...next, props: newProps });
        } else if (next._p >> 10 === prev._p >> 10 && next.tag === "meta" && isMetaArrayDupeKey(k)) {
          acc.set(k, Object.assign([...Array.isArray(prev) ? prev : [prev], next], next));
          hasFlatMeta = true;
        } else if (next._w === prev._w ? next._p > prev._p : (next == null ? void 0 : next._w) < (prev == null ? void 0 : prev._w)) {
          acc.set(k, next);
        }
        return acc;
      }, ctx.tagMap);
      const title = ctx.tagMap.get("title");
      const titleTemplate = ctx.tagMap.get("titleTemplate");
      head._title = title == null ? void 0 : title.textContent;
      if (titleTemplate) {
        const titleTemplateFn = titleTemplate == null ? void 0 : titleTemplate.textContent;
        head._titleTemplate = titleTemplateFn;
        if (titleTemplateFn) {
          let newTitle = typeof titleTemplateFn === "function" ? titleTemplateFn(title == null ? void 0 : title.textContent) : titleTemplateFn;
          if (typeof newTitle === "string" && !head.plugins.has("template-params")) {
            newTitle = newTitle.replace("%s", (title == null ? void 0 : title.textContent) || "");
          }
          if (title) {
            newTitle === null ? ctx.tagMap.delete("title") : ctx.tagMap.set("title", { ...title, textContent: newTitle });
          } else {
            titleTemplate.tag = "title";
            titleTemplate.textContent = newTitle;
          }
        }
      }
      ctx.tags = Array.from(ctx.tagMap.values());
      if (hasFlatMeta) {
        ctx.tags = ctx.tags.flat().sort(sortTags);
      }
      await hooks.callHook("tags:beforeResolve", ctx);
      await hooks.callHook("tags:resolve", ctx);
      await hooks.callHook("tags:afterResolve", ctx);
      const finalTags = [];
      for (const t of ctx.tags) {
        const { innerHTML, tag, props } = t;
        if (!ValidHeadTags.has(tag)) {
          continue;
        }
        if (Object.keys(props).length === 0 && !t.innerHTML && !t.textContent) {
          continue;
        }
        if (tag === "meta" && !props.content && !props["http-equiv"] && !props.charset) {
          continue;
        }
        if (tag === "script" && innerHTML) {
          if (String(props.type).endsWith("json")) {
            const v = typeof innerHTML === "string" ? innerHTML : JSON.stringify(innerHTML);
            t.innerHTML = v.replace(/</g, "\\u003C");
          } else if (typeof innerHTML === "string") {
            t.innerHTML = innerHTML.replace(new RegExp(`</${tag}`, "g"), `<\\/${tag}`);
          }
          t._d = dedupeKey(t);
        }
        finalTags.push(t);
      }
      return finalTags;
    },
    invalidate() {
      for (const entry of entries.values()) {
        normalizeQueue.add(entry._i);
      }
      head.dirty = true;
      hooks.callHook("entries:updated", head);
    }
  };
  ((resolvedOptions == null ? void 0 : resolvedOptions.plugins) || []).forEach((p) => registerPlugin(head, p));
  head.hooks.callHook("init", head);
  (_a = resolvedOptions.init) == null ? void 0 : _a.forEach((e) => e && head.push(e));
  return head;
}
const VueResolver = (_, value) => {
  return isRef(value) ? toValue(value) : value;
};
const headSymbol = "usehead";
// @__NO_SIDE_EFFECTS__
function vueInstall(head) {
  const plugin = {
    install(app) {
      app.config.globalProperties.$unhead = head;
      app.config.globalProperties.$head = head;
      app.provide(headSymbol, head);
    }
  };
  return plugin.install;
}
// @__NO_SIDE_EFFECTS__
function createHead$1(options = {}) {
  const unhead = /* @__PURE__ */ createUnhead({
    ...options,
    // @ts-expect-error untyped
    document: false,
    propResolvers: [
      ...options.propResolvers || [],
      (k, v) => {
        if (k && k.startsWith("on") && typeof v === "function") {
          return `this.dataset.${k}fired = true`;
        }
        return v;
      }
    ],
    init: [
      options.disableDefaults ? void 0 : {
        htmlAttrs: {
          lang: "en"
        },
        meta: [
          {
            charset: "utf-8"
          },
          {
            name: "viewport",
            content: "width=device-width, initial-scale=1"
          }
        ]
      },
      ...options.init || []
    ]
  });
  unhead._ssrPayload = {};
  unhead.use({
    key: "server",
    hooks: {
      "tags:resolve": function(ctx) {
        const title = ctx.tagMap.get("title");
        const titleTemplate = ctx.tagMap.get("titleTemplate");
        let payload = {
          title: (title == null ? void 0 : title.mode) === "server" ? unhead._title : void 0,
          titleTemplate: (titleTemplate == null ? void 0 : titleTemplate.mode) === "server" ? unhead._titleTemplate : void 0
        };
        if (Object.keys(unhead._ssrPayload || {}).length > 0) {
          payload = {
            ...unhead._ssrPayload,
            ...payload
          };
        }
        if (Object.values(payload).some(Boolean)) {
          ctx.tags.push({
            tag: "script",
            innerHTML: JSON.stringify(payload),
            props: { id: "unhead:payload", type: "application/json" }
          });
        }
      }
    }
  });
  return unhead;
}
// @__NO_SIDE_EFFECTS__
function createHead(options = {}) {
  const head = /* @__PURE__ */ createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = /* @__PURE__ */ vueInstall(head);
  return head;
}
const ClientOnly = defineComponent({
  setup(props, { slots }) {
    const mounted = ref(false);
    onMounted(() => mounted.value = true);
    return () => {
      if (!mounted.value)
        return slots.placeholder && slots.placeholder({});
      return slots.default && slots.default({});
    };
  }
});
function ViteSSG(App, routerOptions, fn, options) {
  const {
    transformState,
    registerComponents = true,
    useHead = true,
    rootContainer = "#app"
  } = {};
  async function createApp$1(routePath) {
    const app = createSSRApp(App);
    let head;
    if (useHead) {
      app.use(head = /* @__PURE__ */ createHead());
    }
    const router = createRouter({
      history: createMemoryHistory(routerOptions.base),
      ...routerOptions
    });
    const { routes: routes2 } = routerOptions;
    if (registerComponents)
      app.component("ClientOnly", ClientOnly);
    const appRenderCallbacks = [];
    const onSSRAppRendered = (cb) => appRenderCallbacks.push(cb);
    const triggerOnSSRAppRendered = () => {
      return Promise.all(appRenderCallbacks.map((cb) => cb()));
    };
    const context = {
      app,
      head,
      isClient: false,
      router,
      routes: routes2,
      onSSRAppRendered,
      triggerOnSSRAppRendered,
      initialState: {},
      transformState,
      routePath
    };
    await (fn == null ? void 0 : fn(context));
    app.use(router);
    let entryRoutePath;
    let isFirstRoute = true;
    router.beforeEach((to, from, next) => {
      if (isFirstRoute || entryRoutePath && entryRoutePath === to.path) {
        isFirstRoute = false;
        entryRoutePath = to.path;
        to.meta.state = context.initialState;
      }
      next();
    });
    {
      const route = context.routePath ?? "/";
      router.push(route);
      await router.isReady();
      context.initialState = router.currentRoute.value.meta.state || {};
    }
    const initialState = context.initialState;
    return {
      ...context,
      initialState
    };
  }
  return createApp$1;
}
const _imports_0$1 = "/body_music_letters_logo.png";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$7 = {
  __name: "Header",
  __ssrInlineRender: true,
  setup(__props) {
    const scrolled = ref(false);
    function onScroll() {
      scrolled.value = window.scrollY > 10;
    }
    onMounted(() => {
      window.addEventListener("scroll", onScroll);
    });
    onUnmounted(() => {
      window.removeEventListener("scroll", onScroll);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_router_link = resolveComponent("router-link");
      _push(`<header${ssrRenderAttrs(mergeProps({
        class: ["site-header", { "site-header--scrolled": scrolled.value }]
      }, _attrs))} data-v-3b2bce9e><div class="header-inner" data-v-3b2bce9e>`);
      _push(ssrRenderComponent(_component_router_link, {
        to: "/",
        class: "header-logo"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", _imports_0$1)} alt="Body Music Radio" data-v-3b2bce9e${_scopeId}>`);
          } else {
            return [
              createVNode("img", {
                src: _imports_0$1,
                alt: "Body Music Radio"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<nav class="header-nav" data-v-3b2bce9e>`);
      _push(ssrRenderComponent(_component_router_link, { to: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Accueil`);
          } else {
            return [
              createTextVNode("Accueil")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_router_link, { to: "/schedule" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Programmation`);
          } else {
            return [
              createTextVNode("Programmation")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_router_link, { to: "/last-songs" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Dernières tracks`);
          } else {
            return [
              createTextVNode("Dernières tracks")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_router_link, { to: "/albums" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Nos albums`);
          } else {
            return [
              createTextVNode("Nos albums")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav></div></header>`);
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Header.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const Header = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-3b2bce9e"]]);
const _sfc_main$6 = {
  __name: "RadioPlayer",
  __ssrInlineRender: true,
  setup(__props) {
    const isPlaying = ref(false);
    const isLoading = ref(false);
    const isError = ref(false);
    const volume = ref(0.85);
    const statusText = computed(() => {
      if (isError.value) return "Erreur, réessayez";
      if (isLoading.value) return "Connexion au stream...";
      if (isPlaying.value) return "Bonne écoute !";
      return "Lancer la radio";
    });
    onUnmounted(() => {
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      const _component_router_link = resolveComponent("router-link");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "radio-player-bar section-card" }, _attrs))} data-v-b2ef2041><div class="player-stack" data-v-b2ef2041><div class="player-primary" data-v-b2ef2041><button class="player-btn"${ssrIncludeBooleanAttr(isLoading.value) ? " disabled" : ""} data-v-b2ef2041><span class="btn-glow" data-v-b2ef2041></span><span class="icon-wrapper" data-v-b2ef2041>`);
      _push(ssrRenderComponent(_component_font_awesome_icon, {
        icon: isPlaying.value ? "pause" : "play"
      }, null, _parent));
      _push(`</span></button><div class="player-meta" data-v-b2ef2041><p class="player-title" data-v-b2ef2041>Body Music Radio</p><p class="player-status" data-v-b2ef2041>${ssrInterpolate(statusText.value)}</p></div></div><div class="player-controls" data-v-b2ef2041><label class="volume-label" for="volume-range" data-v-b2ef2041>Volume</label><input id="volume-range" type="range" min="0" max="1" step="0.01"${ssrRenderAttr("value", volume.value)} data-v-b2ef2041></div><div class="action-menu" data-v-b2ef2041>`);
      _push(ssrRenderComponent(_component_router_link, { to: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "house"] }, null, _parent2, _scopeId));
            _push2(`<span data-v-b2ef2041${_scopeId}>Accueil</span>`);
          } else {
            return [
              createVNode(_component_font_awesome_icon, { icon: ["fas", "house"] }),
              createVNode("span", null, "Accueil")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_router_link, { to: "/schedule" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "calendar"] }, null, _parent2, _scopeId));
            _push2(`<span data-v-b2ef2041${_scopeId}>Prog</span>`);
          } else {
            return [
              createVNode(_component_font_awesome_icon, { icon: ["fas", "calendar"] }),
              createVNode("span", null, "Prog")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_router_link, { to: "/last-songs" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "music"] }, null, _parent2, _scopeId));
            _push2(`<span data-v-b2ef2041${_scopeId}>Historique</span>`);
          } else {
            return [
              createVNode(_component_font_awesome_icon, { icon: ["fas", "music"] }),
              createVNode("span", null, "Historique")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/RadioPlayer.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const RadioPlayer = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-b2ef2041"]]);
const _sfc_main$5 = {
  __name: "SiteFooter",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_router_link = resolveComponent("router-link");
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "site-footer" }, _attrs))} data-v-ba50d3bc><div class="footer-content" data-v-ba50d3bc><p class="site-footline" data-v-ba50d3bc>Webradio 100% lyonnaise.</p><p class="site-disclaimer" data-v-ba50d3bc>Ce site est la propriété de Body Music Radio.</p><nav class="site-plan" aria-label="Plan du site" data-v-ba50d3bc>`);
      _push(ssrRenderComponent(_component_router_link, { to: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Accueil`);
          } else {
            return [
              createTextVNode("Accueil")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_router_link, { to: "/schedule" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Programmation`);
          } else {
            return [
              createTextVNode("Programmation")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_router_link, { to: "/albums" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Albums`);
          } else {
            return [
              createTextVNode("Albums")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_router_link, { to: "/last-songs" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Dernières tracks`);
          } else {
            return [
              createTextVNode("Dernières tracks")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav></div></footer>`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/SiteFooter.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const Footer = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-ba50d3bc"]]);
const _sfc_main$4 = {
  __name: "App",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_router_view = resolveComponent("router-view");
      _push(`<div${ssrRenderAttrs(mergeProps({
        id: "app",
        class: "app-shell"
      }, _attrs))}>`);
      _push(ssrRenderComponent(Header, null, null, _parent));
      _push(`<main class="main-content">`);
      _push(ssrRenderComponent(_component_router_view, null, {
        default: withCtx(({ Component }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(``);
            ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(Component), null, null), _parent2, _scopeId);
          } else {
            return [
              createVNode(Transition, { name: "fade" }, {
                default: withCtx(() => [
                  (openBlock(), createBlock(resolveDynamicComponent(Component)))
                ]),
                _: 2
              }, 1024)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</main>`);
      _push(ssrRenderComponent(RadioPlayer, null, null, _parent));
      _push(ssrRenderComponent(Footer, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/App.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _imports_0 = "/body_music_duck_logo.png";
const fallbackCover = "https://music.niprobin.com/radio_cover.png";
const _sfc_main$3 = {
  __name: "Home",
  __ssrInlineRender: true,
  setup(__props) {
    const featuredAlbum = ref(null);
    const loadingFeatured = ref(true);
    function formatReleaseDate(value) {
      if (!value) return "Date inconnue";
      const [day, month, year] = String(value).split("-");
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      if (Number.isNaN(dateObj.getTime())) return value;
      return dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    }
    const formattedText = computed(() => {
      var _a;
      if (!((_a = featuredAlbum.value) == null ? void 0 : _a.text)) return [];
      return String(featuredAlbum.value.text).split("\n").map((line) => line.trim()).filter(Boolean);
    });
    async function loadFeaturedAlbum() {
      try {
        const res = await fetch("https://n8n.niprobin.com/webhook/featured-album");
        const data = await res.json();
        featuredAlbum.value = data && typeof data === "object" ? data : null;
      } catch (_) {
        featuredAlbum.value = null;
      } finally {
        loadingFeatured.value = false;
      }
    }
    onMounted(loadFeaturedAlbum);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_router_link = resolveComponent("router-link");
      if (!loadingFeatured.value) {
        _push(`<main${ssrRenderAttrs(_attrs)} data-v-3f9c3628><section class="home" data-v-3f9c3628><div class="home-content" data-v-3f9c3628><img${ssrRenderAttr("src", _imports_0)} alt="Body Music Radio Logo" class="home-logo" data-v-3f9c3628><div class="home-text" data-v-3f9c3628><h1 data-v-3f9c3628>Bienvenue sur Body Music Radio</h1><p data-v-3f9c3628> Selecta réalisée par nos soins pour te faire danser &amp; chiller toute la journée ! Tu aimes une track ? Tu peux directement checker ce qui est entrain de jouer.<br data-v-3f9c3628><br data-v-3f9c3628>Tu peux également regarder notre planning pour savoir à quoi t&#39;attendre sur la radio. </p></div></div></section>`);
        if (featuredAlbum.value) {
          _push(`<section class="featured-album" data-v-3f9c3628><div class="featured-cover" data-v-3f9c3628><img${ssrRenderAttr("src", featuredAlbum.value.cover_url || fallbackCover)}${ssrRenderAttr("alt", featuredAlbum.value.release_name || "Album du moment")} data-v-3f9c3628></div><div class="featured-info" data-v-3f9c3628><p class="featured-label" data-v-3f9c3628>Album du moment</p><h2 data-v-3f9c3628>${ssrInterpolate(featuredAlbum.value.release_name)}</h2><p class="featured-meta" data-v-3f9c3628> Sortie le ${ssrInterpolate(formatReleaseDate(featuredAlbum.value.release_date))}</p><span class="featured-genre" data-v-3f9c3628>${ssrInterpolate(featuredAlbum.value.genre || "Genre inconnu")}</span><div class="featured-text" data-v-3f9c3628><!--[-->`);
          ssrRenderList(formattedText.value, (paragraph, idx) => {
            _push(`<p data-v-3f9c3628>${ssrInterpolate(paragraph)}</p>`);
          });
          _push(`<!--]--></div>`);
          _push(ssrRenderComponent(_component_router_link, { to: "/albums" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<button class="more-albums" data-v-3f9c3628${_scopeId}>Découvrir plus d&#39;albums</button>`);
              } else {
                return [
                  createVNode("button", { class: "more-albums" }, "Découvrir plus d'albums")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div></section>`);
        } else {
          _push(`<section class="featured-placeholder" data-v-3f9c3628>`);
          if (loadingFeatured.value) {
            _push(`<p data-v-3f9c3628>Chargement en cours…</p>`);
          } else {
            _push(`<p data-v-3f9c3628>Pas d&#39;album du moment pour l&#39;instant.</p>`);
          }
          _push(`</section>`);
        }
        _push(`</main>`);
      } else {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "home-loading" }, _attrs))} data-v-3f9c3628><p data-v-3f9c3628>Chargement en cours…</p></section>`);
      }
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/Home.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const Home = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-3f9c3628"]]);
const _sfc_main$2 = {
  __name: "Schedule",
  __ssrInlineRender: true,
  setup(__props) {
    const schedule = ref({});
    const currentDay = ref("");
    const currentTime = ref(0);
    let intervalId;
    function getCurrentDay() {
      return (/* @__PURE__ */ new Date()).toLocaleString("fr-FR", { weekday: "long" });
    }
    function getCurrentTime() {
      const now = /* @__PURE__ */ new Date();
      return now.getHours() * 60 + now.getMinutes();
    }
    function isCurrentShow(day, show) {
      if (day !== currentDay.value) return false;
      const [startH, startM] = show.start.split(":").map(Number);
      const [endH, endM] = show.end.split(":").map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;
      return currentTime.value >= start && currentTime.value < end;
    }
    async function loadSchedule() {
      try {
        const response = await fetch("/schedule.json");
        schedule.value = await response.json();
        currentDay.value = getCurrentDay();
        currentTime.value = getCurrentTime();
      } catch (e) {
        console.error("Error loading schedule:", e);
      }
    }
    onMounted(() => {
      loadSchedule();
      intervalId = setInterval(() => {
        currentDay.value = getCurrentDay();
        currentTime.value = getCurrentTime();
      }, 60 * 1e3);
    });
    onUnmounted(() => {
      if (intervalId) clearInterval(intervalId);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "schedule-page" }, _attrs))} data-v-ed26843f><div class="schedule-header" data-v-ed26843f><h1 data-v-ed26843f>Programmation</h1><p data-v-ed26843f>On commence la journée doucement puis on monte tout doucement le rythme !</p></div><div class="schedule-list" data-v-ed26843f><!--[-->`);
      ssrRenderList(schedule.value, (shows, day) => {
        _push(`<div class="schedule-day" data-v-ed26843f><div class="schedule-day__header" data-v-ed26843f><h3 data-v-ed26843f>${ssrInterpolate(day)}</h3>`);
        if (day === currentDay.value) {
          _push(`<span class="schedule-day__tag" data-v-ed26843f>Aujourd&#39;hui</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="schedule-day__body" data-v-ed26843f><!--[-->`);
        ssrRenderList(shows, (show) => {
          _push(`<article class="${ssrRenderClass(["schedule-item", { "schedule-item--current": isCurrentShow(day, show) }])}" data-v-ed26843f><div class="schedule-item__time" data-v-ed26843f>${ssrInterpolate(show.start)} – ${ssrInterpolate(show.end)}</div><div class="schedule-item__name" data-v-ed26843f>${ssrInterpolate(show.show)}</div></article>`);
        });
        _push(`<!--]--></div></div>`);
      });
      _push(`<!--]--></div></section>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/Schedule.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const Schedule = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-ed26843f"]]);
const fallbackArt$1 = "https://music.niprobin.com/radio_cover.png";
const _sfc_main$1 = {
  __name: "LastSongs",
  __ssrInlineRender: true,
  setup(__props) {
    const nowPlaying = ref(null);
    const history = ref([]);
    let intervalId;
    function formatPlayedAt(ts) {
      const date = new Date(ts * 1e3);
      const now = /* @__PURE__ */ new Date();
      const isToday = date.toDateString() === now.toDateString();
      const hours = date.getHours().toString().padStart(2, "0");
      const mins = date.getMinutes().toString().padStart(2, "0");
      return isToday ? `Aujourd'hui à ${hours}h${mins}` : `${date.toLocaleDateString()} à ${hours}h${mins}`;
    }
    const filteredHistory = computed(() => {
      if (!nowPlaying.value) return history.value;
      return history.value.filter(
        (entry) => {
          var _a, _b, _c, _d;
          return !(((_a = entry.song) == null ? void 0 : _a.title) === ((_b = nowPlaying.value.song) == null ? void 0 : _b.title) && ((_c = entry.song) == null ? void 0 : _c.artist) === ((_d = nowPlaying.value.song) == null ? void 0 : _d.artist));
        }
      );
    });
    async function fetchSongs() {
      try {
        const res = await fetch("https://azuracast.niprobin.com/api/nowplaying/body_music_radio?cb=" + Date.now());
        const data = await res.json();
        nowPlaying.value = data.now_playing;
        history.value = data.song_history.slice(0, 10);
      } catch (err) {
        history.value = [];
        nowPlaying.value = null;
        console.error(err);
      }
    }
    onMounted(() => {
      fetchSongs();
      intervalId = setInterval(() => fetchSongs(), 1e4);
    });
    onUnmounted(() => {
      if (intervalId) clearInterval(intervalId);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "last-songs" }, _attrs))} data-v-ad25f10a><div class="last-songs__header" data-v-ad25f10a><h1 data-v-ad25f10a>Dernières tracks jouées</h1><p data-v-ad25f10a>Tu aimes le dernier son que t&#39;as entendu ? Tu le trouves ici fastoche.</p></div><div class="history-list" data-v-ad25f10a>`);
      if (nowPlaying.value) {
        _push(`<div class="history-item current" data-v-ad25f10a><img class="history-cover"${ssrRenderAttr("src", nowPlaying.value.song.art || fallbackArt$1)} alt="Album cover" data-v-ad25f10a><div class="history-meta" data-v-ad25f10a><div class="history-row" data-v-ad25f10a><p class="history-title" data-v-ad25f10a>${ssrInterpolate(nowPlaying.value.song.title || "Unknown Title")}</p><span class="history-tag" data-v-ad25f10a>En ce moment</span></div><p class="history-artist" data-v-ad25f10a>${ssrInterpolate(nowPlaying.value.song.artist || "Unknown Artist")}</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(filteredHistory.value, (entry) => {
        _push(`<div class="history-item" data-v-ad25f10a><img class="history-cover"${ssrRenderAttr("src", entry.song.art || fallbackArt$1)} alt="Album cover" data-v-ad25f10a><div class="history-meta" data-v-ad25f10a><div class="history-row" data-v-ad25f10a><p class="history-title" data-v-ad25f10a>${ssrInterpolate(entry.song.title || "Unknown Title")}</p><span class="history-time" data-v-ad25f10a>${ssrInterpolate(formatPlayedAt(entry.played_at))}</span></div><p class="history-artist" data-v-ad25f10a>${ssrInterpolate(entry.song.artist || "Unknown Artist")}</p></div></div>`);
      });
      _push(`<!--]--></div></section>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/LastSongs.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const LastSongs = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-ad25f10a"]]);
const fallbackArt = "https://music.niprobin.com/radio_cover.png";
const CACHE_KEY = "albums_cache";
const CACHE_TIME_KEY = "albums_cache_time";
const CACHE_TTL = 24 * 60 * 60 * 1e3;
const _sfc_main = {
  __name: "Albums",
  __ssrInlineRender: true,
  setup(__props) {
    const albums = ref([]);
    const loading = ref(true);
    const error = ref("");
    async function loadAlbums() {
      try {
        const cachedValue = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        const cached = cachedValue ? JSON.parse(cachedValue) : null;
        const isCacheValid = cached && cachedTime && Date.now() - Number(cachedTime) < CACHE_TTL;
        if (isCacheValid) {
          albums.value = cached;
        }
        const res = await fetch("https://n8n.niprobin.com/webhook/liked-albums");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data ? [data] : [];
        if (!cached || JSON.stringify(list) !== JSON.stringify(cached)) {
          albums.value = list;
          localStorage.setItem(CACHE_KEY, JSON.stringify(list));
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        }
      } catch (err) {
        error.value = "Impossible de charger les albums.";
      } finally {
        loading.value = false;
      }
    }
    onMounted(loadAlbums);
    const groupedAlbums = computed(() => {
      const groups = /* @__PURE__ */ new Map();
      const parseMonthKey = (album) => {
        const raw = album.liked_date;
        if (!raw) return { key: "none", label: "Sans date", ts: -Infinity };
        const [day, month, year] = String(raw).split("-");
        const monthIndex = Number(month) - 1;
        const dateObj = new Date(Number(year), monthIndex, 1);
        if (Number.isNaN(dateObj.getTime())) return { key: "none", label: "Sans date", ts: -Infinity };
        const label = dateObj.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
        return {
          key: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
          label,
          ts: dateObj.getTime()
        };
      };
      for (const album of albums.value) {
        const { key, label, ts } = parseMonthKey(album);
        if (!groups.has(key)) {
          groups.set(key, { label, ts, items: [] });
        }
        groups.get(key).items.push(album);
      }
      return [...groups.values()].sort((a, b) => b.ts - a.ts).map((group) => ({
        label: group.label,
        items: [...group.items].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      }));
    });
    function formatReleaseDate(value) {
      if (!value) return "Date inconnue";
      const [day, month, year] = String(value).split("-");
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      if (Number.isNaN(dateObj.getTime())) return value;
      return dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    }
    function getAlbumLink(album) {
      if (!album) return "";
      if (album.has_review && album.slug) {
        return `/albums/${album.slug}`;
      }
      const discogs = (album.discogs_url || "").trim();
      const spotify = (album.spotify_url || "").trim();
      const hasCompleteDiscogs = discogs && (discogs.includes("/release") || discogs.includes("/master"));
      if (hasCompleteDiscogs) {
        return discogs;
      }
      if (discogs === "https://www.discogs.com" && spotify) {
        return spotify;
      }
      if (!discogs && spotify) {
        return spotify;
      }
      return "";
    }
    function isInternalLink(album) {
      if (!album) return false;
      return album.has_review && album.slug;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "albums-page" }, _attrs))} data-v-57478d80><div class="albums-header" data-v-57478d80><h1 data-v-57478d80>Nos albums préférés</h1><p data-v-57478d80>On écoute un paquet de musique et parfois on tente de vous partager nos albums préférés !</p></div>`);
      if (loading.value) {
        _push(`<div class="status-card" data-v-57478d80>Chargement…</div>`);
      } else if (error.value) {
        _push(`<div class="status-card error" data-v-57478d80>${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<div class="albums-group" data-v-57478d80><!--[-->`);
        ssrRenderList(groupedAlbums.value, (group) => {
          _push(`<div class="albums-month" data-v-57478d80><h2 data-v-57478d80>${ssrInterpolate(group.label)}</h2><div class="albums-grid" data-v-57478d80><!--[-->`);
          ssrRenderList(group.items, (album) => {
            _push(`<article class="album-card" data-v-57478d80>`);
            if (getAlbumLink(album)) {
              _push(`<a${ssrRenderAttr("href", getAlbumLink(album))}${ssrRenderAttr("target", isInternalLink(album) ? "" : "_blank")}${ssrRenderAttr("rel", isInternalLink(album) ? "" : "noopener")} class="album-cover-link" data-v-57478d80><div class="album-cover-container" data-v-57478d80><img${ssrRenderAttr("src", album.cover_url || fallbackArt)}${ssrRenderAttr("alt", album.release_name || "Couverture album")} class="album-cover" data-v-57478d80>`);
              if (isInternalLink(album)) {
                _push(`<div class="review-badge" data-v-57478d80> 📝 </div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></a>`);
            } else {
              _push(`<img${ssrRenderAttr("src", album.cover_url || fallbackArt)}${ssrRenderAttr("alt", album.release_name || "Couverture album")} class="album-cover" data-v-57478d80>`);
            }
            _push(`<div class="album-meta" data-v-57478d80><p class="album-name" data-v-57478d80>${ssrInterpolate(album.release_name || "Titre inconnu")}</p><p class="album-date" data-v-57478d80> Sortie le ${ssrInterpolate(formatReleaseDate(album.release_date))}</p>`);
            if (album.rating) {
              _push(`<div class="album-rating" data-v-57478d80><!--[-->`);
              ssrRenderList(5, (n) => {
                _push(`<span class="${ssrRenderClass(["album-star", { "album-star--filled": n <= album.rating }])}" data-v-57478d80>★</span>`);
              });
              _push(`<!--]--></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></article>`);
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</section>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/Albums.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Albums = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-57478d80"]]);
const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/schedule", name: "Schedule", component: Schedule },
  { path: "/last-songs", name: "LastSongs", component: LastSongs },
  { path: "/albums", name: "Albums", component: Albums },
  { path: "/albums/:slug", name: "AlbumReview", component: () => import("./assets/AlbumReview-DHkOOaC5.js") }
];
createRouter({
  history: createWebHistory(),
  routes
});
library.add(faPlay, faPause, faHouse, faCalendar, faMusic, faLink);
const createApp = ViteSSG(
  _sfc_main$4,
  { routes },
  ({ app, router, routes: routes2, isClient, initialState }) => {
    app.component("font-awesome-icon", FontAwesomeIcon);
  }
);
export {
  _export_sfc as _,
  createApp
};
