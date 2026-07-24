
import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const productForm = document.getElementById("productForm");
const productsContainer = document.querySelector(".products-container");

if (productForm) {
    productForm.addEventListener("submit", function (e) {
        e.preventDefault();
        postProduct();
    });
}

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        sendContactMessage();
    });
}

async function sendContactMessage() {

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    if (name === "" || email === "" || message === "") {
        alert("Please fill in all fields");
        return;
    }

    const submitBtn = document.getElementById("contactSubmit");
    if (submitBtn) submitBtn.disabled = true;

    try {

        await addDoc(collection(db, "contactMessages"), {
            name: name,
            email: email,
            message: message,
            createdAt: new Date()
        });

        alert("Message sent! We'll get back to you soon.");
        contactForm.reset();

    } catch (error) {
        alert(error.message);
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }

}

function register() {

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (fullname === "" || email === "" || password === "") {
        alert("Please fill in all fields");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {

            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                fullname: fullname,
                email: email
            });

            alert("Account created successfully!");

            window.location.href = "login.html";
        })
        .catch((error) => {
            alert(error.message);
        });
}

async function login() {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (email === "" || password === "") {
        alert("Please fill in all fields.");
        return;
    }

    try {

        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {

            localStorage.setItem(
                "loggedInUser",
                userDoc.data().fullname
            );

        }

        alert("Login successful!");

        window.location.href = "index.html";

    } catch (error) {

        alert(error.message);

    }

}

window.onload = function () {

    const user =
        localStorage.getItem("loggedInUser");
        const sidebarUser = document.getElementById("sidebarUser");

if (sidebarUser) {

    if (user) {

        sidebarUser.innerHTML = `
            <h3>👋 ${user}</h3>
            <p>Welcome back!</p>
        `;

    } else {

        sidebarUser.innerHTML = `
            <h3>👤 Guest</h3>
            <p>Please login</p>
        `;

    }

}

    if (user) {

        const welcome =
            document.getElementById("welcomeUser");
            
const profileLink =
    document.getElementById("profileLink");

        if (welcome) {
            welcome.innerHTML = "👋 " + user;
        }

        const loginLink =
            document.getElementById("loginLink");

        if (loginLink) {

            loginLink.innerHTML = "🚪 Logout";
loginLink.style.color = "#d32f2f";
loginLink.style.fontWeight = "bold";

loginLink.onclick = function () {

    localStorage.removeItem("loggedInUser");

    alert("Logged out");

    location.reload();

};
        }
    }

const profileLink = document.getElementById("profileLink");

if (profileLink) {
    profileLink.style.display = "block";
}
    if (document.getElementById("customerProducts")) {
    loadProducts();
}
};

async function postProduct() {

    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        alert("Please login first");
        return;
    }

    const name = document.getElementById("productName").value;
    const price = document.getElementById("productPrice").value;
    const description = document.getElementById("productDescription").value;
    const imageFile = document.getElementById("productImage").files[0];

    const categoryField = document.getElementById("productCategory");
    const locationField = document.getElementById("productLocation");
    const category = categoryField ? categoryField.value : "";
    const location = locationField ? locationField.value : "";

    if (name === "" || price === "") {
        alert("Please fill all required fields");
        return;
    }


    const saveProduct = async (imageData) => {

        await addDoc(collection(db, "products"), {

            name: name,
            price: Number(price),
            description: description,
            category: category,
            location: location,
            image: imageData,
            seller: loggedInUser,
            likes: 0,
            createdAt: new Date()

        });

        alert("Product posted successfully!");

        location.reload();
    };


    if (imageFile) {

        const reader = new FileReader();

        reader.onload = function(e) {
            saveProduct(e.target.result);
        };

        reader.readAsDataURL(imageFile);

    } else {

        saveProduct("");

    }

}

async function loadProducts() {

   const productList = document.getElementById("customerProducts");

    if (!productList) return;

    productList.innerHTML = ""; 

    try {

        const querySnapshot = await getDocs(collection(db, "products"));

        querySnapshot.forEach((docSnap) => {

            const product = docSnap.data();

            productList.innerHTML += `

            <div class="product-card">

                <h3>${product.name}</h3>

                <p>
                    <strong>R${product.price}</strong>
                </p>

                <p>${product.description}</p>

                <small>
                    Seller: ${product.seller}
                </small>

                <button onclick="addToCart('${docSnap.id}')">
                    Add to Cart
                </button>

            </div>

            `;

        });


    } catch(error) {

        console.log(error.message);

    }

}

function openProduct(index) {

    const products =
        JSON.parse(localStorage.getItem("products")) || [];

    localStorage.setItem(
        "selectedProduct",
        JSON.stringify(products[index])
    );

    window.location.href = "product.html";
}

