import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
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


/* =========================================================
   AUTH STATE
   ========================================================= */

onAuthStateChanged(auth, (user) => {

    /* Protect sell page */

    if (
        window.location.pathname.endsWith("sell.html") &&
        !user
    ) {

        alert(
            "Please log in or register before posting an item."
        );

        window.location.href =
            "login.html";

        return;
    }


    /* Protect settings page */

    if (
        window.location.pathname.endsWith("settings.html") &&
        !user
    ) {

        window.location.href =
            "login.html";

        return;
    }

});


/* =========================================================
   CONTACT FORM
   ========================================================= */

const contactForm =
    document.getElementById("contactForm");


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();

            sendContactMessage();

        }
    );

}


async function sendContactMessage() {

    const name =
        document.getElementById(
            "contactName"
        ).value.trim();


    const email =
        document.getElementById(
            "contactEmail"
        ).value.trim();


    const message =
        document.getElementById(
            "contactMessage"
        ).value.trim();


    if (
        name === "" ||
        email === "" ||
        message === ""
    ) {

        alert(
            "Please fill in all fields"
        );

        return;
    }


    const submitBtn =
        document.getElementById(
            "contactSubmit"
        );


    if (submitBtn) {

        submitBtn.disabled =
            true;

    }


    try {

        await addDoc(
            collection(
                db,
                "contactMessages"
            ),
            {
                name: name,
                email: email,
                message: message,
                createdAt: new Date()
            }
        );


        alert(
            "Message sent! We'll get back to you soon."
        );


        contactForm.reset();


    } catch (error) {

        console.error(error);

        alert(
            error.message
        );


    } finally {

        if (submitBtn) {

            submitBtn.disabled =
                false;

        }

    }

}


/* =========================================================
   AUTH: REGISTER
   ========================================================= */

async function register() {

    const fullname =
        document.getElementById(
            "fullname"
        ).value.trim();


    const email =
        document.getElementById(
            "email"
        ).value.trim();


    const phoneInput =
        document.getElementById(
            "phone"
        );


    const phone =
        phoneInput
            ? phoneInput.value.trim()
            : "";


    const password =
        document.getElementById(
            "password"
        ).value;


    /* ---------- Validation ---------- */

    if (
        fullname === "" ||
        email === "" ||
        phone === "" ||
        password === ""
    ) {

        alert(
            "Please fill in all fields"
        );

        return;
    }


    /* ---------- Basic phone validation ---------- */

    const phoneDigits =
        phone.replace(
            /\D/g,
            ""
        );


    if (phoneDigits.length < 10) {

        alert(
            "Please enter a valid phone / WhatsApp number."
        );

        return;
    }


    try {

        /* ---------- Create Firebase account ---------- */

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        /* ---------- Save profile ---------- */

        await setDoc(
            doc(
                db,
                "users",
                user.uid
            ),
            {

                fullname:
                    fullname,

                email:
                    email,

                phone:
                    phone,

                bio:
                    ""

            }
        );


        alert(
            "Account created successfully!"
        );


        /*
           Firebase automatically signs the user in
           after registration.
        */

        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        alert(
            error.message
        );

    }

}


/* =========================================================
   AUTH: LOGIN
   ========================================================= */

async function login() {

    const emailInput =
        document.getElementById(
            "loginEmail"
        );


    const passwordInput =
        document.getElementById(
            "loginPassword"
        );


    if (
        !emailInput ||
        !passwordInput
    ) {

        console.error(
            "Login inputs not found."
        );

        return;
    }


    const email =
        emailInput.value.trim();


    const password =
        passwordInput.value;


    if (
        email === "" ||
        password === ""
    ) {

        alert(
            "Please fill in all fields."
        );

        return;
    }


    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        const userDoc =
            await getDoc(
                doc(
                    db,
                    "users",
                    user.uid
                )
            );


        if (userDoc.exists()) {

            const userData =
                userDoc.data();


            localStorage.setItem(
                "loggedInUser",
                userData.fullname ||
                email
            );


            localStorage.setItem(
                "loggedInEmail",
                userData.email ||
                email
            );

        } else {

            localStorage.setItem(
                "loggedInUser",
                email
            );


            localStorage.setItem(
                "loggedInEmail",
                email
            );

        }


        alert(
            "Login successful!"
        );


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        alert(
            error.message
        );

    }

}


