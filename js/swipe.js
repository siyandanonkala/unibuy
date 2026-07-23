window.UniBuySwipe = (function () {

    const viewer = document.getElementById("swipeViewer");
    const track = document.getElementById("swipeTrack");
    const closeBtn = document.getElementById("swipeClose");

    let originalProducts = [];
    let feed = [];
    let currentIndex = 0;
    let photoIndex = {};       
    let likedIds = new Set();
    let savedIds = new Set();
    let notInterestedCategories = new Set();

    const RENDER_RADIUS = 1;   
    function formatPrice(amount) {
        return "R " + Number(amount).toLocaleString("en-ZA");
    }

    function open(index, products) {
        originalProducts = products.slice();
        feed = products.slice();
        currentIndex = index;
        photoIndex = {};
        likedIds = new Set();
        savedIds = new Set();
        notInterestedCategories = new Set();

        viewer.classList.remove("hidden");
        viewer.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        renderSlides(true);
        preloadAround(currentIndex);
        attachGestures();
    }

    function close() {
        viewer.classList.add("hidden");
        viewer.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        track.innerHTML = "";
        detachGestures();
    }

    function extendFeedIfNeeded() {
        while (feed.length < currentIndex + RENDER_RADIUS + 3) {
            const pool = originalProducts.filter(function (p) {
                return !notInterestedCategories.has(p.category);
            });
            const source = pool.length ? pool : originalProducts;
            feed.push(source[feed.length % source.length]);
        }
    }

    function preloadAround(index) {
        for (let i = index - 1; i <= index + 2; i++) {
            if (i < 0 || i >= feed.length) continue;
            const product = feed[i];
            if (!product) continue;
            const images = (product.images && product.images.length) ? product.images : [product.image];
            images.forEach(function (src) {
                const img = new Image();
                img.src = src;
            });
        }
    }

    function actionButton(action, icon, label, activeClass) {
        return (
            '<button class="swipe-action-btn ' + (activeClass || "") + '" data-action="' + action + '" aria-label="' + label + '">' +
                '<i class="fas ' + icon + '"></i>' +
            "</button>" +
            '<div class="swipe-action-col">' + label + "</div>"
        );
    }

    function buildSlide(product, pos) {
        const slide = document.createElement("div");
        slide.className = "swipe-slide";
        slide.style.top = (pos * 100) + "%";
        slide.dataset.pos = pos;

        const images = (product.images && product.images.length) ? product.images : [product.image];
        photoIndex[pos] = 0;

        const photosWrap = document.createElement("div");
        photosWrap.className = "swipe-photos";
        images.forEach(function (src) {
            const photo = document.createElement("div");
            photo.className = "swipe-photo";
            photo.style.backgroundImage =
                "url('" + src + "'), url('https://placehold.co/480x854/1a1a1a/ffffff?text=" +
                encodeURIComponent(product.name) + "')";
            photosWrap.appendChild(photo);
        });
        slide.appendChild(photosWrap);

        if (images.length > 1) {
            const dots = document.createElement("div");
            dots.className = "swipe-dots";
            images.forEach(function (_, i) {
                const dot = document.createElement("span");
                if (i === 0) dot.classList.add("active");
                dots.appendChild(dot);
            });
            slide.appendChild(dots);
        }

        const info = document.createElement("div");
        info.className = "swipe-info";
        info.innerHTML =
            (product.premium ? '<span class="swipe-premium-badge">PREMIUM</span>' : "") +
            '<div class="swipe-name">' + product.name + "</div>" +
            '<div class="swipe-price">' + formatPrice(product.price) + "</div>" +
            '<div class="swipe-meta">' +
                '<span><i class="fas fa-store"></i>' + product.seller + "</span>" +
                '<span><i class="fas fa-location-dot"></i>' + product.location + "</span>" +
            "</div>" +
            '<div class="swipe-description">' + product.description + "</div>" +
            '<div class="swipe-cta-row">' +
                '<button class="swipe-buy-btn" data-action="buy">Buy Now</button>' +
                '<button class="swipe-chat-btn" data-action="chat">Chat with Seller</button>' +
            "</div>";
        slide.appendChild(info);

        const actions = document.createElement("div");
        actions.className = "swipe-actions";
        actions.innerHTML =
            actionButton("like", "fa-heart", String(product.likes || 0), likedIds.has(product.id) ? "liked" : "") +
            actionButton("save", "fa-bookmark", "Save", savedIds.has(product.id) ? "saved" : "") +
            actionButton("share", "fa-share", "Share", "") +
            actionButton("not-interested", "fa-ban", "Not for me", "");
        slide.appendChild(actions);

        const toast = document.createElement("div");
        toast.className = "swipe-toast";
        slide.appendChild(toast);

        actions.addEventListener("click", function (e) {
            const btn = e.target.closest(".swipe-action-btn");
            if (!btn) return;
            handleAction(btn.dataset.action, product, btn, toast);
        });

        info.addEventListener("click", function (e) {
            const btn = e.target.closest("button[data-action]");
            if (!btn) return;
            handleAction(btn.dataset.action, product, btn, toast);
        });

        return slide;
    }

    function showToast(toastEl, message) {
        toastEl.textContent = message;
        toastEl.classList.add("show");
        setTimeout(function () {
            toastEl.classList.remove("show");
        }, 1400);
    }

    function handleAction(action, product, btn, toastEl) {
        if (action === "like") {
            if (likedIds.has(product.id)) {
                likedIds.delete(product.id);
                btn.classList.remove("liked");
            } else {
                likedIds.add(product.id);
                btn.classList.add("liked");
            }
        } else if (action === "save") {
            if (savedIds.has(product.id)) {
                savedIds.delete(product.id);
                btn.classList.remove("saved");
                showToast(toastEl, "Removed from saved items");
            } else {
                savedIds.add(product.id);
                btn.classList.add("saved");
                showToast(toastEl, "Saved");
            }
        } else if (action === "share") {
            const shareData = {
                title: product.name,
                text: product.name + " - " + formatPrice(product.price) + " on UniBuy",
            };
            if (navigator.share) {
                navigator.share(shareData).catch(function () {});
            } else {
                showToast(toastEl, "Share: " + shareData.text);
            }
        } else if (action === "not-interested") {
            notInterestedCategories.add(product.category);
            showToast(toastEl, "Got it — showing less like this");
            setTimeout(goToNext, 350);
        } else if (action === "buy") {
            showToast(toastEl, "Buy Now flow coming soon");
        } else if (action === "chat") {
            showToast(toastEl, "Chat with seller coming soon");
        }
    }

    function renderSlides() {
        extendFeedIfNeeded();
        track.innerHTML = "";
        track.style.transform = "translateY(0%)";

        for (let i = currentIndex - RENDER_RADIUS; i <= currentIndex + RENDER_RADIUS; i++) {
            if (i < 0) continue;
            const product = feed[i];
            if (!product) continue;
            const pos = i - currentIndex; // -1, 0, or 1
            track.appendChild(buildSlide(product, pos));
        }
    }

    function goToNext() {
        currentIndex += 1;
        extendFeedIfNeeded();
        animateTo(-1, function () {
            renderSlides();
            preloadAround(currentIndex);
        });
    }

    function goToPrevious() {
        if (currentIndex <= 0) return;
        currentIndex -= 1;
        animateTo(1, function () {
            renderSlides();
            preloadAround(currentIndex);
        });
    }

    function animateTo(direction, done) {
        // direction: -1 moves the track up (next product), 1 moves it down (previous)
        track.classList.remove("no-transition");
        track.style.transform = "translateY(" + (direction * 100) + "%)";
        setTimeout(function () {
            track.classList.add("no-transition");
            done();
            track.offsetHeight; // force reflow before re-enabling transitions
            track.classList.remove("no-transition");
        }, 400);
    }

    function shiftPhoto(slideEl, delta) {
        const pos = Number(slideEl.dataset.pos);
        const photosWrap = slideEl.querySelector(".swipe-photos");
        const total = photosWrap.children.length;
        if (total <= 1) return;

        let index = (photoIndex[pos] || 0) + delta;
        index = Math.max(0, Math.min(total - 1, index));
        photoIndex[pos] = index;

        photosWrap.style.transform = "translateX(-" + (index * 100) + "%)";

        const dots = slideEl.querySelectorAll(".swipe-dots span");
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === index);
        });
    }

    // --- Gesture handling ---

    let startX = 0, startY = 0, isDragging = false, axisLocked = null;

    function onTouchStart(e) {
        const t = e.touches ? e.touches[0] : e;
        startX = t.clientX;
        startY = t.clientY;
        isDragging = true;
        axisLocked = null;
    }

    function onTouchMove(e) {
        if (!isDragging) return;
        const t = e.touches ? e.touches[0] : e;
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (!axisLocked) {
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                axisLocked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
            }
        }
        if (axisLocked === "y" && e.cancelable) e.preventDefault();
    }

    function onTouchEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        const t = e.changedTouches ? e.changedTouches[0] : e;
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        const THRESHOLD = 50;

        if (axisLocked === "y") {
            if (dy < -THRESHOLD) {
                goToNext();
            } else if (dy > THRESHOLD) {
                goToPrevious();
            }
        } else if (axisLocked === "x") {
            const slideEl = e.target.closest ? e.target.closest(".swipe-slide") : null;
            if (slideEl) {
                if (dx < -THRESHOLD) shiftPhoto(slideEl, 1);
                else if (dx > THRESHOLD) shiftPhoto(slideEl, -1);
            }
        }
    }

    function onKeyDown(e) {
        if (viewer.classList.contains("hidden")) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowUp") goToNext();
        else if (e.key === "ArrowDown") goToPrevious();
        else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            const activeSlide = track.querySelector('.swipe-slide[data-pos="0"]');
            if (activeSlide) shiftPhoto(activeSlide, e.key === "ArrowRight" ? 1 : -1);
        }
    }

    function attachGestures() {
        track.addEventListener("touchstart", onTouchStart, { passive: true });
        track.addEventListener("touchmove", onTouchMove, { passive: false });
        track.addEventListener("touchend", onTouchEnd);
        document.addEventListener("keydown", onKeyDown);
    }

    function detachGestures() {
        track.removeEventListener("touchstart", onTouchStart);
        track.removeEventListener("touchmove", onTouchMove);
        track.removeEventListener("touchend", onTouchEnd);
        document.removeEventListener("keydown", onKeyDown);
    }

    closeBtn.addEventListener("click", close);

    return { open: open, close: close };

})();