/* My Listings (mylistings.html) — reads directly from Firestore,
   filtered to the logged-in user's own products. Kept separate
   from loadMyListings()/loadCustomerProducts() above, which read
   from a localStorage "products" array tied to the store flow —
   nothing currently populates that array, so this page uses the
   same Firestore source postProduct() actually writes to. */
async function loadMyFirestoreListings() {

    const container = document.getElementById("myListingsGrid");
    if (!container) return;

    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        window.location.href = "login.html";
        return;
    }

    container.innerHTML = "<p>Loading your listings...</p>";

    try {

        const querySnapshot = await getDocs(collection(db, "products"));
        container.innerHTML = "";
        let count = 0;

        querySnapshot.forEach((docSnap) => {

            const product = docSnap.data();
            if (product.seller !== loggedInUser) return;

            count++;

            const placeholder =
                "https://placehold.co/400x300/e8f0e8/006400?text=" +
                encodeURIComponent(product.name || "Item");

            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML =
                '<img src="' + (product.image || placeholder) + '" ' +
                    'onerror="this.onerror=null;this.src=\'' + placeholder + '\'" ' +
                    'alt="' + product.name + '">' +
                '<div class="product-info">' +
                    '<h3>' + product.name + '</h3>' +
                    '<p class="product-price">R' + product.price + '</p>' +
                    '<p>' + (product.description || "") + '</p>' +
                    '<button onclick="deleteMyListing(\'' + docSnap.id + '\')">Delete</button>' +
                '</div>';

            container.appendChild(card);
        });

        if (count === 0) {
            container.innerHTML =
                '<p>You haven\'t listed anything yet. ' +
                '<a href="sell.html">Sell your first item</a></p>';
        }

    } catch (error) {
        container.innerHTML = "<p>Couldn't load your listings right now.</p>";
        console.log(error.message);
    }
}

async function deleteMyListing(id) {

    if (!confirm("Delete this listing?")) return;

    try {
        await deleteDoc(doc(db, "products", id));
        loadMyFirestoreListings();
    } catch (error) {
        alert(error.message);
    }
}

if (document.getElementById("myListingsGrid")) {
    window.addEventListener("load", loadMyFirestoreListings);
}

window.deleteMyListing = deleteMyListing;