/* =========================================================
   LOGIN BUTTON
   ========================================================= */

const loginButton =
    document.getElementById(
        "loginButton"
    );


if (loginButton) {

    loginButton.addEventListener(
        "click",
        login
    );

}


/* =========================================================
   GLOBAL AUTH FUNCTIONS
   ========================================================= */

window.login =
    login;

window.register =
    register;


/* =========================================================
   AUTH: LOGOUT
   ========================================================= */

function logout() {

    localStorage.removeItem(
        "loggedInUser"
    );


    localStorage.removeItem(
        "loggedInEmail"
    );


    alert(
        "Logged out successfully."
    );


    window.location.href =
        "index.html";

}


window.logout =
    logout;


/* =========================================================
   SIDEBAR USER
   ========================================================= */

window.addEventListener(
    "load",
    function () {

        const user =
            localStorage.getItem(
                "loggedInUser"
            );


        const sidebarUser =
            document.getElementById(
                "sidebarUser"
            );


        if (sidebarUser) {

            sidebarUser.innerHTML =
                user
                    ? `<h3>👋 ${user}</h3><p>Welcome back!</p>`
                    : `<h3>👤 Guest</h3><p>Please login</p>`;

        }


        const loginLink =
            document.getElementById(
                "loginLink"
            );


        if (loginLink) {

            if (user) {

                loginLink.innerHTML =
                    '<i class="fas fa-sign-out-alt"></i> Logout';


                loginLink.style.color =
                    "#d32f2f";


                loginLink.style.fontWeight =
                    "bold";


                loginLink.href =
                    "javascript:void(0)";


                loginLink.onclick =
                    function () {

                        localStorage.removeItem(
                            "loggedInUser"
                        );


                        localStorage.removeItem(
                            "loggedInEmail"
                        );


                        alert(
                            "Logged out"
                        );


                        window.location.href =
                            "index.html";

                    };

            } else {

                loginLink.innerHTML =
                    '<i class="fas fa-sign-in-alt"></i> Login';


                loginLink.href =
                    "login.html";


                loginLink.onclick =
                    null;

            }

        }

    }
);


/* =========================================================
   SELL ITEM
   ========================================================= */

const productForm =
    document.getElementById(
        "productForm"
    );


if (productForm) {

    productForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();

            postProduct();

        }
    );

}


async function postProduct() {

    const currentUser =
        auth.currentUser;


    if (!currentUser) {

        alert(
            "Please login first"
        );


        window.location.href =
            "login.html";


        return;
    }


    const name =
        document.getElementById(
            "productName"
        ).value.trim();


    const price =
        document.getElementById(
            "productPrice"
        ).value;


    const description =
        document.getElementById(
            "productDescription"
        ).value.trim();


    const imageFile =
        document.getElementById(
            "productImage"
        ).files[0];


    const categoryField =
        document.getElementById(
            "productCategory"
        );


    const locationField =
        document.getElementById(
            "productLocation"
        );


    const category =
        categoryField
            ? categoryField.value
            : "";


    const location =
        locationField
            ? locationField.value.trim()
            : "";


    if (
        name === "" ||
        price === ""
    ) {

        alert(
            "Please fill all required fields"
        );

        return;
    }


    const saveProduct =
        async (imageData) => {

            try {

                await addDoc(
                    collection(
                        db,
                        "products"
                    ),
                    {

                        name:
                            name,

                        price:
                            Number(price),

                        description:
                            description,

                        category:
                            category,

                        location:
                            location,

                        image:
                            imageData,

                        seller:
                            localStorage.getItem(
                                "loggedInUser"
                            ) ||
                            currentUser.email,

                        sellerUid:
                            currentUser.uid,

                        sellerEmail:
                            currentUser.email,

                        likes:
                            0,

                        createdAt:
                            new Date()

                    }
                );


                alert(
                    "Product posted successfully!"
                );


                window.location.href =
                    "mylistings.html";


            } catch (error) {

                console.error(error);


                alert(
                    error.message
                );

            }

        };


    if (imageFile) {

        const reader =
            new FileReader();


        reader.onload =
            function (e) {

                saveProduct(
                    e.target.result
                );

            };


        reader.readAsDataURL(
            imageFile
        );

    } else {

        saveProduct("");

    }

}


