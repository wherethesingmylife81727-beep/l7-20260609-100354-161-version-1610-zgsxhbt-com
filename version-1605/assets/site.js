(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initImages();
    initSearchPage();
    initPlayers();
  });

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var drawer = document.querySelector("[data-mobile-drawer]");
    if (!toggle || !drawer) {
      return;
    }
    toggle.addEventListener("click", function () {
      drawer.classList.toggle("is-open");
    });
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        drawer.classList.remove("is-open");
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var input = root.querySelector("[data-filter-input]");
      var year = root.querySelector("[data-filter-year]");
      var type = root.querySelector("[data-filter-type]");
      var count = root.querySelector("[data-filter-count]");
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card, .rank-row"));
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-card-text") || "").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            ok = false;
          }
          if (t && (card.getAttribute("data-type") || "").indexOf(t) === -1) {
            ok = false;
          }
          card.classList.toggle("is-hidden-by-filter", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = "匹配影片 " + visible + " 部";
        }
      }
      [input, year, type].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-image-error");
      });
    });
  }

  function initSearchPage() {
    var input = document.getElementById("global-search");
    var button = document.getElementById("global-search-button");
    var results = document.getElementById("search-results");
    var status = document.getElementById("search-status");
    if (!input || !results || !status || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
      input.value = initial;
    }
    function render() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = "";
        status.textContent = "请输入关键词开始搜索";
        return;
      }
      var matched = window.SEARCH_INDEX.filter(function (item) {
        return item.text.indexOf(q) !== -1;
      }).slice(0, 120);
      status.textContent = "找到 " + matched.length + " 条相关影片";
      results.innerHTML = matched.map(function (item) {
        return '<article class="movie-card"><a href="' + item.url + '"><div class="poster-shell"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="poster-year">' + escapeHtml(item.year) + '</span><span class="poster-play">▶</span></div><div class="movie-card-body"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p><div class="card-meta"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span></div></div></a></article>';
      }).join("");
      initImages();
    }
    input.addEventListener("input", render);
    if (button) {
      button.addEventListener("click", render);
    }
    render();
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var overlay = wrap.querySelector(".play-overlay");
      var src = wrap.getAttribute("data-src");
      var hlsInstance = null;
      if (!video || !src) {
        return;
      }
      function bindSource() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
        video.setAttribute("data-ready", "1");
      }
      function start() {
        bindSource();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }
      if (overlay) {
        overlay.addEventListener("click", start);
      }
      wrap.addEventListener("click", function (event) {
        if (event.target === video && video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
