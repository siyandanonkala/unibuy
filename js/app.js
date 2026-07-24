
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
    deleteDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ---------- Contact form (contact.html) ---------- */

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

/* ---------- Auth: register / login / logout ---------- */

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

            localStorage.setItem("loggedInUser", userDoc.data().fullname);
            localStorage.setItem("loggedInEmail", userDoc.data().email || email);

        } else {

            // Fallback: no Firestore profile doc, but auth succeeded.
            localStorage.setItem("loggedInUser", email);
            localStorage.setItem("loggedInEmail", email);

        }

        alert("Login successful!");

        window.location.href = "index.html";

    } catch (error) {

        alert(error.message);

    }

}

function logout() {

    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInEmail");

    alert("Logged out successfully.");

    window.location.href = "index.html";

}

/* ---------- Sidebar greeting + logout link (every app page) ---------- */

window.addEventListener("load", function () {

    const user = localStorage.getItem("loggedInUser");
    const sidebarUser = document.getElementById("sidebarUser");

    if (sidebarUser) {
        sidebarUser.innerHTML = user
            ? `<h3>👋 ${user}</h3><p>Welcome back!</p>`
            : `<h3>👤 Guest</h3><p>Please login</p>`;
    }

    const loginLink = document.getElementById("loginLink");

    if (loginLink) {

        if (user) {

            loginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            loginLink.style.color = "#d32f2f";
            loginLink.style.fontWeight = "bold";
            loginLink.href = "javascript:void(0)";

            loginLink.onclick = function () {
                localStorage.removeItem("loggedInUser");
                localStorage.removeItem("loggedInEmail");
                alert("Logged out");
                window.location.href = "index.html";
            };

        } else {

            loginLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            loginLink.href = "login.html";
            loginLink.onclick = null;

        }
    }

});

/* ---------- Sell Item (sell.html) ---------- */

const productForm = document.getElementById("productForm");

if (productForm) {
    productForm.addEventListener("submit", function (e) {
        e.preventDefault();
        postProduct();
    });
}

async function postProduct() {

    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    const name = document.getElementById("productName").value.trim();
    const price = document.getElementById("productPrice").value;
    const description = document.getElementById("productDescription").value.trim();
    const imageFile = document.getElementById("productImage").files[0];

    const categoryField = document.getElementById("productCategory");
    const locationField = document.getElementById("productLocation");
    const category = categoryField ? categoryField.value : "";
    const location = locationField ? locationField.value.trim() : "";

    if (name === "" || price === "") {
        alert("Please fill all required fields");
        return;
    }

    const saveProduct = async (imageData) => {

        try {
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
            window.location.href = "mylistings.html";

        } catch (error) {
            alert(error.message);
        }
    };

    if (imageFile) {

        const reader = new FileReader();

        reader.onload = function (e) {
            saveProduct(e.target.result);
        };

        reader.readAsDataURL(imageFile);

    } else {

        saveProduct("");

    }

}

/* ---------- My Listings (mylistings.html) — reads from Firestore,
   filtered to the logged-in user's own products. ---------- */

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

        const q = query(collection(db, "products"), where("seller", "==", loggedInUser));
        const querySnapshot = await getDocs(q);
        container.innerHTML = "";
        let count = 0;

        querySnapshot.forEach((docSnap) => {

            const product = docSnap.data();
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

/* ---------- Settings / Profile (settings.html) ---------- */

async function loadProfile() {

    const userName = localStorage.getItem("loggedInUser");

    if (!userName) {
        window.location.href = "login.html";
        return;
    }

    const email = localStorage.getItem("loggedInEmail") || "";

    document.getElementById("profileName").textContent = userName;
    document.getElementById("profileInitial").textContent = userName.charAt(0).toUpperCase();

    if (email) {
        document.getElementById("profileEmail").textContent = email;
    }

    // Count this user's real listings from Firestore.
    try {
        const q = query(collection(db, "products"), where("seller", "==", userName));
        const querySnapshot = await getDocs(q);
        document.getElementById("listedProducts").textContent = querySnapshot.size;
    } catch (error) {
        document.getElementById("listedProducts").textContent = "0";
        console.log(error.message);
    }

    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
        document.getElementById("profileImage").src = savedImage;
    }

    const savedCover = localStorage.getItem("coverImage");
    if (savedCover) {
        document.getElementById("coverImage").src = savedCover;
    }

}

if (document.getElementById("profileName")) {
    window.addEventListener("load", loadProfile);
}

function uploadProfileImage() {

    const file = document.getElementById("profileImageInput").files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        localStorage.setItem("profileImage", e.target.result);
        document.getElementById("profileImage").src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function uploadCoverImage() {

    const file = document.getElementById("coverInput").files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        localStorage.setItem("coverImage", e.target.result);
        document.getElementById("coverImage").src = e.target.result;
    };

    reader.readAsDataURL(file);
}

/* ---------- Make functions available to inline onclick="" handlers ---------- */

window.register = register;
window.login = login;
window.logout = logout;
window.postProduct = postProduct;
window.deleteMyListing = deleteMyListing;
window.uploadProfileImage = uploadProfileImage;
window.uploadCoverImage = uploadCoverImage;
