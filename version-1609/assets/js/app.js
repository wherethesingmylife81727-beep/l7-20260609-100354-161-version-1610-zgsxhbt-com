(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      mobilePanel.hidden = isOpen;
      document.body.classList.toggle('no-scroll', !isOpen);
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === activeSlide);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === activeSlide);
      dot.setAttribute('aria-current', current === activeSlide ? 'true' : 'false');
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var searchInput = document.getElementById('searchInput');
  var typeFilter = document.getElementById('typeFilter');
  var regionFilter = document.getElementById('regionFilter');
  var yearFilter = document.getElementById('yearFilter');
  var channelFilter = document.getElementById('channelFilter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function textOf(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-type'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' '));
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput && searchInput.value);
    var selectedType = normalize(typeFilter && typeFilter.value);
    var selectedRegion = normalize(regionFilter && regionFilter.value);
    var selectedYear = normalize(yearFilter && yearFilter.value);
    var selectedChannel = normalize(channelFilter && channelFilter.value);
    var visible = 0;

    cards.forEach(function (card) {
      var matchesQuery = !query || textOf(card).indexOf(query) !== -1;
      var matchesType = !selectedType || normalize(card.getAttribute('data-type')) === selectedType;
      var matchesRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
      var matchesYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
      var matchesChannel = !selectedChannel || normalize(card.getAttribute('data-channel')) === selectedChannel;
      var shouldShow = matchesQuery && matchesType && matchesRegion && matchesYear && matchesChannel;
      card.setAttribute('data-filter-hidden', shouldShow ? 'false' : 'true');
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  [searchInput, typeFilter, regionFilter, yearFilter, channelFilter].forEach(function (element) {
    if (element) {
      element.addEventListener('input', applyFilters);
      element.addEventListener('change', applyFilters);
    }
  });

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
    }
    applyFilters();
  }

  function startVideo(video, overlay) {
    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }

    if (!video.dataset.ready) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = stream;
      }
      video.dataset.ready = 'true';
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-card')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startVideo(video, overlay);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo(video, overlay);
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }
  });
})();
