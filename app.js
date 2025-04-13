window.onload = () => {
  setTimeout(() => {
    document.getElementById("splash").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
  }, 3000);
};

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "Nitish" && password === "Pawanyadav@9529") {
    localStorage.setItem("userType", "admin");
    showAdminPanel();
  } else {
    const suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];
    const supplier = suppliers.find(s => s.id === username && s.password === password);
    if (supplier) {
      localStorage.setItem("userType", "supplier");
      localStorage.setItem("currentSupplier", supplier.id);
      showSupplierPanel(supplier);
    } else {
      alert("Invalid login credentials!");
    }
  }
}

function showAdminPanel() {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("admin-panel").classList.remove("hidden");
}

function showSupplierPanel(supplier) {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("supplier-panel").classList.remove("hidden");
  document.getElementById("supplier-content").innerHTML = `
    <h3>Welcome, ${supplier.name}</h3>
    <p>User ID: <strong>${supplier.id}</strong></p>
    <p>Total Milk: ${supplier.totalMilk || 0} litres</p>
  `;
}
// Utilities
function getSuppliers() {
  return JSON.parse(localStorage.getItem("suppliers")) || [];
}

function saveSuppliers(suppliers) {
  localStorage.setItem("suppliers", JSON.stringify(suppliers));
}

// Add Supplier UI
function showAddSupplier() {
  const form = `
    <h3>Add New Supplier</h3>
    <input type="text" id="new-name" placeholder="Name" required/>
    <input type="text" id="new-id" placeholder="User ID" required/>
    <input type="text" id="new-mobile" placeholder="Mobile Number" />
    <input type="file" id="new-photo" accept="image/*"/>
    <button onclick="addSupplier()">Add Supplier</button>
  `;
  document.getElementById("admin-content").innerHTML = form;
}

// Add Supplier Logic
function addSupplier() {
  const name = document.getElementById("new-name").value;
  const id = document.getElementById("new-id").value;
  const mobile = document.getElementById("new-mobile").value;
  const file = document.getElementById("new-photo").files[0];

  if (!name || !id) {
    alert("Please fill in all fields!");
    return;
  }

  let reader = new FileReader();
  reader.onload = function () {
    const suppliers = getSuppliers();
    if (suppliers.find(s => s.id === id)) {
      alert("Supplier with this ID already exists!");
      return;
    }

    suppliers.push({
      name,
      id,
      mobile,
      photo: reader.result,
      password: "0000",
      records: [],
      totalMilk: 0,
      paid: false
    });

    saveSuppliers(suppliers);
    alert("Supplier added!");
    renderSuppliers();
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    // Default image
    const suppliers = getSuppliers();
    suppliers.push({
      name,
      id,
      mobile,
      photo: null,
      password: "0000",
      records: [],
      totalMilk: 0,
      paid: false
    });
    saveSuppliers(suppliers);
    alert("Supplier added!");
    renderSuppliers();
  }
}

// View Suppliers List
function renderSuppliers() {
  const suppliers = getSuppliers();
  const content = suppliers.map(s => `
    <div class="supplier-card">
      <img src="${s.photo || 'https://via.placeholder.com/80'}" width="80" height="80"/>
      <h4>${s.name}</h4>
      <p>ID: ${s.id}</p>
      <p>Mobile: ${s.mobile}</p>
      <button onclick="recordMilk('${s.id}')">Add Milk</button>
      <button onclick="viewSupplierDetail('${s.id}')">Details</button>
      <button onclick="deleteSupplier('${s.id}')">Delete</button>
    </div>
  `).join("");

  document.getElementById("admin-content").innerHTML = `<div class="supplier-grid">${content}</div>`;
}

// Delete supplier
function deleteSupplier(id) {
  if (!confirm("Are you sure?")) return;
  const suppliers = getSuppliers().filter(s => s.id !== id);
  saveSuppliers(suppliers);
  renderSuppliers();
}

// Record Milk for a Supplier
function recordMilk(id) {
  const quantity = prompt("Enter milk quantity (in litres):");
  if (!quantity || isNaN(quantity)) return;

  const date = new Date().toISOString().split("T")[0];
  const suppliers = getSuppliers();
  const supplier = suppliers.find(s => s.id === id);
  if (!supplier.records) supplier.records = [];
  supplier.records.push({ date, quantity: parseFloat(quantity) });
  supplier.totalMilk += parseFloat(quantity);

  saveSuppliers(suppliers);
  alert("Milk entry recorded.");
}

// View Supplier Details
function viewSupplierDetail(id) {
  const suppliers = getSuppliers();
  const s = suppliers.find(sup => sup.id === id);
  const logs = s.records.map(r => `<li>${r.date} — ${r.quantity}L</li>`).join("");
  document.getElementById("admin-content").innerHTML = `
    <h3>${s.name} (${s.id})</h3>
    <img src="${s.photo || 'https://via.placeholder.com/100'}" width="100"/>
    <p>Mobile: ${s.mobile}</p>
    <p>Total Milk: ${s.totalMilk}L</p>
    <h4>Milk Records:</h4>
    <ul>${logs}</ul>
    <button onclick="markPaid('${id}')">Mark as Paid</button>
  `;
}

