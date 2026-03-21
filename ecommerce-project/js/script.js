// ============================================================
//  ECOMMERCE WEBSITE - MAIN JAVASCRIPT FILE
//  All logic: products, cart, search, filter, localStorage
// ============================================================


// ─────────────────────────────────────────────
//  PRODUCT DATA
//  Each product is an object inside an array.
//  To add a product: copy one object block and
//  paste it with a new id, name, price, category, image.
//  Put your image files in the /images/ folder.
// ─────────────────────────────────────────────
const products = [
  { id: 1, name: "Laptop",        price: 850000, category: "Electronics", image: "images/laptop1.jfif" },
  { id: 2, name: "Smartphone",    price: 650000, category: "Electronics", image: "images/phone.jpeg" },
  { id: 3, name: "Wireless Earbuds", price: 50000, category: "Electronics", image: "images/phone2.jpeg" },
  { id: 4, name: "Running Shoes", price: 95000,  category: "Fashion",     image: "images/shoe.jpeg" },
  { id: 5, name: "Leather Jacket",price: 180000, category: "Fashion",     image: "images/newyork.jpeg" },
  { id: 6, name: "JavaScript Book",price: 45000, category: "Books",       image: "images/book.jpeg" },
  { id: 7, name: "Python Book",   price: 40000,  category: "Books",       image: "images/book2.jpeg" },
  { id: 8, name: "Smart Watch",   price: 220000, category: "Electronics", image: "images/watch1.jpeg" }
];


// ─────────────────────────────────────────────
//  CART HELPERS  (used by all pages)
//  Cart is saved in localStorage as a JSON string
//  so it survives page refreshes.
// ─────────────────────────────────────────────

// Read cart from localStorage (returns an array)
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch (error) {
    // If localStorage data is corrupted, start fresh
    console.error("Error reading cart from localStorage:", error);
    return [];
  }
}

// Save cart array back to localStorage
function saveCart(cart) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
    alert("Could not save cart. Storage may be full.");
  }
}

// Update the cart counter badge shown in the navbar
function updateCartCount() {
  const countEl = document.getElementById("cart-count");
  if (!countEl) return; // element might not exist on checkout page
  const cart = getCart();
  // Add up all quantities to get total item count
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  countEl.textContent = total;
}


// ─────────────────────────────────────────────
//  HOME PAGE — Product Display, Search, Filter
// ─────────────────────────────────────────────

// Called when index.html loads
function initHomePage() {
  const grid = document.getElementById("product-grid");
  if (!grid) return; // not on home page

  // Show all products on first load
  displayProducts(products);

  // ── Search bar: filter as user types ──
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterAndDisplay(); // re-render with current filters
    });
  }

  // ── Category filter buttons ──
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      // Highlight the active button
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filterAndDisplay();
    });
  });

  updateCartCount(); // show correct count on load
}

// Read current search text and active category, then display matching products
function filterAndDisplay() {
  const searchText = document.getElementById("search-input").value.toLowerCase();
  const activeBtn  = document.querySelector(".filter-btn.active");
  const category   = activeBtn ? activeBtn.dataset.category : "all";

  // Filter the products array
  const filtered = products.filter(function (p) {
    const matchesSearch   = p.name.toLowerCase().includes(searchText);
    const matchesCategory = (category === "all") || (p.category === category);
    return matchesSearch && matchesCategory;
  });

  displayProducts(filtered);
}

// Build product cards using DOM methods and inject them into the grid
function displayProducts(list) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = ""; // clear old cards

  if (list.length === 0) {
    // Show a friendly message when nothing matches
    grid.innerHTML = "<p class='no-results'>No products found. Try a different search.</p>";
    return;
  }

  list.forEach(function (product) {
    // ── Create card container ──
    const card = document.createElement("div");
    card.className = "product-card";

    // ── Product image ──
    // If the image file is missing, a grey placeholder shows instead
    const img = document.createElement("img");
    img.src   = product.image;
    img.alt   = product.name;
    img.onerror = function () {
      // Replace broken image with a placeholder div
      const placeholder = document.createElement("div");
      placeholder.className = "img-placeholder";
      placeholder.textContent = product.name[0]; // first letter as icon
      card.replaceChild(placeholder, img);
    };

    // ── Product info ──
    const name     = document.createElement("h3");
    name.textContent = product.name;

    const category = document.createElement("span");
    category.className   = "category-tag";
    category.textContent = product.category;

    const price = document.createElement("p");
    price.className   = "price";
    price.textContent = "UGX " + product.price.toLocaleString();

    // ── Add to Cart button ──
    const btn = document.createElement("button");
    btn.className   = "add-to-cart-btn";
    btn.textContent = "Add to Cart";

    // When clicked, add this product to the cart
    btn.addEventListener("click", function () {
      addToCart(product);
    });

    // ── Assemble card ──
    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(category);
    card.appendChild(price);
    card.appendChild(btn);

    grid.appendChild(card); // add card to the page
  });
}


