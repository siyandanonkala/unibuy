
const sampleProducts = [
    {
        id: 1,
        name: "HP Laptop",
        price: 4500,
        location: "Alice Campus",
        seller: "Thabo M.",
        category: "electronics",
        description: "Lightly used HP laptop, great for assignments and browsing. Charger included.",
        image: "images/laptop.jpg",
        images: ["images/laptop.jpg", "images/laptop-2.jpg"],
        premium: true,
        likes: 24
    },
    {
        id: 2,
        name: "iPhone 12",
        price: 5900,
        location: "Fort Hare",
        seller: "Lindiwe K.",
        category: "electronics",
        description: "iPhone 12, 128GB, good battery health, minor scratch on back.",
        image: "images/phone.jpg",
        images: ["images/phone.jpg", "images/phone-2.jpg", "images/phone-3.jpg"],
        premium: false,
        likes: 41
    },
    {
        id: 3,
        name: "Study Desk",
        price: 850,
        location: "Alice Campus",
        seller: "Sipho N.",
        category: "furniture",
        description: "Compact wooden study desk, ideal for res rooms.",
        image: "images/desk.jpg",
        images: ["images/desk.jpg"],
        premium: false,
        likes: 6
    },
    {
        id: 4,
        name: "Scientific Calculator",
        price: 250,
        location: "Fort Hare",
        seller: "Aisha P.",
        category: "electronics",
        description: "Casio fx-991, barely used, perfect for engineering/stats modules.",
        image: "images/calculator.jpg",
        images: ["images/calculator.jpg"],
        premium: false,
        likes: 12
    },
    {
        id: 5,
        name: "Mountain Bike",
        price: 2200,
        location: "Alice Campus",
        seller: "Kagiso R.",
        category: "transport",
        description: "Reliable bike for getting around campus, new tyres fitted.",
        image: "images/bike.jpg",
        images: ["images/bike.jpg", "images/bike-2.jpg"],
        premium: true,
        likes: 33
    },
    {
        id: 6,
        name: "Mini Fridge",
        price: 1300,
        location: "Fort Hare",
        seller: "Naledi T.",
        category: "appliances",
        description: "Small fridge, perfect for res room, works perfectly.",
        image: "images/fridge.jpg",
        images: ["images/fridge.jpg"],
        premium: false,
        likes: 9
    },
    {
        id: 7,
        name: "Textbook Bundle",
        price: 600,
        location: "Alice Campus",
        seller: "Bongani S.",
        category: "books",
        description: "First-year commerce textbook bundle, some highlighting inside.",
        image: "images/books.jpg",
        images: ["images/books.jpg"],
        premium: false,
        likes: 4
    },
    {
        id: 8,
        name: "Bluetooth Speaker",
        price: 400,
        location: "Fort Hare",
        seller: "Zanele D.",
        category: "electronics",
        description: "Portable speaker, good bass, barely used.",
        image: "images/speaker.jpg",
        images: ["images/speaker.jpg", "images/speaker-2.jpg"],
        premium: false,
        likes: 17
    }
];

function formatPrice(amount) {
    return "R " + Number(amount).toLocaleString("en-ZA");
}

function renderProductGrid(products) {

    const grid = document.getElementById("productGrid");
    if (!grid) return;

    grid.innerHTML = "";

    products.forEach(function (product, index) {

        const card = document.createElement("div");
        card.className = "product-card";
        card.style.position = "relative";
        card.dataset.productIndex = index;

        card.innerHTML =
            (product.premium ? '<span class="badge">PREMIUM</span>' : "") +
            '<button class="favorite" aria-label="Save"><i class="fas fa-heart"></i></button>' +
            '<img src="' + product.image + '" alt="' + product.name + '" ' +
                'onerror="this.onerror=null;this.src=\'https://placehold.co/400x300/e8f0e8/006400?text=' +
                encodeURIComponent(product.name) + '\'">' +
            '<div class="card-body">' +
                '<h3 class="product-name">' + product.name + '</h3>' +
                '<p class="product-price">' + formatPrice(product.price) + '</p>' +
                '<p class="product-location"><i class="fas fa-location-dot"></i>' + product.location + '</p>' +
            '</div>';

        card.addEventListener("click", function (e) {
            
            if (e.target.closest(".favorite")) {
                e.target.closest(".favorite").classList.toggle("active");
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

document.addEventListener("DOMContentLoaded", function () {
    renderProductGrid(sampleProducts);

    const searchInput = document.querySelector(".search-box input");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const term = searchInput.value.trim().toLowerCase();
            const filtered = sampleProducts.filter(function (p) {
                return p.name.toLowerCase().includes(term) ||
                       p.location.toLowerCase().includes(term);
            });
            renderProductGrid(filtered);
        });
    }
});
