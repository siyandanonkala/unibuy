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
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* =========================================================
   AUTH STATE
   ========================================================= */

onAuthStateChanged(auth, (user) => {

    if (
        window.location.pathname.endsWith("sell.html") &&
        !user
    ) {
        alert(
            "Please log in or register before posting an item."
        );

        window.location.href = "login.html";
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
        submitBtn.disabled = true;
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

        alert(error.message);

    } finally {

        if (submitBtn) {
            submitBtn.disabled = false;
        }

    }

}


/* =========================================================
   AUTH: REGISTER
   ========================================================= */

function register() {

    const fullname =
        document.getElementById(
            "fullname"
        ).value.trim();

    const email =
        document.getElementById(
            "email"
        ).value.trim();

    const password =
        document.getElementById(
            "password"
        ).value;


    if (
        fullname === "" ||
        email === "" ||
        password === ""
    ) {

        alert(
            "Please fill in all fields"
        );

        return;
    }


    createUserWithEmailAndPassword(
        auth,
        email,
        password
    )
        .then(
            async (userCredential) => {

                const user =
                    userCredential.user;


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
                            email
                    }
                );


                alert(
                    "Account created successfully!"
                );


                window.location.href =
                    "login.html";
            }
        )
        .catch(
            (error) => {

                alert(
                    error.message
                );

            }
        );
}


/* =========================================================
   AUTH: LOGIN
   ========================================================= */

async function login() {

    const emailInput =
        document.getElementById("loginEmail");

    const passwordInput =
        document.getElementById("loginPassword");

    if (!emailInput || !passwordInput) {
        console.error("Login inputs not found.");
        return;
    }

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (email === "" || password === "") {

        alert("Please fill in all fields.");

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
                userData.fullname || email
            );

            localStorage.setItem(
                "loggedInEmail",
                userData.email || email
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


        alert("Login successful!");


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
    document.getElementById("loginButton");


if (loginButton) {

    loginButton.addEventListener(
        "click",
        login
    );

}


/* =========================================================
   GLOBAL AUTH FUNCTIONS
   ========================================================= */

window.login = login;
window.register = register;
window.logout = logout;


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

                loginLink.onclick = null;

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

    const loggedInUser =
        localStorage.getItem(
            "loggedInUser"
        );


    if (!loggedInUser) {

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
                            loggedInUser,

                        sellerUid:
                            auth.currentUser.uid,

                        sellerEmail:
                            auth.currentUser.email,

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


    const loggedInUser =
        localStorage.getItem(
            "loggedInUser"
        );


    if (!loggedInUser) {

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
                    "seller",
                    "==",
                    loggedInUser
                )
            );


        const querySnapshot =
            await getDocs(q);


        container.innerHTML =
            "";


        let count = 0;


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
                    product.name +
                    '">' +

                    '<div class="product-info">' +

                    '<h3>' +
                    product.name +
                    '</h3>' +

                    '<p class="product-price">R' +
                    product.price +
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

        container.innerHTML =
            "<p>Couldn't load your listings right now.</p>";


        console.log(
            error.message
        );
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

    const userName =
        localStorage.getItem(
            "loggedInUser"
        );


    if (!userName) {

        window.location.href =
            "login.html";

        return;
    }


    const email =
        localStorage.getItem(
            "loggedInEmail"
        ) || "";


    document.getElementById(
        "profileName"
    ).textContent =
        userName;


    document.getElementById(
        "profileInitial"
    ).textContent =
        userName
            .charAt(0)
            .toUpperCase();


    if (email) {

        document.getElementById(
            "profileEmail"
        ).textContent =
            email;
    }


    try {

        const q =
            query(
                collection(
                    db,
                    "products"
                ),
                where(
                    "seller",
                    "==",
                    userName
                )
            );


        const querySnapshot =
            await getDocs(q);


        document.getElementById(
            "listedProducts"
        ).textContent =
            querySnapshot.size;


    } catch (error) {

        document.getElementById(
            "listedProducts"
        ).textContent =
            "0";


        console.log(
            error.message
        );
    }


    const savedImage =
        localStorage.getItem(
            "profileImage"
        );


    if (savedImage) {

        document.getElementById(
            "profileImage"
        ).src =
            savedImage;
    }


    const savedCover =
        localStorage.getItem(
            "coverImage"
        );


    if (savedCover) {

        document.getElementById(
            "coverImage"
        ).src =
            savedCover;
    }

}


if (
    document.getElementById(
        "profileName"
    )
) {

    window.addEventListener(
        "load",
        loadProfile
    );
}


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


            document.getElementById(
                "profileImage"
            ).src =
                e.target.result;
        };


    reader.readAsDataURL(
        file
    );
}


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


            document.getElementById(
                "coverImage"
            ).src =
                e.target.result;
        };


    reader.readAsDataURL(
        file
    );
}


