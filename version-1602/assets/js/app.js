(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = parseInt(dot.getAttribute("data-hero-dot"), 10);
                show(next);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector(".filter-input");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search]"));
            if (!input || cards.length === 0) {
                return;
            }
            var initial = getQueryValue("q");
            if (initial && input.classList.contains("global-search-input")) {
                input.value = initial;
            }
            function apply() {
                var term = normalize(input.value);
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    card.classList.toggle("hidden-card", term !== "" && haystack.indexOf(term) === -1);
                });
            }
            input.addEventListener("input", apply);
            apply();
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
    });
}());