function searchProducts() {

    const searchText =
        document.getElementById("searchInput")
        .value
        .toLowerCase();

    const cards =
        document.querySelectorAll(".product-card");

    cards.forEach(card => {

        const text =
            card.innerText.toLowerCase();

        if (text.includes(searchText)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

/* Sidebar */

function toggleSidebar() {

    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.toggle("show");
    }

}

window.toggleSidebar = toggleSidebar;

function loadMyListings() {

    const container =
        document.getElementById("myListings");

    if (!container) return;

    const loggedInUser =
        localStorage.getItem("loggedInUser");

    const products =
        JSON.parse(localStorage.getItem("products")) || [];

    container.innerHTML = "";

    products.forEach(product => {

        if(product.seller === loggedInUser){

            container.innerHTML += `

<div class="product-card">

    <img src="${product.image}">

    <h3>${product.name}</h3>

    <p>
        <strong>R${product.price}</strong>
    </p>

    <p>
        ${product.description}
    </p>

    <button>
        Edit
    </button>

    <button>
            Delete
        </button>

    </div>

    `;

        }

    });

}
    
function createStore(event){

    event.preventDefault();

    const storeName =
        document.getElementById("storeNameInput").value;

    const storeDescription =
        document.getElementById("storeDescriptionInput").value;

    const storeCategory =
        document.getElementById("storeCategoryInput").value;

    const storeLocation =
        document.getElementById("storeLocationInput").value;

    const storeContact =
        document.getElementById("storeContactInput").value;


    if(
        storeName === "" ||
        storeLocation === "" ||
        storeContact === ""
    ){
        alert("Please fill in all required fields.");
        return;
    }


    const store = {

        name: storeName,

        description: storeDescription,

        category: storeCategory,

        location: storeLocation,

        contact: storeContact

    };


    localStorage.setItem(
        "store",
        JSON.stringify(store)
    );


    alert("Store created successfully!");

    window.location.href = "my-store.html";

}



function loadStore(){

    const store =
    JSON.parse(localStorage.getItem("store"));


    if(!store) return;


    const name =
    document.getElementById("storeName");


    if(name){

        name.textContent = store.name;

    }


    const location =
    document.getElementById("storeLocation");


    if(location){

        location.textContent = store.location;

    }


    const category =
    document.getElementById("storeCategory");


    if(category){

        category.textContent = store.category;

    }


    const contact =
    document.getElementById("storeContact");


    if(contact){

        contact.textContent = store.contact;

    }


    const description =
    document.getElementById("storeDescription");


    if(description){

        description.textContent = store.description;

    }


    loadMyListings();

}



function loadCustomerStore(){

    const store =
    JSON.parse(localStorage.getItem("store"));


    if(!store) return;


    const name =
    document.getElementById("customerStoreName");


    const location =
    document.getElementById("customerLocation");


    const category =
    document.getElementById("customerCategory");


    const description =
    document.getElementById("customerDescription");


    if(name){

        name.textContent = store.name;

    }


    if(location){

        location.textContent = store.location;

    }


    if(category){

        category.textContent = store.category;

    }


    if(description){

        description.textContent = store.description;

    }


    loadCustomerProducts();

}



function loadCustomerProducts(){

    const container =
    document.getElementById("customerProducts");


    if(!container) return;


    const store =
    JSON.parse(localStorage.getItem("store"));


    if(!store) return;


    const products =
    JSON.parse(localStorage.getItem("products")) || [];


    container.innerHTML = "";


    products.forEach((product,index)=>{


        if(product.storeName === store.name){


            container.innerHTML += `

            <div class="product-card"
            onclick="openProduct(${index})">


                <img src="${product.image}">


                <h3>${product.name}</h3>


                <p>
                <strong>R${product.price}</strong>
                </p>


                <p>${product.description}</p>


            </div>

            `;

        }


    });


}



window.addEventListener("load", loadStore);

window.addEventListener("load", loadCustomerStore);

function loadProfile() {

    const userName = localStorage.getItem("loggedInUser");

    if (!userName) {
        window.location.href = "login.html";
        return;
    }

    // Find user data
    let email = "";
    let user = null;

    for (let i = 0; i < localStorage.length; i++) {

        const key = localStorage.key(i);

        try {

            const data = JSON.parse(localStorage.getItem(key));

            if (data && data.fullname === userName) {
                user = data;
                email = data.email;
                break;
            }

        } catch (e) {}

    }

    // Display profile
    document.getElementById("profileName").textContent = userName;

    document.getElementById("profileInitial").textContent =
        userName.charAt(0).toUpperCase();

    if (user) {
        document.getElementById("profileEmail").textContent = email;
    }

    // Count products
    const products =
        JSON.parse(localStorage.getItem("products")) || [];

    const total =
    products.filter(product => product.seller === userName).length;

document.getElementById("listedProducts").textContent = total;

const savedImage = localStorage.getItem("profileImage");

if (savedImage) {
    document.getElementById("profileImage").src = savedImage;
}

const savedCover = localStorage.getItem("coverImage");

if (savedCover) {
    document.getElementById("coverImage").src = savedCover;
}

}

function logout() {

    localStorage.removeItem("loggedInUser");

    alert("Logged out successfully.");

    window.location.href = "index.html";

}

if (document.getElementById("profileName")) {
    window.addEventListener("load", loadProfile);
}

function uploadProfileImage(){

    const file =
        document.getElementById("profileImageInput").files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        localStorage.setItem(
            "profileImage",
            e.target.result
        );

        document.getElementById("profileImage").src =
            e.target.result;

    };

    reader.readAsDataURL(file);

}

function uploadCoverImage(){

    const file =
        document.getElementById("coverInput").files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        localStorage.setItem(
            "coverImage",
            e.target.result
        );

        document.getElementById("coverImage").src =
            e.target.result;

    };

    reader.readAsDataURL(file);

}

// Make functions available to HTML
window.toggleSidebar = toggleSidebar;
window.openProduct = openProduct;
window.searchProducts = searchProducts;
window.register = register;
window.login = login;
window.postProduct = postProduct;
window.createStore = createStore;
window.logout = logout;
window.uploadProfileImage = uploadProfileImage;
window.uploadCoverImage = uploadCoverImage;


function addToCart(index) {

    const products = JSON.parse(localStorage.getItem("products")) || [];
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push(products[index]);

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    alert("Product added to cart!");
}

function loadCart() {

    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartItems) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
        cartTotal.textContent = "Total: R0";
        return;
    }

    let total = 0;

    cart.forEach((product, index) => {

        total += Number(product.price);

        cartItems.innerHTML += `
            <div class="cart-card">

                <img src="${product.image}" alt="${product.name}">

                <div class="cart-info">
                    <h3>${product.name}</h3>

                    <p><strong>R${product.price}</strong></p>

                    <button class="remove-btn" onclick="removeFromCart(${index})">
                        Remove
                    </button>
                </div>

            </div>
        `;
    });

    cartTotal.textContent = "Total: R" + total;
}

function removeFromCart(index){

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.splice(index,1);

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();

    updateCartCount();

}

loadCart();
function updateCartCount() {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const cartCount = document.getElementById("cartCount");

    if(cartCount){
        cartCount.textContent = cart.length;
    }

}

updateCartCount();


const checkoutBtn = document.getElementById("checkoutBtn");

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {

        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        window.location.href = "checkout.html";
    });
}

window.register = register;