/* =========================================================
   MY LISTINGS
   ========================================================= */

async function loadMyFirestoreListings() {

    const container =
        document.getElementById(
            "myListingsGrid"
        );


    if (!container) return;


    const currentUser =
        auth.currentUser;


    if (!currentUser) {

        window.location.href =
            "login.html";

        return;
    }


    container.innerHTML =
        "<p>Loading your listings...</p>";


    try {

        const q =
            query(
                collection(
                    db,
                    "products"
                ),
                where(
                    "sellerUid",
                    "==",
                    currentUser.uid
                )
            );


        const querySnapshot =
            await getDocs(q);


        container.innerHTML =
            "";


        let count =
            0;


        querySnapshot.forEach(
            (docSnap) => {

                const product =
                    docSnap.data();


                count++;


                const placeholder =
                    "https://placehold.co/400x300/e8f0e8/006400?text=" +
                    encodeURIComponent(
                        product.name ||
                        "Item"
                    );


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "product-card";


                card.innerHTML =

                    '<img src="' +
                    (
                        product.image ||
                        placeholder
                    ) +
                    '" onerror="this.onerror=null;this.src=\'' +
                    placeholder +
                    '\'" alt="' +
                    (
                        product.name ||
                        "Item"
                    ) +
                    '">' +

                    '<div class="product-info">' +

                    '<h3>' +
                    (
                        product.name ||
                        ""
                    ) +
                    '</h3>' +

                    '<p class="product-price">R' +
                    (
                        product.price ||
                        0
                    ) +
                    '</p>' +

                    '<p>' +
                    (
                        product.description ||
                        ""
                    ) +
                    '</p>' +

                    '<button onclick="deleteMyListing(\'' +
                    docSnap.id +
                    '\')">Delete</button>' +

                    '</div>';


                container.appendChild(
                    card
                );

            }
        );


        if (count === 0) {

            container.innerHTML =
                '<p>You haven\'t listed anything yet. ' +
                '<a href="sell.html">Sell your first item</a></p>';

        }


    } catch (error) {

        console.error(
            "Listings error:",
            error
        );


        container.innerHTML =
            "<p>Couldn't load your listings right now.</p>";

    }

}


async function deleteMyListing(id) {

    if (
        !confirm(
            "Delete this listing?"
        )
    ) {

        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "products",
                id
            )
        );


        loadMyFirestoreListings();


    } catch (error) {

        alert(
            error.message
        );

    }

}


window.deleteMyListing =
    deleteMyListing;


if (
    document.getElementById(
        "myListingsGrid"
    )
) {

    window.addEventListener(
        "load",
        loadMyFirestoreListings
    );

}


/* =========================================================
   PROFILE / SETTINGS
   ========================================================= */