/* =========================================================
   UNIBUY MESSAGING
   ========================================================= */

/* ---------- Start Messages Page ---------- */

async function initMessagesPage(user) {

    const conversationList =
        document.getElementById("conversationList");

    if (!conversationList) return;

    const params =
        new URLSearchParams(window.location.search);

    const productId =
        params.get("product");

    if (productId) {

        await openConversationFromProduct(
            user,
            productId
        );

        return;
    }

    loadUserConversations(user);
}


/* =========================================================
   OPEN CONVERSATION FROM PRODUCT
   ========================================================= */

async function openConversationFromProduct(
    currentUser,
    productId
) {

    try {

        const productRef =
            doc(db, "products", productId);

        const productSnap =
            await getDoc(productRef);

        if (!productSnap.exists()) {

            alert("This product could not be found.");

            window.location.href =
                "messages.html";

            return;
        }

        const product =
            productSnap.data();

        let sellerUid =
            product.sellerUid || "";


        /* ---------- Find seller by email ---------- */

        if (!sellerUid && product.sellerEmail) {

            const sellerQuery =
                query(
                    collection(db, "users"),
                    where(
                        "email",
                        "==",
                        product.sellerEmail
                    )
                );

            const sellerSnapshot =
                await getDocs(sellerQuery);

            if (!sellerSnapshot.empty) {

                sellerUid =
                    sellerSnapshot.docs[0].id;
            }
        }


        /* ---------- Find seller by name ---------- */

        if (!sellerUid && product.seller) {

            const sellerQuery =
                query(
                    collection(db, "users"),
                    where(
                        "fullname",
                        "==",
                        product.seller
                    )
                );

            const sellerSnapshot =
                await getDocs(sellerQuery);

            if (!sellerSnapshot.empty) {

                sellerUid =
                    sellerSnapshot.docs[0].id;
            }
        }


        if (!sellerUid) {

            alert(
                "We could not find the seller's account."
            );

            return;
        }


        /* ---------- Prevent self messaging ---------- */

        if (sellerUid === currentUser.uid) {

            alert(
                "You cannot message yourself about your own listing."
            );

            window.location.href =
                "messages.html";

            return;
        }


        await openSellerConversation(
            currentUser,
            sellerUid,
            productId
        );

    } catch (error) {

        console.error(
            "Open seller conversation error:",
            error
        );

        alert(
            "Could not open the seller's chat.\n\n" +
            error.code +
            "\n" +
            error.message
        );
    }
}


/* =========================================================
   CREATE / OPEN SELLER CHAT
   ========================================================= */

