import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


function formatPrice(amount) {
    return "R " + Number(amount).toLocaleString("en-ZA");
}


/* ---------- Get products from Firestore ---------- */

async function fetchFirestoreProducts() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "products")
            );

        return snapshot.docs.map(function (docSnap) {

            const p = docSnap.data();

            const placeholder =
                "https://placehold.co/400x300/e8f0e8/006400?text=" +
                encodeURIComponent(
                    p.name || "Item"
                );

            return {

                id: docSnap.id,

                name:
                    p.name ||
                    "Untitled item",

                price:
                    p.price || 0,

                location:
                    p.location ||
                    "Campus",

                seller:
                    p.seller ||
                    "Student",

                /*
                 * New listings contain these.
                 * Older listings may not.
                 */
                sellerUid:
                    p.sellerUid ||
                    "",

                sellerEmail:
                    p.sellerEmail ||
                    "",

                category:
                    p.category ||
                    "other",

                description:
                    p.description ||
                    "",

                image:
                    p.image ||
                    placeholder,

                images:
                    p.image
                        ? [p.image]
                        : [placeholder],

                premium: false,

                likes:
                    p.likes || 0
            };

        });

    } catch (error) {

        console.error(
            "Could not load products:",
            error
        );

        return [];
    }
}


/* ---------- Product cache ---------- */

let allProducts = [];
let loaded = false;


async function getAllProducts() {

    if (loaded) {
        return allProducts;
    }

    allProducts =
        await fetchFirestoreProducts();

    loaded = true;

    return allProducts;
}


/* ---------- Render product cards ---------- */

function renderProductGrid(
    products,
    gridId
) {

    const grid =
        document.getElementById(
            gridId || "productGrid"
        );

    if (!grid) return;

    grid.innerHTML = "";

    if (!products.length) {

        grid.innerHTML =
            '<p class="empty-state">' +
                "No listings yet. " +
                '<a href="sell.html">' +
                    "Be the first to sell something" +
                "</a>." +
            "</p>";

        return;
    }


    products.forEach(function (
        product,
        index
    ) {

        const saved =
            window.UniBuySaved &&
            window.UniBuySaved.isSaved(
                product.id
            );


        const card =
            document.createElement("div");

        card.className =
            "product-card";

        card.style.position =
            "relative";

        card.dataset.productIndex =
            index;


        card.innerHTML =

            (
                product.premium
                    ? '<span class="badge">PREMIUM</span>'
                    : ""
            ) +

            '<button class="favorite' +
            (saved ? " active" : "") +
            '" aria-label="Save">' +

                '<i class="fas fa-heart"></i>' +

            "</button>" +

            '<img src="' +
                product.image +
                '" alt="' +
                product.name +
                '" ' +

                'onerror="this.onerror=null;this.src=\'' +
                "https://placehold.co/400x300/e8f0e8/006400?text=" +
                encodeURIComponent(product.name) +
                '\'">' +

            '<div class="card-body">' +

                '<h3 class="product-name">' +
                    product.name +
                "</h3>" +

                '<p class="product-price">' +
                    formatPrice(product.price) +
                "</p>" +

                '<p class="product-location">' +
                    '<i class="fas fa-location-dot"></i>' +
                    product.location +
                "</p>" +

            "</div>";


        card.addEventListener(
            "click",
            function (e) {

                const favBtn =
                    e.target.closest(
                        ".favorite"
                    );

                if (favBtn) {

                    if (window.UniBuySaved) {

                        const nowSaved =
                            window.UniBuySaved.toggleSaved(
                                product.id
                            );

                        favBtn.classList.toggle(
                            "active",
                            nowSaved
                        );

                    } else {

                        favBtn.classList.toggle(
                            "active"
                        );
                    }

                    return;
                }


                openProduct(
                    index,
                    products
                );
            }
        );


        grid.appendChild(card);

    });
}


/* ---------- Open swipe product viewer ---------- */

function openProduct(
    index,
    products
) {

    if (
        window.UniBuySwipe &&
        typeof window.UniBuySwipe.open ===
            "function"
    ) {

        window.UniBuySwipe.open(
            index,
            products
        );

    } else {

        console.error(
            "UniBuySwipe is not available."
        );
    }
}


/* ---------- Public API ---------- */

window.UniBuyProducts = {

    getAll:
        getAllProducts,

    renderGrid:
        renderProductGrid
};


/* ---------- Page initialization ---------- */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const campus =
            params.get("campus");

        const searchInput =
            document.querySelector(
                ".search-box input"
            );

        const grid =
            document.getElementById(
                "productGrid"
            );


        if (grid) {

            grid.innerHTML =
                '<p class="empty-state">' +
                    "Loading listings..." +
                "</p>";
        }


        const products =
            await getAllProducts();


        let initialProducts =
            products;


        if (campus) {

            initialProducts =
                products.filter(
                    function (p) {

                        return p.location
                            .toLowerCase()
                            .includes(
                                campus.toLowerCase()
                            );
                    }
                );


            if (searchInput) {
                searchInput.value =
                    campus;
            }
        }


        if (grid) {

            renderProductGrid(
                initialProducts
            );
        }


        const sharedProductId =
            params.get("product");

        if (sharedProductId) {

            const sharedIndex =
                products.findIndex(
                    function (p) {

                        return p.id ===
                            sharedProductId;
                    }
                );

            if (sharedIndex !== -1) {

                openProduct(
                    sharedIndex,
                    products
                );
            }
        }


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                function () {

                    const term =
                        searchInput.value
                            .trim()
                            .toLowerCase();


                    const filtered =
                        allProducts.filter(
                            function (p) {

                                return (
                                    p.name
                                        .toLowerCase()
                                        .includes(term)
                                    ||

                                    p.location
                                        .toLowerCase()
                                        .includes(term)
                                );
                            }
                        );


                    renderProductGrid(
                        filtered
                    );
                }
            );
        }

    }
);