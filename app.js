const cartBtn = document.querySelector("nav .cart");
const cartsidebar = document.querySelector(".cart-sidebar");
const closecart = document.querySelector(".close-cart");
const burger = document.querySelector(".burger");
const menuSidebar = document.querySelector(".menu-sidebar");
const closeMenu = document.querySelector(".close-menu");
const cartItemstotal = document.querySelector(".noi"); // Fix: class selector lagaya
const cartPriceTotal = document.querySelector(".total-amount");
const cartUi = document.querySelector(".cart-sidebar .cart");
const totalDiv = document.querySelector(".total-sum");
const clearBtn = document.querySelector(".clear-cart-btn");
const cartContent = document.querySelector(".cart-content");

let cart = []; // Fix: main cart variable declare kiya
let buttonsDOM = [];

// Cart Sidebar Open
cartBtn.addEventListener("click", function() {
    cartsidebar.style.transform = "translateX(0%)";
    const bodyOverlay = document.createElement("div");
    bodyOverlay.classList.add("overlay");
    setTimeout(function() {
        document.querySelector("body").append(bodyOverlay);
    }, 300);
});

// Cart Sidebar Close
closecart.addEventListener("click", function() {
    cartsidebar.style.transform = "translateX(100%)";
    const bodyOverlay = document.querySelector(".overlay");
    if (bodyOverlay) {
        document.querySelector("body").removeChild(bodyOverlay);
    }
});

// Burger Menu Open
burger.addEventListener("click", function() {
    menuSidebar.style.transform = "translateX(0%)"; // Fix: translate ko translateX kiya
});

// Burger Menu Close
closeMenu.addEventListener("click", function() {
    menuSidebar.style.transform = "translateX(-100%)";
});

class product {
    async getproducts() {
        try {
            const response = await fetch("products.json");
            const data = await response.json();
            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const id = item.sys.id; // Fix: id missing thi
                const image = item.fields.image.fields.file.url; // Fix: feilds spelling
                return { title, price, id, image };
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

class UI {
    displayProducts(products) {
        let result = "";
        const p = document.querySelector(".products-center") || document.querySelector("body"); // Fix: safer fallback selector
        // style="width:30%; height:200px; object-fit:cover; border-radius:8px 8px 0 0;
        products.forEach(item => {
            const productDiv = document.createElement("div");
            productDiv.innerHTML = `<div class="products-card">
                                   <img src="${item.image}" alt="product">
                                   <span class="add-to-cart" data-id="${item.id}">
                                   <i class="fa fa-cart-plus fa-1x" style="margin-right:0.1em; font-size:1em;"></i>
                                   Add to cart
                                   </span>
                                   <div class="product-name">${item.title}</div>
                                   <div class="product-pricing">$${item.price}</div>
                                   </div>`;
            p.append(productDiv);
        });
    }

    getButton() { // Fix: DOMContentLoaded se matching name kiya
        const btns = document.querySelectorAll(".add-to-cart");
        buttonsDOM = btns;
        btns.forEach((btn) => {
            let id = btn.dataset.id;
            let incart = cart.find((item) => item.id === id); // Fix: firstElementChild galat tha, find kiya
            if (incart) {
                btn.innerHTML = "IN CART";
                btn.disabled = true; // Fix: dissabled spelling theek ki
            }
            btn.addEventListener("click", (e) => {
                e.currentTarget.innerHTML = "IN CART";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.pointerEvents = "none";
                let cartItem = { ...Storage.getStorageProducts(id), 'amount': 1 };
                cart.push(cartItem);
                Storage.saveCart(cart); // Fix: Capital Cart ko small kiya
                this.setCartValues(cart);
                this.addCartItem(cartItem);
            });
        });
    }

    setCartValues(cart) {
        let temptotal = 0;
        let itemTotal = 0;
        cart.map((item) => {
            temptotal += (item.price * item.amount);
            itemTotal += item.amount; // Fix: item total ko calculate kiya properly
        });
        cartItemstotal.innerHTML = itemTotal; // Fix: variable match kiya
        cartPriceTotal.innerHTML = parseFloat(temptotal.toFixed(2));
    }

    addCartItem(cartItem) {
        let cartItemUi = document.createElement("div");
        cartItemUi.classList.add("cart-item");
        cartItemUi.innerHTML = `<div class="cart-product">
                             <div class="product-image">
                             <img src="${cartItem.image}" alt="product">
                             </div>
                             <div class="cart-product-content">
                             <div class="cart-product-name"><h3>${cartItem.title}</h3></div>
                             <div class="cart-product-price"><h3>$${cartItem.price}</h3></div>
                             <span class="cart-product-remove" data-id="${cartItem.id}" style="color:red; cursor:pointer;">remove</span>
                             </div> 
                             <div class="plus-minus">
                             <i class="fa fa-chevron-up add-amount" data-id="${cartItem.id}"></i>
                             <span class="no-of-items">${cartItem.amount}</span>
                             <i class="fa fa-chevron-down reduce-amount" data-id="${cartItem.id}"></i>
                             </div>
                             </div>`;
        cartContent.append(cartItemUi);
    }

    setupApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        cart.map((item) => {
            this.addCartItem(item);
        });
    }

    cartlogic() {
        clearBtn.addEventListener("click", () => {
            this.clearCart();
        });
        cartContent.addEventListener("click", (event) => {
            if (event.target.classList.contains("cart-product-remove")) {
                let id = event.target.dataset.id;
                this.removeItem(id);
                let elementToRemove = event.target.parentElement.parentElement.parentElement;
                elementToRemove.parentElement.removeChild(elementToRemove);
            } else if (event.target.classList.contains("add-amount")) {
                let id = event.target.dataset.id;
                let item = cart.find((item) => item.id === id);
                item.amount++;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                event.target.nextElementSibling.innerHTML = item.amount;
            } else if (event.target.classList.contains("reduce-amount")) {
                let id = event.target.dataset.id;
                let item = cart.find((item) => item.id === id);
                if (item.amount > 1) {
                    item.amount--;
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    event.target.previousElementSibling.innerHTML = item.amount;
                } else {
                    this.removeItem(id);
                    let elementToRemove = event.target.parentElement.parentElement.parentElement;
                    elementToRemove.parentElement.removeChild(elementToRemove);
                }
            }
        });
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach((id) => this.removeItem(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
    }

    removeItem(id) {
        cart = cart.filter((item) => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getsingleButton(id);
        if (button) {
            button.style.pointerEvents = "unset";
            button.disabled = false;
            button.innerHTML = `<i class="fa fa-cart-plus"></i> Add to cart`;
        }
    }

    getsingleButton(id) {
        let btn;
        buttonsDOM.forEach((button) => {
            if (button.dataset.id === id) {
                btn = button;
            }
        });
        return btn;
    }
}

class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getStorageProducts(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find((item) => item.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem('Cart', JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('Cart') ? JSON.parse(localStorage.getItem("Cart")) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const products = new product();
    const ui = new UI();
    ui.setupApp();
    
    products.getproducts().then(productsData => { // Fix: function call name match kiya
        if (productsData) {
            ui.displayProducts(productsData);
            Storage.saveProducts(productsData); // Fix: Capital Storage
        }
    }).then(() => {
        ui.getButton(); // Fix: function name match kiya
        ui.cartlogic();
    });
});