async function loadProfile() {

    const currentUser =
        auth.currentUser;


    if (!currentUser) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        /* ---------- Get Firebase profile ---------- */

        const userRef =
            doc(
                db,
                "users",
                currentUser.uid
            );


        const userSnap =
            await getDoc(
                userRef
            );


        if (!userSnap.exists()) {

            alert(
                "Your profile information could not be found."
            );

            return;
        }


        const userData =
            userSnap.data();


        /* ---------- Name ---------- */

        const userName =
            userData.fullname ||
            currentUser.email ||
            "User";


        const profileName =
            document.getElementById(
                "profileName"
            );


        if (profileName) {

            profileName.textContent =
                userName;

        }


        /* ---------- Profile initial ---------- */

        const profileInitial =
            document.getElementById(
                "profileInitial"
            );


        if (profileInitial) {

            profileInitial.textContent =
                userName
                    .charAt(0)
                    .toUpperCase();

        }


        /* ---------- Email ---------- */

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );


        if (profileEmail) {

            profileEmail.textContent =
                userData.email ||
                currentUser.email ||
                "";

        }


        /* ---------- WhatsApp number ---------- */

        const whatsappInput =
            document.getElementById(
                "whatsappNumber"
            );


        if (whatsappInput) {

            whatsappInput.value =
                userData.phone ||
                "";

        }


        /* ---------- Bio ---------- */

        const bioInput =
            document.getElementById(
                "bio"
            );


        if (bioInput) {

            bioInput.value =
                userData.bio ||
                "";


            const bioCounter =
                document.getElementById(
                    "bioCounter"
                );


            if (bioCounter) {

                bioCounter.textContent =
                    bioInput.value.length +
                    "/250";

            }

        }


        /* ---------- Count products ---------- */

        try {

            const q =
                query(
                    collection(
                        db,
                        "products"
                    ),
                    where(
                        "sellerUid",
                        "==",
                        currentUser.uid
                    )
                );


            const querySnapshot =
                await getDocs(q);


            const listedProducts =
                document.getElementById(
                    "listedProducts"
                );


            if (listedProducts) {

                listedProducts.textContent =
                    querySnapshot.size;

            }


        } catch (error) {

            console.log(
                "Could not count listings:",
                error.message
            );


            const listedProducts =
                document.getElementById(
                    "listedProducts"
                );


            if (listedProducts) {

                listedProducts.textContent =
                    "0";

            }

        }


        /* ---------- Profile image ---------- */

        const savedImage =
            localStorage.getItem(
                "profileImage"
            );


        if (savedImage) {

            const profileImage =
                document.getElementById(
                    "profileImage"
                );


            if (profileImage) {

                profileImage.src =
                    savedImage;

            }

        }


        /* ---------- Cover image ---------- */

        const savedCover =
            localStorage.getItem(
                "coverImage"
            );


        if (savedCover) {

            const coverImage =
                document.getElementById(
                    "coverImage"
                );


            if (coverImage) {

                coverImage.src =
                    savedCover;

            }

        }


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        alert(
            "Could not load your profile."
        );

    }

}


/* =========================================================
   START PROFILE / SETTINGS
   ========================================================= */

if (
    document.getElementById(
        "profileName"
    )
) {

    onAuthStateChanged(
        auth,
        (user) => {

            if (user) {

                loadProfile();

            }

        }
    );

}


/* =========================================================
   SAVE BIO
   ========================================================= */

async function saveBio() {

    const currentUser =
        auth.currentUser;


    if (!currentUser) {

        alert(
            "Please login first."
        );


        window.location.href =
            "login.html";


        return;
    }


    const bioInput =
        document.getElementById(
            "bio"
        );


    const status =
        document.getElementById(
            "bioStatus"
        );


    if (!bioInput) return;


    const bio =
        bioInput.value.trim();


    if (bio.length > 250) {

        alert(
            "Your bio cannot be longer than 250 characters."
        );

        return;
    }


    try {

        await setDoc(
            doc(
                db,
                "users",
                currentUser.uid
            ),
            {
                bio: bio
            },
            {
                merge: true
            }
        );


        if (status) {

            status.textContent =
                "Bio saved successfully.";

            status.style.color =
                "#006400";

        }


    } catch (error) {

        console.error(
            "Save bio error:",
            error
        );


        if (status) {

            status.textContent =
                "Could not save bio.";

            status.style.color =
                "#d32f2f";

        }

    }

}


