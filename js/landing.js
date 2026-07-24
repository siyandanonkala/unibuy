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