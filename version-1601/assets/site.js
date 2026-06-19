(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function startHero() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    showSlide(current + 1);
                }, 5600);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
                    showSlide(index);
                    startHero();
                });
            });

            showSlide(0);
            startHero();
        }

        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video[data-stream]");
            var button = player.querySelector("[data-play]");
            var hlsInstance = null;
            var loaded = false;

            function prepareVideo() {
                if (!video || loaded) {
                    return;
                }
                loaded = true;
                var streamUrl = video.getAttribute("data-stream");
                if (!streamUrl) {
                    return;
                }
                if (globalThis.Hls && globalThis.Hls.isSupported()) {
                    hlsInstance = new globalThis.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            function playVideo() {
                prepareVideo();
                if (!video) {
                    return;
                }
                var promise = video.play();
                if (promise && typeof promise.then === "function") {
                    promise.then(function () {
                        if (button) {
                            button.classList.add("is-hidden");
                        }
                    }).catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                } else if (button) {
                    button.classList.add("is-hidden");
                }
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }
            if (video) {
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                });
                video.addEventListener("pause", function () {
                    if (button && video.currentTime === 0) {
                        button.classList.remove("is-hidden");
                    }
                });
                video.addEventListener("loadedmetadata", function () {
                    if (video.paused && button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var section = scope.closest(".section-block");
            if (!section) {
                return;
            }
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
            var keyword = scope.querySelector("[data-page-filter='keyword']");
            var type = scope.querySelector("[data-page-filter='type']");
            var year = scope.querySelector("[data-page-filter='year']");
            var empty = section.querySelector("[data-empty-state]");

            function applyFilters() {
                var q = keyword ? keyword.value.trim().toLowerCase() : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year")
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (typeValue && card.getAttribute("data-type") !== typeValue) {
                        ok = false;
                    }
                    if (yearValue && card.getAttribute("data-year") !== yearValue) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [keyword, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });
        });

        var searchForm = document.querySelector("[data-global-search-form]");
        var searchInput = document.querySelector("[data-global-search-input]");
        var searchResults = document.querySelector("[data-search-results]");
        var searchTitle = document.querySelector("[data-search-title]");
        if (searchForm && searchInput && searchResults && globalThis.siteMovieIndex) {
            var params = new URLSearchParams(location.search);
            var initial = params.get("q") || "";
            searchInput.value = initial;

            function cardTemplate(item) {
                return "<article class=\"movie-card\">" +
                    "<a class=\"poster-link\" href=\"" + item.url + "\">" +
                    "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
                    "</a>" +
                    "<div class=\"movie-card-body\">" +
                    "<div class=\"movie-meta-line\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.region) + "</span></div>" +
                    "<h3><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h3>" +
                    "<p>" + escapeHtml(item.description) + "</p>" +
                    "<div class=\"tag-row\"><span>" + escapeHtml(item.genre) + "</span></div>" +
                    "</div>" +
                    "</article>";
            }

            function escapeHtml(value) {
                return String(value || "").replace(/[&<>\"]/g, function (char) {
                    return {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        "\"": "&quot;"
                    }[char];
                });
            }

            function runSearch() {
                var q = searchInput.value.trim().toLowerCase();
                if (!q) {
                    searchTitle.textContent = "热门推荐";
                    return;
                }
                var terms = q.split(/\s+/).filter(Boolean);
                var results = globalThis.siteMovieIndex.filter(function (item) {
                    var haystack = [item.title, item.year, item.type, item.region, item.genre, item.tags, item.description].join(" ").toLowerCase();
                    return terms.every(function (term) {
                        return haystack.indexOf(term) !== -1;
                    });
                }).slice(0, 60);
                searchTitle.textContent = "搜索结果";
                searchResults.innerHTML = results.length ? results.map(cardTemplate).join("") : "<div class=\"empty-state is-visible\">没有匹配的影片</div>";
            }

            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                var q = searchInput.value.trim();
                history.replaceState(null, "", q ? "?q=" + encodeURIComponent(q) : location.pathname);
                runSearch();
            });

            if (initial) {
                runSearch();
            }
        }
    });
})();