async function openSellerConversation(
    currentUser,
    sellerUid,
    productId
) {

    const conversationList =
        document.getElementById(
            "conversationList"
        );

    const emptyMessage =
        document.getElementById(
            "messagesEmpty"
        );

    if (!conversationList) return;


    try {

        /* ---------- Get product ---------- */

        const productSnap =
            await getDoc(
                doc(
                    db,
                    "products",
                    productId
                )
            );

        if (!productSnap.exists()) {

            alert("Product no longer exists.");

            return;
        }

        const product =
            productSnap.data();

        const productName =
            product.name || "Product";


        /* ---------- Get seller ---------- */

        const sellerSnap =
            await getDoc(
                doc(
                    db,
                    "users",
                    sellerUid
                )
            );

        let sellerName =
            product.seller || "Seller";

        if (sellerSnap.exists()) {

            const sellerData =
                sellerSnap.data();

            sellerName =
                sellerData.fullname ||
                sellerData.email ||
                sellerName;
        }


        /* ---------- Conversation ID ---------- */

        const participants = [
            currentUser.uid,
            sellerUid
        ].sort();

        const conversationId =
            productId +
            "_" +
            participants.join("_");


        const conversationRef =
            doc(
                db,
                "conversations",
                conversationId
            );


        /* =================================================
           CREATE CONVERSATION
           ================================================= */

        const existingConversation =
            await getDoc(
                conversationRef
            );


        if (!existingConversation.exists()) {

            await setDoc(
                conversationRef,
                {

                    buyerUid:
                        currentUser.uid,

                    sellerUid:
                        sellerUid,

                    participants:
                        participants,

                    productId:
                        productId,

                    productName:
                        productName,

                    lastMessage:
                        "",

                    lastSenderUid:
                        "",

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()
                }
            );

            console.log(
                "NEW conversation created:",
                conversationId
            );

        } else {

            console.log(
                "EXISTING conversation opened:",
                conversationId
            );
        }


        /* ---------- Hide empty message ---------- */

        if (emptyMessage) {

            emptyMessage.style.display =
                "none";
        }


        /* =================================================
           CHAT UI
           ================================================= */

        conversationList.innerHTML =

            '<div class="chat-container">' +

                '<div class="chat-header">' +

                    '<button ' +
                        'type="button" ' +
                        'id="backToMessages" ' +
                        'class="chat-back">' +

                        '<i class="fas fa-arrow-left"></i>' +

                    '</button>' +

                    '<div>' +

                        '<strong>' +
                            escapeHtml(
                                sellerName
                            ) +
                        '</strong>' +

                        '<small>' +
                            escapeHtml(
                                productName
                            ) +
                        '</small>' +

                    '</div>' +

                '</div>' +

                '<div ' +
                    'class="chat-messages" ' +
                    'id="chatMessages">' +

                '</div>' +

                '<form ' +
                    'class="chat-input-area" ' +
                    'id="chatForm">' +

                    '<input ' +
                        'type="text" ' +
                        'id="chatInput" ' +
                        'placeholder="Type a message..." ' +
                        'autocomplete="off">' +

                    '<button type="submit">' +

                        '<i class="fas fa-paper-plane"></i>' +

                    '</button>' +

                '</form>' +

            '</div>';


        /* ---------- Back button ---------- */

        const backButton =
            document.getElementById(
                "backToMessages"
            );

        if (backButton) {

            backButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "messages.html";

                }
            );
        }


        const chatMessages =
            document.getElementById(
                "chatMessages"
            );

        const chatForm =
            document.getElementById(
                "chatForm"
            );

        const chatInput =
            document.getElementById(
                "chatInput"
            );


        /* =================================================
           MESSAGES COLLECTION
           ================================================= */

        const messagesRef =
            collection(
                db,
                "conversations",
                conversationId,
                "messages"
            );


        const messagesQuery =
            query(
                messagesRef,
                orderBy(
                    "createdAt",
                    "asc"
                )
            );


        /* =================================================
           REAL-TIME MESSAGES
           ================================================= */

        onSnapshot(
            messagesQuery,

            function (snapshot) {

                chatMessages.innerHTML = "";

                if (snapshot.empty) {

                    chatMessages.innerHTML =
                        '<div class="no-chat-messages">' +
                        'Start the conversation 👋' +
                        '</div>';

                    return;
                }


                snapshot.forEach(
                    function (messageDoc) {

                        const message =
                            messageDoc.data();

                        const isMine =
                            message.senderUid ===
                            currentUser.uid;


                        const messageDiv =
                            document.createElement(
                                "div"
                            );


                        messageDiv.className =
                            "chat-message " +
                            (
                                isMine
                                    ? "mine"
                                    : "theirs"
                            );


                        messageDiv.innerHTML =

                            '<div class="message-bubble">' +

                                escapeHtml(
                                    message.text || ""
                                ) +

                            '</div>';


                        chatMessages.appendChild(
                            messageDiv
                        );
                    }
                );


                chatMessages.scrollTop =
                    chatMessages.scrollHeight;

            },

            function (error) {

                console.error(
                    "Messages listener error:",
                    error
                );

                chatMessages.innerHTML =
                    "<p>Unable to load messages.</p>";
            }
        );


        /* =================================================
           SEND MESSAGE
           ================================================= */

        chatForm.addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();

                const text =
                    chatInput.value.trim();

                if (!text) return;


                chatInput.disabled =
                    true;


                try {

                    const senderName =
                        localStorage.getItem(
                            "loggedInUser"
                        ) ||
                        currentUser.email ||
                        "User";


                    /* ---------- Add message ---------- */

                    await addDoc(
                        messagesRef,
                        {

                            text:
                                text,

                            senderUid:
                                currentUser.uid,

                            senderName:
                                senderName,

                            createdAt:
                                serverTimestamp()

                        }
                    );


                    /* ---------- Update conversation ---------- */

                    await setDoc(
                        conversationRef,
                        {

                            lastMessage:
                                text,

                            lastSenderUid:
                                currentUser.uid,

                            updatedAt:
                                serverTimestamp()

                        },
                        {
                            merge: true
                        }
                    );


                    chatInput.value = "";


                } catch (error) {

                    console.error(
                        "Send message error:",
                        error
                    );

                    alert(
                        "Could not send message.\n\n" +
                        error.code +
                        "\n" +
                        error.message
                    );

                } finally {

                    chatInput.disabled =
                        false;

                    chatInput.focus();
                }

            }
        );


    } catch (error) {

        console.error(
            "Conversation error:",
            error
        );

        conversationList.innerHTML =

            '<p class="empty-state">' +

                'Could not open this conversation.' +

                '<br><br>' +

                escapeHtml(
                    error.code || ""
                ) +

                '<br>' +

                escapeHtml(
                    error.message || ""
                ) +

            '</p>';
    }
}


