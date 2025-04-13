// Splash screen timeout
window.onload = function () {
  setTimeout(() => {
    document.getElementById("splashScreen").classList.add("hidden");
    document.getElementById("loginContainer").classList.remove("hidden");
  }, 3000);
};

const adminCredentials = {
  username: "nitish",
  password: "Pawanyadav@9529",
};

let currentUser = null;

// Event listener for login
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.toLowerCase();
  const password = document.getElementById("password").value;

  if (username === adminCredentials.username && password === adminCredentials.password) {
    currentUser = { role: "admin", username: "nitish" };
    showAdminDashboard();
  } else {
    const supplier = getSupplier(username);
    if (supplier && supplier.password === password) {
      currentUser = { role: "supplier", username };
      showSupplierDashboard(supplier);
    } else {
      alert("Invalid credentials");
    }
  }
});

// Storage helpers
function getSuppliers() {
  return JSON.parse(localStorage.getItem("suppliers") || "{}");
}
// Load suppliers from localStorage when the app starts
let suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];

// Save supplier to localStorage
function addSupplier(supplier) {
  suppliers.push(supplier);
  localStorage.setItem("suppliers", JSON.stringify(suppliers));
  alert("Supplier added and saved permanently!");
  renderSuppliers();
}

// Call this function with form data
function createSupplier() {
  const name = prompt("Enter supplier name:");
  const phone = prompt("Enter supplier mobile:");
  const userId = "SUP" + Date.now();
  const photo = ""; // can integrate photo upload later

  const newSupplier = {
    id: userId,
    name: name,
    phone: phone,
    photo: photo,
    password: "0000", // default
    milkRecords: milkrecord,
    absents: absent,
    payments: payment
  };

  addSupplier(newSupplier);
}

// Display suppliers on screen
function renderSuppliers() {
  const container = document.getElementById("dashboard");
  container.innerHTML = `<h3>Suppliers</h3>`;
  suppliers.forEach(s => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${s.name}</strong> (${s.phone}) - ID: ${s.id}`;
    container.appendChild(div);
  });
}

// Initial render
renderSuppliers();


function saveSuppliers(suppliers) {
  localStorage.setItem("suppliers", JSON.stringify(suppliers));
}

function getSupplier(id) {
  const suppliers = getSuppliers();
  return suppliers[id];
}

function showAdminDashboard() {
  document.getElementById("loginContainer").classList.add("hidden");
  document.getElementById("adminDashboard").classList.remove("hidden");
  loadSuppliers();
  loadProducts();
}

function addSupplier() {
  const id = document.getElementById("supplierId").value;
  const name = document.getElementById("supplierName").value;
  const mobile = document.getElementById("supplierMobile").value;
  const photoInput = document.getElementById("supplierPhoto");

  if (!id || !name || !mobile) return alert("Please fill all fields");

  const reader = new FileReader();
  reader.onload = function () {
    const suppliers = getSuppliers();
    suppliers[id] = {
      id,
      name,
      mobile,
      photo: reader.result,
      password: "0000",
      milkRecords: [],
    };
    saveSuppliers(suppliers);
    alert("Supplier added!");
    loadSuppliers();
  };

  if (photoInput.files[0]) reader.readAsDataURL(photoInput.files[0]);
  else alert("Please add a photo.");
}

function loadSuppliers(filter = "") {
  const results = document.getElementById("supplierResults");
  results.innerHTML = "";
  const suppliers = getSuppliers();

  Object.values(suppliers).forEach(supplier => {
    if (
      supplier.name.toLowerCase().includes(filter.toLowerCase()) ||
      supplier.mobile.includes(filter) ||
      supplier.id.includes(filter)
    ) {
      const overdue = getOverdues(supplier);
      const el = document.createElement("div");
      el.innerHTML = `
        <h4>${supplier.name} (${supplier.id})</h4>
        <img src="${supplier.photo}" class="profile-pic" />
        <p>Mobile: ${supplier.mobile}</p>
        <p>Password: ${supplier.password}</p>
        <p>Total Milk: ${getTotalMilk(supplier)} L</p>
        <p>Overdue Days: ${overdue.length}</p>
        <hr/>
      `;
      results.appendChild(el);
    }
  });
}

function searchSupplier() {
  const value = document.getElementById("searchInput").value;
  loadSuppliers(value);
}

function getTotalMilk(supplier) {
  return supplier.milkRecords.reduce((sum, entry) => sum + entry.litres, 0);
}

function getOverdues(supplier) {
  const allDates = getLastNDays(30); // check for past 30 days
  const presentDates = supplier.milkRecords.map(rec => rec.date);
  return allDates.filter(d => !presentDates.includes(d));
}

function getLastNDays(n) {
  const dates = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// Milk Submission for supplier
function showSupplierDashboard(supplier) {
  document.getElementById("loginContainer").classList.add("hidden");
  document.getElementById("supplierDashboard").classList.remove("hidden");

  document.getElementById("supplierNameDisplay").textContent = supplier.name;
  document.getElementById("supplierMobileDisplay").textContent = supplier.mobile;
  document.getElementById("supplierPhotoDisplay").src = supplier.photo;

  loadSupplierMilkHistory(supplier);
  loadProductsForSupplier();
}

function submitMilk() {
  const litres = parseFloat(document.getElementById("milkAmount").value);
  if (isNaN(litres) || litres <= 0) return alert("Enter valid milk amount");

  const date = new Date().toISOString().split("T")[0];
  const suppliers = getSuppliers();
  const supplier = suppliers[currentUser.username];

  supplier.milkRecords.push({ date, litres });
  saveSuppliers(suppliers);
  alert("Milk recorded!");
  loadSupplierMilkHistory(supplier);
}

function loadSupplierMilkHistory(supplier) {
  const list = document.getElementById("milkHistoryList");
  list.innerHTML = "";
  supplier.milkRecords.forEach(rec => {
    const li = document.createElement("li");
    li.textContent = `${rec.date}: ${rec.litres} L`;
    list.appendChild(li);
  });
}

// Product features
function getProducts() {
  return JSON.parse(localStorage.getItem("products") || "[]");
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

function addProduct() {
  const name = document.getElementById("productName").value;
  const price = document.getElementById("productPrice").value;

  if (!name || !price) return alert("Enter both product name and price");
  const products = getProducts();
  products.push({ name, price });
  saveProducts(products);
  loadProducts();
}

function loadProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = "";
  const products = getProducts();
  products.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name} - ₹${p.price}`;
    list.appendChild(li);
  });
}

function loadProductsForSupplier() {
  const list = document.getElementById("supplierProductList");
  list.innerHTML = "";
  const products = getProducts();
  products.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name} - ₹${p.price}`;
    list.appendChild(li);
  });
}
