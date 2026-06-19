import { H as Hls } from "./hls.js";

var players = new WeakMap();

function attachSource(video, source) {
    var current = players.get(video);

    if (current) {
        current.destroy();
        players.delete(video);
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.load();
        return;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        players.set(video, hls);
        return;
    }

    video.src = source;
    video.load();
}

export function setupPlayer(videoId, source, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);

    if (!video || !source) {
        return;
    }

    var started = false;

    function startPlayback() {
        if (!started) {
            attachSource(video, source);
            started = true;
        }

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
        if (!started) {
            startPlayback();
        }
    });
}