/* =========================================================
   LOAD EXISTING CONVERSATIONS
   ========================================================= */

function loadUserConversations(user) {

    const conversationList =
        document.getElementById(
            "conversationList"
        );

    const emptyMessage =
        document.getElementById(
            "messagesEmpty"
        );

    if (!conversationList) return;


    const q =
        query(
            collection(
                db,
                "conversations"
            ),
            where(
                "participants",
                "array-contains",
                user.uid
            )
        );


    onSnapshot(

        q,

        async function (snapshot) {

            conversationList.innerHTML = "";


            if (snapshot.empty) {

                if (emptyMessage) {

                    emptyMessage.style.display =
                        "block";
                }

                return;
            }


            if (emptyMessage) {

                emptyMessage.style.display =
                    "none";
            }


            const conversations =
                snapshot.docs
                    .map(
                        function (conversationDoc) {

                            return {

                                id:
                                    conversationDoc.id,

                                data:
                                    conversationDoc.data()

                            };
                        }
                    )
                    .sort(
                        function (a, b) {

                            const aTime =
                                a.data.updatedAt &&
                                a.data.updatedAt.toMillis
                                    ? a.data.updatedAt.toMillis()
                                    : 0;

                            const bTime =
                                b.data.updatedAt &&
                                b.data.updatedAt.toMillis
                                    ? b.data.updatedAt.toMillis()
                                    : 0;

                            return bTime - aTime;
                        }
                    );


            for (
                const conversation
                of conversations
            ) {

                const data =
                    conversation.data;


                const otherUid =
                    data.participants.find(
                        function (uid) {

                            return uid !== user.uid;

                        }
                    );


                let otherName =
                    "User";


                if (otherUid) {

                    try {

                        const userSnap =
                            await getDoc(
                                doc(
                                    db,
                                    "users",
                                    otherUid
                                )
                            );


                        if (
                            userSnap.exists()
                        ) {

                            const otherUser =
                                userSnap.data();

                            otherName =
                                otherUser.fullname ||
                                otherUser.email ||
                                "User";
                        }

                    } catch (error) {

                        console.error(
                            "User lookup error:",
                            error
                        );
                    }
                }


                const item =
                    document.createElement(
                        "a"
                    );


                item.className =
                    "conversation-item";


                item.href =
                    "messages.html?seller=" +
                    encodeURIComponent(
                        otherUid || ""
                    ) +
                    "&product=" +
                    encodeURIComponent(
                        data.productId || ""
                    );


                item.innerHTML =

                    '<div class="conversation-avatar">' +

                        escapeHtml(
                            otherName
                                .charAt(0)
                                .toUpperCase()
                        ) +

                    '</div>' +

                    '<div class="conversation-info">' +

                        '<h3>' +

                            escapeHtml(
                                otherName
                            ) +

                        '</h3>' +

                        '<p>' +

                            escapeHtml(
                                data.lastMessage ||
                                data.productName ||
                                "Conversation"
                            ) +

                        '</p>' +

                    '</div>';


                conversationList.appendChild(
                    item
                );
            }

        },

        function (error) {

            console.error(
                "Conversation listener error:",
                error
            );


            conversationList.innerHTML =

                '<p class="empty-state">' +

                    'Unable to load conversations.' +

                    '<br><br>' +

                    escapeHtml(
                        error.code || ""
                    ) +

                    '<br>' +

                    escapeHtml(
                        error.message || ""
                    ) +

                '</p>';
        }
    );
}


/* =========================================================
   HTML PROTECTION
   ========================================================= */

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   START MESSAGING
   ========================================================= */

onAuthStateChanged(
    auth,
    function (user) {

        if (
            !document.getElementById(
                "conversationList"
            )
        ) {

            return;
        }


        if (!user) {

            alert(
                "Please log in to use messages."
            );

            window.location.href =
                "login.html";

            return;
        }


        initMessagesPage(user);

    }
);
/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.login = login;
window.register = register;
window.logout = logout;
window.deleteMyListing = deleteMyListing;
window.uploadProfileImage = uploadProfileImage;
window.uploadCoverImage = uploadCoverImage
