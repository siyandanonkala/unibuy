import { db } from "./firebase.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function formatPrice(amount) {
    return "R " + Number(amount).toLocaleString("en-ZA");
}

/* Pulls everything posted via sell.html out of Firestore — real
   photo, real price, real seller. No demo/sample data here. */
async function fetchFirestoreProducts() {
    try {
        const snapshot = await getDocs(collection(db, "products"));

        return snapshot.docs.map(function (docSnap) {
            const p = docSnap.data();
            const placeholder =
                "https://placehold.co/400x300/e8f0e8/006400?text=" +
                encodeURIComponent(p.name || "Item");

            return {
                id: docSnap.id,
                name: p.name || "Untitled item",
                price: p.price || 0,
                location: p.location || "Campus",
                seller: p.seller || "Student",
                category: p.category || "other",
                description: p.description || "",
                image: p.image || placeholder,
                images: p.image ? [p.image] : [placeholder],
                premium: false,
                likes: p.likes || 0
            };
        });

    } catch (error) {
        console.log(error.message);
        return [];
    }
}

// Cached so search/filtering after the first load doesn't need to
// re-hit Firestore every keystroke.
let allProducts = [];
let loaded = false;

async function getAllProducts() {
    if (loaded) return allProducts;

    allProducts = await fetchFirestoreProducts();
    loaded = true;
    return allProducts;
}

function renderProductGrid(products, gridId) {

    const grid = document.getElementById(gridId || "productGrid");
    if (!grid) return;

    grid.innerHTML = "";

    if (products.length === 0) {
        grid.innerHTML =
            '<p class="empty-state">No listings yet. ' +
            '<a href="sell.html">Be the first to sell something</a>.</p>';
        return;
    }

    products.forEach(function (product, index) {

        const saved = window.UniBuySaved && window.UniBuySaved.isSaved(product.id);

        const card = document.createElement("div");
        card.className = "product-card";
        card.style.position = "relative";
        card.dataset.productIndex = index;

        card.innerHTML =
            (product.premium ? '<span class="badge">PREMIUM</span>' : "") +
            '<button class="favorite' + (saved ? " active" : "") + '" aria-label="Save"><i class="fas fa-heart"></i></button>' +
            '<img src="' + product.image + '" alt="' + product.name + '" ' +
                'onerror="this.onerror=null;this.src=\'https://placehold.co/400x300/e8f0e8/006400?text=' +
                encodeURIComponent(product.name) + '\'">' +
            '<div class="card-body">' +
                '<h3 class="product-name">' + product.name + '</h3>' +
                '<p class="product-price">' + formatPrice(product.price) + '</p>' +
                '<p class="product-location"><i class="fas fa-location-dot"></i>' + product.location + '</p>' +
            '</div>';

        card.addEventListener("click", function (e) {
            // Ignore taps on the favorite heart so they don't open the product
            const favBtn = e.target.closest(".favorite");
            if (favBtn) {
                if (window.UniBuySaved) {
                    const nowSaved = window.UniBuySaved.toggleSaved(product.id);
                    favBtn.classList.toggle("active", nowSaved);
                } else {
                    favBtn.classList.toggle("active");
                }
                return;
            }
            openProduct(index, products);
        });

        grid.appendChild(card);
    });
}

function openProduct(index, products) {
    if (window.UniBuySwipe) {
        window.UniBuySwipe.open(index, products);
    }
}

// Exposed so saved.html (a plain script) can reuse the same data
// and rendering without needing its own Firestore import.
window.UniBuyProducts = {
    getAll: getAllProducts,
    renderGrid: renderProductGrid
};

document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const campus = params.get("campus");
    const searchInput = document.querySelector(".search-box input");

    const grid = document.getElementById("productGrid");
    if (grid) grid.innerHTML = "<p class=\"empty-state\">Loading listings...</p>";

    const products = await getAllProducts();

    let initialProducts = products;

    if (campus) {
        initialProducts = products.filter(function (p) {
            return p.location.toLowerCase().includes(campus.toLowerCase());
        });
        if (searchInput) searchInput.value = campus;
    }

    if (grid) renderProductGrid(initialProducts);

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const term = searchInput.value.trim().toLowerCase();
            const filtered = allProducts.filter(function (p) {
                return p.name.toLowerCase().includes(term) ||
                       p.location.toLowerCase().includes(term);
            });
            renderProductGrid(filtered);
        });
    }
});