// ─────────────────────────────────────────────
//  ADD TO CART
// ─────────────────────────────────────────────
function addToCart(product) {
  try {
    const cart = getCart();

    // Check if product is already in the cart
// if yes just add on until limit
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += 1; // just increase quantity
    } else {
      // Add new item with quantity 1
      cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    }

    saveCart(cart);
    updateCartCount();

    // Brief visual feedback on the button
    const btns = document.querySelectorAll(".add-to-cart-btn");
    btns.forEach(function (btn) {
      if (btn.closest(".product-card") && btn.closest(".product-card").querySelector("h3").textContent === product.name) {
        btn.textContent = "Added ✓";
        btn.classList.add("added");
        setTimeout(function () {
          btn.textContent = "Add to Cart";
          btn.classList.remove("added");
        }, 1200);
      }
    });

  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Something went wrong adding the item. Please try again.");
  }
}


// ─────────────────────────────────────────────
//  CART PAGE
// ─────────────────────────────────────────────
function initCartPage() {
  const cartContainer = document.getElementById("cart-items");
  if (!cartContainer) return; // not on cart page

  renderCart();
  updateCartCount();
}

// Draw all cart items on cart.html
function renderCart() {
  const cart = getCart();
  const cartContainer = document.getElementById("cart-items");
  const totalEl       = document.getElementById("cart-total");
  const summaryEl     = document.getElementById("cart-summary");
  const emptyMsg      = document.getElementById("empty-message");
  const checkoutBtn   = document.getElementById("checkout-btn");

  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    // Show empty state
    if (emptyMsg)    emptyMsg.style.display    = "block";
    if (summaryEl)   summaryEl.style.display   = "none";
    if (checkoutBtn) checkoutBtn.style.display = "none";
    return;
  }

  if (emptyMsg)    emptyMsg.style.display    = "none";
  if (summaryEl)   summaryEl.style.display   = "block";
  if (checkoutBtn) checkoutBtn.style.display = "inline-block";

  let grandTotal = 0;

  cart.forEach(function (item) {
    const row = document.createElement("div");
    row.className = "cart-item";

    // Item image
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;
    img.onerror = function () { img.src = ""; img.style.display = "none"; };

    // Item name + price
    const info = document.createElement("div");
    info.className = "cart-item-info";
    info.innerHTML = `<h3>${item.name}</h3><p>UGX ${item.price.toLocaleString()} each</p>`;

    // ── Quantity controls ──
    const qtyControls = document.createElement("div");
    qtyControls.className = "qty-controls";

    const minusBtn = document.createElement("button");
    minusBtn.textContent = "−";
    minusBtn.className   = "qty-btn";
    minusBtn.addEventListener("click", function () { changeQuantity(item.id, -1); });

    const qtyDisplay = document.createElement("span");
    qtyDisplay.className   = "qty-display";
    qtyDisplay.textContent = item.quantity;

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "+";
    plusBtn.className   = "qty-btn";
    plusBtn.addEventListener("click", function () { changeQuantity(item.id, 1); });

    qtyControls.appendChild(minusBtn);
    qtyControls.appendChild(qtyDisplay);
    qtyControls.appendChild(plusBtn);

    // Item subtotal
    const subtotal = document.createElement("p");
    subtotal.className   = "item-subtotal";
    const lineTotal = item.price * item.quantity;
    subtotal.textContent = "UGX " + lineTotal.toLocaleString();
    grandTotal += lineTotal;

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className   = "remove-btn";
    removeBtn.addEventListener("click", function () { removeFromCart(item.id); });

    // Assemble row
    row.appendChild(img);
    row.appendChild(info);
    row.appendChild(qtyControls);
    row.appendChild(subtotal);
    row.appendChild(removeBtn);

    cartContainer.appendChild(row);
  });

  // Show grand total
  if (totalEl) totalEl.textContent = "Total: UGX " + grandTotal.toLocaleString();
}