/* =========================================================
   SAVE WHATSAPP NUMBER
   ========================================================= */

async function saveWhatsAppNumber() {

    const currentUser =
        auth.currentUser;


    if (!currentUser) {

        alert(
            "Please login first."
        );


        window.location.href =
            "login.html";


        return;
    }


    const phoneInput =
        document.getElementById(
            "whatsappNumber"
        );


    const status =
        document.getElementById(
            "whatsappStatus"
        );


    const saveButton =
        document.getElementById(
            "saveWhatsappBtn"
        );


    if (!phoneInput) return;


    const phone =
        phoneInput.value.trim();


    if (phone === "") {

        alert(
            "Please enter your WhatsApp number."
        );

        return;
    }


    const digits =
        phone.replace(
            /\D/g,
            ""
        );


    if (digits.length < 10) {

        alert(
            "Please enter a valid WhatsApp number."
        );

        return;
    }


    try {

        if (saveButton) {

            saveButton.disabled =
                true;


            saveButton.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> Saving...';

        }


        await setDoc(
            doc(
                db,
                "users",
                currentUser.uid
            ),
            {
                phone: phone
            },
            {
                merge: true
            }
        );


        if (status) {

            status.textContent =
                "WhatsApp number saved successfully.";

            status.style.color =
                "#006400";

        }


    } catch (error) {

        console.error(
            "Save WhatsApp error:",
            error
        );


        if (status) {

            status.textContent =
                "Could not save WhatsApp number.";

            status.style.color =
                "#d32f2f";

        }


    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;


            saveButton.innerHTML =
                '<i class="fas fa-save"></i> Save WhatsApp Number';

        }

    }

}


/* =========================================================
   GLOBAL SETTINGS FUNCTIONS
   ========================================================= */

window.saveBio =
    saveBio;


window.saveWhatsAppNumber =
    saveWhatsAppNumber;


/* =========================================================
   PROFILE IMAGE
   ========================================================= */

function uploadProfileImage() {

    const file =
        document.getElementById(
            "profileImageInput"
        ).files[0];


    if (!file) return;


    const reader =
        new FileReader();


    reader.onload =
        function (e) {

            localStorage.setItem(
                "profileImage",
                e.target.result
            );


            const image =
                document.getElementById(
                    "profileImage"
                );


            if (image) {

                image.src =
                    e.target.result;

            }

        };


    reader.readAsDataURL(
        file
    );

}


window.uploadProfileImage =
    uploadProfileImage;


/* =========================================================
   COVER IMAGE
   ========================================================= */

function uploadCoverImage() {

    const file =
        document.getElementById(
            "coverInput"
        ).files[0];


    if (!file) return;


    const reader =
        new FileReader();


    reader.onload =
        function (e) {

            localStorage.setItem(
                "coverImage",
                e.target.result
            );


            const image =
                document.getElementById(
                    "coverImage"
                );


            if (image) {

                image.src =
                    e.target.result;

            }

        };


    reader.readAsDataURL(
        file
    );

}


window.uploadCoverImage =
    uploadCoverImage;


/* =========================================================
   UNIBUY - WHATSAPP CONTACT SYSTEM
   ========================================================= */

/*
   Flow:

   Product
      ↓
   Contact Seller
      ↓
   messages.html?product=PRODUCT_ID
      ↓
   Get seller from Firebase
      ↓
   Get seller WhatsApp number
      ↓
   Open WhatsApp
*/


/* =========================================================
   START MESSAGES PAGE
   ========================================================= */

