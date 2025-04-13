window.onload = () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("login-container").style.display = "block";
    checkLoginSession();
  }, 2000);
};

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "Nitish" && password === "Pawanyadav@9529") {
    localStorage.setItem("session", JSON.stringify({ type: "admin" }));
    adminPanel();
  } else {
    const suppliers = getSuppliers();
    const user = suppliers.find(s => s.id === username && s.password === password);
    if (user) {
      localStorage.setItem("session", JSON.stringify({ type: "supplier", id: user.id }));
      supplierPanel(user.id);
    } else {
      alert("Invalid login credentials.");
    }
  }
}

function checkLoginSession() {
  const session = JSON.parse(localStorage.getItem("session"));
  if (session?.type === "admin") {
    adminPanel();
  } else if (session?.type === "supplier") {
    supplierPanel(session.id);
  }
}

function getSuppliers() {
  return JSON.parse(localStorage.getItem("suppliers") || "[]");
}

function adminPanel() {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("app").style.display = "block";

  const suppliers = getSuppliers();
  let list = suppliers.map(s => `
    <div style="margin: 10px; border: 1px solid #ccc; padding: 10px;">
      <h3>${s.name} (${s.id})</h3>
      <p>Phone: ${s.phone}</p>
      <p>Total Milk: ${s.totalMilk || 0} L</p>
      <p>Absent Days: ${s.absent || 0}</p>
      <p>Date Wise Collection: ${getDateWiseCollection(s.id)}</p>
      <button onclick="deleteSupplier('${s.id}')">Delete</button>
    </div>
  `).join("");

  document.getElementById("app").innerHTML = `
    <h2>Admin Panel</h2>
    <button onclick="logout()">Logout</button>
    <h3>Suppliers</h3>
    ${list || "<p>No suppliers added yet.</p>"}
    <hr/>
    <h3>Add Supplier</h3>
    <input id="newName" placeholder="Name" />
    <input id="newPhone" placeholder="Phone" />
    <input id="newId" placeholder="User ID" />
    <button onclick="addSupplier()">Add Supplier</button>
  `;
}

function getDateWiseCollection(id) {
  const data = JSON.parse(localStorage.getItem("milkData") || "{}");
  return data[id] || "No records";
}

function addSupplier() {
  const name = document.getElementById("newName").value;
  const phone = document.getElementById("newPhone").value;
  const id = document.getElementById("newId").value;

  let suppliers = getSuppliers();
  suppliers.push({ id, name, phone, password: "0000", totalMilk: 0, absent: 0 });
  localStorage.setItem("suppliers", JSON.stringify(suppliers));
  adminPanel();
}

function deleteSupplier(id) {
  let suppliers = getSuppliers().filter(s => s.id !== id);
  localStorage.setItem("suppliers", JSON.stringify(suppliers));
  adminPanel();
}

function supplierPanel(id) {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("app").style.display = "block";
  const supplier = getSuppliers().find(s => s.id === id);

  document.getElementById("app").innerHTML = `
    <h2>Welcome, ${supplier.name}</h2>
    <p>User ID: <strong style="color: green;">${supplier.id}</strong></p>
    <p>Total Milk Delivered: ${supplier.totalMilk} L</p>
    <p>Absent Days: ${supplier.absent}</p>
    <p>Date Wise Collection: ${getDateWiseCollection(id)}</p>
    <button onclick="logout()">Logout</button>
  `;
}

function logout() {
  localStorage.removeItem("session");
  location.reload();
}
