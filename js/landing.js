function toggleSidebar() {

    const sidebar = document.getElementById("sidebar");

    sidebar.classList.toggle("show");

}

window.toggleSidebar = toggleSidebar;

document.addEventListener("click", function(e){

    const sidebar = document.getElementById("sidebar");

    const menu = document.querySelector(".menu-btn");

    if(
        !sidebar.contains(e.target) &&
        !menu.contains(e.target)
    ){
        sidebar.classList.remove("show");
    }

});

document.addEventListener("DOMContentLoaded", function () {

    const authLink = document.getElementById("authLink");
    if (!authLink) return;

    const user = localStorage.getItem("loggedInUser");

    if (user) {
        authLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        authLink.href = "javascript:void(0)";
        authLink.onclick = function () {
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("loggedInEmail");
            alert("Logged out");
            window.location.href = "index.html";
        };
    } else {
        authLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        authLink.href = "login.html";
    }

});