// Mark Paid
function markPaid(id) {
  const suppliers = getSuppliers();
  const supplier = suppliers.find(s => s.id === id);
  supplier.paid = true;
  saveSuppliers(suppliers);
  alert("Marked as paid.");
}
// Show Milk Analytics
function viewAnalytics() {
  const suppliers = getSuppliers();
  const dateMap = {};

  suppliers.forEach(supplier => {
    supplier.records.forEach(rec => {
      if (!dateMap[rec.date]) dateMap[rec.date] = 0;
      dateMap[rec.date] += rec.quantity;
    });
  });

  const entries = Object.entries(dateMap).sort();
  const rows = entries.map(([date, qty]) => `<tr><td>${date}</td><td>${qty} L</td></tr>`).join("");

  document.getElementById("admin-content").innerHTML = `
    <h3>Milk Collection Summary</h3>
    <table border="1">
      <tr><th>Date</th><th>Total Milk</th></tr>
      ${rows}
    </table>
  `;
}

// View Calendar (Who was absent on which date)
function viewCalendar() {
  const suppliers = getSuppliers();
  const calendar = {};

  suppliers.forEach(s => {
    const dates = s.records.map(r => r.date);
    const allDates = new Set(suppliers.flatMap(s => s.records.map(r => r.date)));
    allDates.forEach(date => {
      if (!calendar[date]) calendar[date] = [];
      if (!dates.includes(date)) {
        calendar[date].push(s.name);
      }
    });
  });

  const content = Object.entries(calendar).map(([date, names]) => `
    <div>
      <strong>${date}</strong>: ${names.length ? names.join(", ") : "All Present"}
    </div>
  `).join("");

  document.getElementById("admin-content").innerHTML = `<h3>Absentee Calendar</h3>${content}`;
}

// Add Products (Visible to Suppliers)
function showProductPanel() {
  const form = `
    <h3>Add Product</h3>
    <input type="text" id="prod-name" placeholder="Product Name" />
    <input type="text" id="prod-price" placeholder="Price (₹)" />
    <button onclick="addProduct()">Add Product</button>
  `;
  document.getElementById("admin-content").innerHTML = form;
}

function addProduct() {
  const name = document.getElementById("prod-name").value;
  const price = document.getElementById("prod-price").value;
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  products.push({ name, price });
  localStorage.setItem("products", JSON.stringify(products));
  alert("Product added.");
}

// Export Data
function exportData() {
  const suppliers = getSuppliers();
  const data = JSON.stringify(suppliers, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gvala_data.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Search & Filter
function searchSuppliers(query) {
  const suppliers = getSuppliers().filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.id.toLowerCase().includes(query.toLowerCase()) ||
    s.mobile.includes(query)
  );

  const content = suppliers.map(s => `
    <div class="supplier-card">
      <img src="${s.photo || 'https://via.placeholder.com/80'}" width="80" height="80"/>
      <h4>${s.name}</h4>
      <p>ID: ${s.id}</p>
      <p>Mobile: ${s.mobile}</p>
      <button onclick="recordMilk('${s.id}')">Add Milk</button>
      <button onclick="viewSupplierDetail('${s.id}')">Details</button>
    </div>
  `).join("");

  document.getElementById("admin-content").innerHTML = `
    <input type="text" placeholder="Search..." onkeyup="searchSuppliers(this.value)" />
    <div class="supplier-grid">${content}</div>
  `;
}
// ----------------- Persistent Login ------------------
function checkLoginSession() {
  const session = JSON.parse(localStorage.getItem("session"));
  if (session?.type === "admin") {
    adminPanel();
  } else if (session?.type === "supplier") {
    supplierPanel(session.id);
  }
}
window.onload = checkLoginSession;


// ----------------- Supplier Password Change ------------------
function showPasswordChangePanel(id) {
  const panel = `
    <h3>Change Password</h3>
    <input type="password" id="new-pass" placeholder="New Password"/>
    <button onclick="changePassword('${id}')">Change</button>
  `;
  document.getElementById("supplier-content").innerHTML = panel;
}

function changePassword(id) {
  const pass = document.getElementById("new-pass").value;
  if (!pass) return alert("Enter a password!");
  const suppliers = getSuppliers();
  const sup = suppliers.find(s => s.id === id);
  sup.password = pass;
  saveSuppliers(suppliers);
  alert("Password changed successfully.");
}

// ----------------- Daily Reminder System ------------------
function reminderCheck() {
  const today = new Date().toISOString().split("T")[0];
  const suppliers = getSuppliers();
  const missed = [];

  suppliers.forEach(s => {
    const hasToday = s.records.some(r => r.date === today);
    if (!hasToday) missed.push(s.name);
  });

  if (missed.length > 0) {
    alert(`Reminder:\nThese suppliers didn't deliver milk today:\n${missed.join(", ")}`);
  }
}
setTimeout(reminderCheck, 2000); // Check shortly after load
