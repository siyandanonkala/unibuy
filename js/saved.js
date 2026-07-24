/* Saved Items — persisted to localStorage, no login required.
   Not a module; loads as a plain script so every page (index.html,
   saved.html) can reach it via window.UniBuySaved. */
window.UniBuySaved = (function () {

    const KEY = "unibuySavedProductIds";

    function getSavedIds() {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function isSaved(id) {
        return getSavedIds().indexOf(id) !== -1;
    }

    function setSaved(id, saved) {
        const ids = getSavedIds();
        const idx = ids.indexOf(id);

        if (saved && idx === -1) {
            ids.push(id);
        } else if (!saved && idx !== -1) {
            ids.splice(idx, 1);
        }

        localStorage.setItem(KEY, JSON.stringify(ids));
    }

    // Flips the saved state for a product id, persists it, tells
    // anyone listening (e.g. saved.html) that the list changed, and
    // returns the new state so callers can update their own icon.
    function toggleSaved(id) {
        const nowSaved = !isSaved(id);
        setSaved(id, nowSaved);

        window.dispatchEvent(new CustomEvent("unibuy:saved-changed", {
            detail: { id: id, saved: nowSaved }
        }));

        return nowSaved;
    }

    return {
        getSavedIds: getSavedIds,
        isSaved: isSaved,
        toggleSaved: toggleSaved
    };

})();
