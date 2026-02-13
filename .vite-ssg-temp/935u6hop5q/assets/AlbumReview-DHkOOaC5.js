import { ref, onMounted, computed, resolveComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrRenderClass } from "vue/server-renderer";
import { useRoute, useRouter } from "vue-router";
import { _ as _export_sfc } from "../main.mjs";
import "hookable";
import "howler";
import "@fortawesome/fontawesome-svg-core";
import "@fortawesome/free-solid-svg-icons";
import "@fortawesome/vue-fontawesome";
const fallbackArt = "https://music.niprobin.com/radio_cover.png";
const _sfc_main = {
  __name: "AlbumReview",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const album = ref(null);
    const loading = ref(true);
    const error = ref("");
    async function loadAlbum() {
      try {
        const slug = route.params.slug;
        if (!slug) {
          error.value = "Slug d'album manquant";
          return;
        }
        const res = await fetch("https://n8n.niprobin.com/webhook/liked-albums");
        const data = await res.json();
        const albums = Array.isArray(data) ? data : data ? [data] : [];
        const foundAlbum = albums.find((a) => a.slug === slug && a.has_review);
        if (!foundAlbum) {
          error.value = "Album non trouvé ou sans review";
          return;
        }
        album.value = foundAlbum;
      } catch (err) {
        error.value = "Impossible de charger l'album";
        console.error("Error loading album:", err);
      } finally {
        loading.value = false;
      }
    }
    onMounted(loadAlbum);
    const formattedReviewText = computed(() => {
      var _a;
      if (!((_a = album.value) == null ? void 0 : _a.text)) return "";
      return album.value.text.split("\n\n").map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`).join("");
    });
    function formatReleaseDate(value) {
      if (!value) return "Date inconnue";
      const [day, month, year] = String(value).split("-");
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      if (Number.isNaN(dateObj.getTime())) return value;
      return dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    }
    function getExternalLink(album2) {
      if (!album2) return "";
      const discogs = (album2.discogs_url || "").trim();
      const spotify = (album2.spotify_url || "").trim();
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
    function getExternalLinkText(album2) {
      const link = getExternalLink(album2);
      if (link.includes("discogs.com")) return "Discogs";
      if (link.includes("spotify.com")) return "Spotify";
      return "Site externe";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_router_link = resolveComponent("router-link");
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "album-review-page" }, _attrs))} data-v-aed9dea7>`);
      if (loading.value) {
        _push(`<div class="status-card" data-v-aed9dea7>Chargement…</div>`);
      } else if (error.value) {
        _push(`<div class="status-card error" data-v-aed9dea7>${ssrInterpolate(error.value)}</div>`);
      } else if (!album.value) {
        _push(`<div class="status-card error" data-v-aed9dea7>Album non trouvé</div>`);
      } else {
        _push(`<div class="review-content" data-v-aed9dea7><nav class="review-nav" data-v-aed9dea7>`);
        _push(ssrRenderComponent(_component_router_link, {
          to: "/albums",
          class: "back-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` ← Retour aux albums `);
            } else {
              return [
                createTextVNode(" ← Retour aux albums ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</nav><header class="album-header" data-v-aed9dea7><div class="album-cover-section" data-v-aed9dea7><img${ssrRenderAttr("src", album.value.cover_url || fallbackArt)}${ssrRenderAttr("alt", album.value.release_name || "Couverture album")} class="album-cover-large" data-v-aed9dea7></div><div class="album-info" data-v-aed9dea7><h1 data-v-aed9dea7>${ssrInterpolate(album.value.release_name || "Titre inconnu")}</h1><p class="album-details" data-v-aed9dea7> Sortie le ${ssrInterpolate(formatReleaseDate(album.value.release_date))}</p>`);
        if (album.value.rating) {
          _push(`<div class="album-rating" data-v-aed9dea7><!--[-->`);
          ssrRenderList(5, (n) => {
            _push(`<span class="${ssrRenderClass(["album-star", { "album-star--filled": n <= album.value.rating }])}" data-v-aed9dea7>★</span>`);
          });
          _push(`<!--]--><span class="rating-text" data-v-aed9dea7>${ssrInterpolate(album.value.rating)}/5</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="album-links" data-v-aed9dea7>`);
        if (getExternalLink(album.value)) {
          _push(`<a${ssrRenderAttr("href", getExternalLink(album.value))} target="_blank" rel="noopener" class="external-link" data-v-aed9dea7> Voir sur ${ssrInterpolate(getExternalLinkText(album.value))} → </a>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></header><main class="review-main" data-v-aed9dea7><div class="review-text" data-v-aed9dea7>${formattedReviewText.value ?? ""}</div></main></div>`);
      }
      _push(`</section>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/AlbumReview.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const AlbumReview = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-aed9dea7"]]);
export {
  AlbumReview as default
};
