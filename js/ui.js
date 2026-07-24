/* Sidebar toggle — deliberately NOT a module and has NO imports.
   This must keep working even if js/app.js fails to load (e.g. a
   missing/misconfigured js/firebase.js breaks that module's import
   and stops all of its code from running). Include this before the
   app.js module script on every page that has a #sidebar. */

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.classList.toggle("show");
    }
}

window.toggleSidebar = toggleSidebar;

document.addEventListener("click", function (e) {
    const sidebar = document.getElementById("sidebar");
    const menu = document.querySelector(".menu-btn");

    if (!sidebar || !sidebar.classList.contains("show")) return;
    if (menu && menu.contains(e.target)) return;
    if (sidebar.contains(e.target)) return;

    sidebar.classList.remove("show");
});
