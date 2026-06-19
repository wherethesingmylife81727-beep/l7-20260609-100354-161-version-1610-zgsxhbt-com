(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var siteNav = document.querySelector('[data-site-nav]');

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startCarousel() {
      stopCarousel();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    function stopCarousel() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startCarousel();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startCarousel();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startCarousel();
      });
    }

    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);
    showSlide(0);
    startCarousel();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var root = panel.closest('section') || document;
    var list = root.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var sortSelect = panel.querySelector('[data-filter-sort]');
    var cards = Array.prototype.slice.call(list.children);
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q');

    if (queryValue && keywordInput) {
      keywordInput.value = queryValue;
    }

    function getText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var matchKeyword = !keyword || getText(card).indexOf(keyword) !== -1;
        var matchCategory = !category || card.getAttribute('data-category') === category;
        var matchYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('is-hidden', !(matchKeyword && matchCategory && matchYear));
      });
    }

    function applySort() {
      if (!sortSelect) {
        return;
      }

      var mode = sortSelect.value;
      var sorted = cards.slice();

      if (mode === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        });
      }

      if (mode === 'heat') {
        sorted.sort(function (a, b) {
          var aText = a.textContent || '';
          var bText = b.textContent || '';
          return bText.localeCompare(aText, 'zh-CN');
        });
      }

      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    [keywordInput, categorySelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        applySort();
        applyFilter();
      });
    }

    applyFilter();
  });

  var player = document.querySelector('.movie-player');
  var overlay = document.querySelector('.player-overlay');
  var hlsInstance = null;

  function preparePlayer() {
    if (!player || player.getAttribute('data-ready') === '1') {
      return;
    }

    var source = player.getAttribute('data-hls');

    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(player);
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = source;
    }

    player.setAttribute('data-ready', '1');
  }

  function playMovie() {
    if (!player) {
      return;
    }

    preparePlayer();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playPromise = player.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  if (player) {
    player.addEventListener('click', function () {
      if (player.paused) {
        playMovie();
      }
    });

    player.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    player.addEventListener('pause', function () {
      if (player.currentTime === 0 && overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', playMovie);
  }
})();