async function initMessagesPage(user) {

    const conversationList =
        document.getElementById(
            "conversationList"
        );


    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("product");


    /*
       If opened from a product,
       immediately contact seller.
    */

    if (productId) {

        await contactSellerFromProduct(
            user,
            productId
        );

        return;
    }


    /*
       No Firebase conversations.
    */

    if (conversationList) {

        conversationList.innerHTML =

            '<div class="empty-state">' +

                '<i class="fab fa-whatsapp" ' +
                'style="font-size:40px;margin-bottom:15px;"></i>' +

                '<h3>Contact sellers on WhatsApp</h3>' +

                '<p>' +

                    'Open a product and tap ' +
                    '<strong>Contact Seller</strong> ' +
                    'to chat with the seller on WhatsApp.' +

                '</p>' +

            '</div>';

    }

}


/* =========================================================
   CONTACT SELLER FROM PRODUCT
   ========================================================= */

async function contactSellerFromProduct(
    currentUser,
    productId
) {

    try {

        /* ---------- Get product ---------- */

        const productRef =
            doc(
                db,
                "products",
                productId
            );


        const productSnap =
            await getDoc(
                productRef
            );


        if (!productSnap.exists()) {

            alert(
                "This product could not be found."
            );

            return;
        }


        const product =
            productSnap.data();


        /* ---------- Find seller ---------- */

        let sellerUid =
            product.sellerUid ||
            "";


        /* ---------- Fallback: seller email ---------- */

        if (
            !sellerUid &&
            product.sellerEmail
        ) {

            const sellerQuery =
                query(
                    collection(
                        db,
                        "users"
                    ),
                    where(
                        "email",
                        "==",
                        product.sellerEmail
                    )
                );


            const sellerSnapshot =
                await getDocs(
                    sellerQuery
                );


            if (
                !sellerSnapshot.empty
            ) {

                sellerUid =
                    sellerSnapshot.docs[0].id;

            }

        }


        /* ---------- Fallback: seller name ---------- */

        if (
            !sellerUid &&
            product.seller
        ) {

            const sellerQuery =
                query(
                    collection(
                        db,
                        "users"
                    ),
                    where(
                        "fullname",
                        "==",
                        product.seller
                    )
                );


            const sellerSnapshot =
                await getDocs(
                    sellerQuery
                );


            if (
                !sellerSnapshot.empty
            ) {

                sellerUid =
                    sellerSnapshot.docs[0].id;

            }

        }


        /* ---------- Seller not found ---------- */

        if (!sellerUid) {

            alert(
                "We could not find the seller's account."
            );

            return;
        }


        /* ---------- Prevent contacting yourself ---------- */

        if (
            currentUser &&
            sellerUid === currentUser.uid
        ) {

            alert(
                "You cannot contact yourself about your own listing."
            );

            return;
        }


        /* ---------- Open WhatsApp ---------- */

        await openSellerWhatsApp(
            sellerUid,
            product
        );


    } catch (error) {

        console.error(
            "Contact seller error:",
            error
        );


        alert(
            "Could not contact the seller.\n\n" +
            (
                error.message ||
                "Please try again."
            )
        );

    }

}


/* =========================================================
   OPEN SELLER WHATSAPP
   ========================================================= */

