(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    var searchInput = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    var empty = document.querySelector("[data-search-empty]");
    var clearButton = document.querySelector("[data-clear-search]");

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilter(value) {
        var keyword = normalize(value);
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search-text") || card.textContent);
            var visible = !keyword || haystack.indexOf(keyword) !== -1;
            card.style.display = visible ? "" : "none";
            if (visible) {
                visibleCount += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visibleCount === 0);
        }
    }

    if (searchInput && cards.length) {
        var paramName = searchInput.getAttribute("data-query-param");

        if (paramName) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get(paramName);
            if (initial) {
                searchInput.value = initial;
                applyFilter(initial);
            }
        }

        searchInput.addEventListener("input", function () {
            applyFilter(searchInput.value);
        });
    }

    if (clearButton && searchInput) {
        clearButton.addEventListener("click", function () {
            searchInput.value = "";
            applyFilter("");
            searchInput.focus();
        });
    }
})();