// Increase or decrease a cart item's quantity
function changeQuantity(productId, change) {
  try {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);

    if (!item) throw new Error("Product not found in cart");

    // Validate: quantity cannot go below 1
    if (item.quantity + change < 1) {
      alert("Minimum quantity is 1. Use Remove to delete the item.");
      return;
    }

    item.quantity += change;
    saveCart(cart);
    renderCart();      // re-draw the cart
    updateCartCount(); // update navbar badge

  } catch (error) {
    console.error("Error changing quantity:", error);
    alert("Invalid quantity change.");
  }
}

// Remove an item completely from the cart
function removeFromCart(productId) {
  try {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId); // keep everything except this item
    saveCart(cart);
    renderCart();
    updateCartCount();
  } catch (error) {
    console.error("Error removing item:", error);
  }
}


// ─────────────────────────────────────────────
//  CHECKOUT PAGE
// ─────────────────────────────────────────────
function initCheckoutPage() {
  const form = document.getElementById("checkout-form");
  if (!form) return; // not on checkout page

  // Show order summary on the checkout page
  renderOrderSummary();
  updateCartCount();

  // Handle form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // stop page from reloading
    handleCheckout();
  });
}

// Show a mini order summary so user can confirm what they're buying
function renderOrderSummary() {
  const summaryEl = document.getElementById("order-summary");
  if (!summaryEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    summaryEl.innerHTML = "<p class='empty-notice'>Your cart is empty. <a href='index.html'>Go shopping</a></p>";
    return;
  }

  let html = "<ul class='summary-list'>";
  let total = 0;

  cart.forEach(function (item) {
    const lineTotal = item.price * item.quantity;
    total += lineTotal;
    html += `<li><span>${item.name} × ${item.quantity}</span><span>UGX ${lineTotal.toLocaleString()}</span></li>`;
  });

  html += `</ul><p class="summary-total">Total: UGX ${total.toLocaleString()}</p>`;
  summaryEl.innerHTML = html;
}

// Validate form fields, then place the order
function handleCheckout() {
  try {
    // ── Read form values ──
    const name    = document.getElementById("name").value.trim();
    const email   = document.getElementById("email").value.trim();
    const phone   = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    // ── Validate: all fields must be filled ──
    if (!name || !email || !phone || !address) {
      throw new Error("Please fill in all fields before submitting.");
    }

    // ── Validate: email format ──
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      throw new Error("Please enter a valid email address (e.g. you@example.com).");
    }

    // ── Validate: phone (digits only, 10–15 characters) ──
    const phonePattern = /^[0-9]{10,15}$/;
    if (!phonePattern.test(phone)) {
      throw new Error("Phone number must be 10–15 digits with no spaces or dashes.");
    }

    // ── Validate: cart must not be empty ──
    const cart = getCart();
    if (cart.length === 0) {
      throw new Error("Your cart is empty. Add products before checking out.");
    }

    // ── All good — place the order ──
    localStorage.removeItem("cart"); // clear cart after order
    updateCartCount();

    // Show success message
    document.getElementById("checkout-form").style.display = "none";
    document.getElementById("order-summary").style.display = "none";

    const successMsg = document.getElementById("success-message");
    if (successMsg) {
      successMsg.style.display = "block";
      successMsg.innerHTML = `
        <div class="success-box">
          <h2>🎉 Order Placed!</h2>
          <p>Thank you, <strong>${name}</strong>!</p>
          <p>Your order will be delivered to <strong>${address}</strong>.</p>
          <p>A confirmation will be sent to <strong>${email}</strong>.</p>
          <a href="index.html" class="continue-btn">Continue Shopping</a>
        </div>
      `;
    }

  } catch (error) {
    // Display error message to user
    const errorBox = document.getElementById("form-error");
    if (errorBox) {
      errorBox.textContent = error.message;
      errorBox.style.display = "block";
    } else {
      alert(error.message);
    }
    console.error("Checkout error:", error);
  }
}


// ─────────────────────────────────────────────
//  PAGE ROUTER
//  Detect which page we are on and run the
//  correct init function.
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const page = document.body.dataset.page;

  if (page === "home")     initHomePage();
  if (page === "cart")     initCartPage();
  if (page === "checkout") initCheckoutPage();
});
