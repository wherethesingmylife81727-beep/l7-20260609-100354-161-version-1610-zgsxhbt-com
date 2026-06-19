(function () {
    var players = new WeakMap();

    function getElement(id) {
        return document.getElementById(id);
    }

    async function loadHlsClass() {
        if (window.Hls) {
            return window.Hls;
        }
        try {
            var module = await import("./video-vendor-dru42stk.js");
            return module.H;
        } catch (error) {
            return null;
        }
    }

    async function attachSource(video, source) {
        if (players.get(video)) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            players.set(video, true);
            return;
        }
        var HlsClass = await loadHlsClass();
        if (HlsClass && HlsClass.isSupported()) {
            var hls = new HlsClass({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            players.set(video, hls);
            return;
        }
        video.src = source;
        players.set(video, true);
    }

    window.setupMoviePlayer = function (config) {
        var video = getElement(config.videoId);
        var overlay = getElement(config.overlayId);
        var button = getElement(config.buttonId);
        if (!video || !overlay || !button || !config.source) {
            return;
        }

        async function start() {
            overlay.classList.add("is-hidden");
            await attachSource(video, config.source);
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", start);
        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };
}());