async function openSellerWhatsApp(
    sellerUid,
    product
) {

    try {

        /* ---------- Get seller ---------- */

        const sellerRef =
            doc(
                db,
                "users",
                sellerUid
            );


        const sellerSnap =
            await getDoc(
                sellerRef
            );


        if (!sellerSnap.exists()) {

            alert(
                "Seller information could not be found."
            );

            return;
        }


        const seller =
            sellerSnap.data();


        /*
           Main field is now "phone".

           Older field names are kept as fallbacks
           so existing users still work.
        */

        let phone =
            seller.phone ||
            seller.whatsapp ||
            seller.whatsappNumber ||
            seller.contact ||
            seller.contactNumber ||
            seller.mobile ||
            seller.cellphone ||
            "";


        /* ---------- No phone ---------- */

        if (!phone) {

            alert(
                "This seller has not added a WhatsApp number yet."
            );

            return;
        }


        /*
           Remove:
           +
           spaces
           brackets
           dashes
           etc.
        */

        phone =
            String(phone)
                .replace(/\D/g, "");


        /*
           South Africa:

           0781234567
                ↓
           27781234567
        */

        if (
            phone.startsWith("0")
        ) {

            phone =
                "27" +
                phone.substring(1);

        }


        /* ---------- Validate phone ---------- */

        if (
            phone.length < 10
        ) {

            alert(
                "The seller's WhatsApp number appears to be invalid."
            );

            return;
        }


        /* ---------- Product information ---------- */

        const productName =
            product.name ||
            product.title ||
            "this product";


        const productPrice =
            product.price
                ? ` (R${product.price})`
                : "";


        /* ---------- Seller name ---------- */

        const sellerName =
            seller.fullname ||
            seller.name ||
            seller.email ||
            "Seller";


        /* ---------- WhatsApp message ---------- */

        const message =

            `Hi ${sellerName},\n\n` +

            `I'm interested in your ` +
            `"${productName}"` +

            `${productPrice} ` +

            `listed on UniBuy.\n\n` +

            `Is it still available?`;


        /* ---------- WhatsApp URL ---------- */

        const whatsappURL =
            "https://wa.me/" +
            phone +
            "?text=" +
            encodeURIComponent(
                message
            );


        console.log(
            "Opening WhatsApp:",
            whatsappURL
        );


        /* ---------- Open WhatsApp ---------- */

        window.location.href =
            whatsappURL;


    } catch (error) {

        console.error(
            "WhatsApp error:",
            error
        );


        alert(
            "Unable to open WhatsApp.\n\n" +
            (
                error.message ||
                "Please try again."
            )
        );

    }

}


/* =========================================================
   DIRECT CONTACT FUNCTION
   ========================================================= */

async function contactSellerOnWhatsApp(
    product
) {

    try {

        if (!product) {

            alert(
                "Product information is missing."
            );

            return;
        }


        let sellerUid =
            product.sellerUid ||
            "";


        /* ---------- Find seller by email ---------- */

        if (
            !sellerUid &&
            product.sellerEmail
        ) {

            const sellerQuery =
                query(
                    collection(
                        db,
                        "users"
                    ),
                    where(
                        "email",
                        "==",
                        product.sellerEmail
                    )
                );


            const sellerSnapshot =
                await getDocs(
                    sellerQuery
                );


            if (
                !sellerSnapshot.empty
            ) {

                sellerUid =
                    sellerSnapshot.docs[0].id;

            }

        }


        /* ---------- Find seller by name ---------- */

        if (
            !sellerUid &&
            product.seller
        ) {

            const sellerQuery =
                query(
                    collection(
                        db,
                        "users"
                    ),
                    where(
                        "fullname",
                        "==",
                        product.seller
                    )
                );


            const sellerSnapshot =
                await getDocs(
                    sellerQuery
                );


            if (
                !sellerSnapshot.empty
            ) {

                sellerUid =
                    sellerSnapshot.docs[0].id;

            }

        }


        if (!sellerUid) {

            alert(
                "Seller information could not be found."
            );

            return;
        }


        /* ---------- Current user ---------- */

        const currentUser =
            auth.currentUser;


        if (
            currentUser &&
            sellerUid === currentUser.uid
        ) {

            alert(
                "You cannot contact yourself about your own listing."
            );

            return;
        }


        await openSellerWhatsApp(
            sellerUid,
            product
        );


    } catch (error) {

        console.error(
            "Contact seller error:",
            error
        );


        alert(
            "Could not contact the seller."
        );

    }

}



/* =========================================================
   GLOBAL WHATSAPP FUNCTIONS
   ========================================================= */

window.contactSellerOnWhatsApp =
    contactSellerOnWhatsApp;


window.contactSellerFromProduct =
    contactSellerFromProduct;


window.openSellerWhatsApp =
    openSellerWhatsApp;