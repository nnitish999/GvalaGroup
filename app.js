document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splashScreen");
  const loginContainer = document.getElementById("loginContainer");
  const loginForm = document.getElementById("loginForm");
  const adminDashboard = document.getElementById("adminDashboard");
  const supplierDashboard = document.getElementById("supplierDashboard");
  const supplierResults = document.getElementById("supplierResults");
  const supplierProductList = document.getElementById("supplierProductList");
  const milkHistoryList = document.getElementById("milkHistoryList");

  setTimeout(() => {
    splash.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  }, 3000);

  let currentUser = null;

  const users = JSON.parse(localStorage.getItem("users")) || {
    "nitish": { password: "Pawanyadav@9529", type: "admin" }
  };

  const milkData = JSON.parse(localStorage.getItem("milkData")) || {};
  const products = JSON.parse(localStorage.getItem("products")) || [];

  function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("milkData", JSON.stringify(milkData));
    localStorage.setItem("products", JSON.stringify(products));
  }

  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const user = users[username];

    if (user && user.password === password) {
      currentUser = username;
      loginContainer.classList.add("hidden");

      if (user.type === "admin") {
        adminDashboard.classList.remove("hidden");
        displayProducts();
      } else {
        supplierDashboard.classList.remove("hidden");
        displaySupplierData(username);
      }
    } else {
      alert("Invalid login.");
    }
  });

  window.addSupplier = function () {
    const id = document.getElementById("supplierId").value;
    const name = document.getElementById("supplierName").value;
    const mobile = document.getElementById("supplierMobile").value;
    const photoInput = document.getElementById("supplierPhoto");

    if (users[id]) {
      alert("User ID already exists.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      users[id] = {
        name,
        mobile,
        password: "0000",
        type: "supplier",
        photo: reader.result
      };
      saveData();
      alert("Supplier added successfully.");
    };
    if (photoInput.files[0]) {
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      users[id] = {
        name,
        mobile,
        password: "0000",
        type: "supplier",
        photo: ""
      };
      saveData();
      alert("Supplier added without photo.");
    }
  };

  window.searchSupplier = function () {
    const search = document.getElementById("searchInput").value.toLowerCase();
    supplierResults.innerHTML = "";

    Object.entries(users).forEach(([id, user]) => {
      if (user.type === "supplier" &&
          (id.includes(search) ||
           user.name.toLowerCase().includes(search) ||
           user.mobile.includes(search))) {

        const div = document.createElement("div");
        div.innerHTML = `<strong>${user.name}</strong> (${id}) - ${user.mobile}`;
        supplierResults.appendChild(div);
      }
    });
  };

  window.addProduct = function () {
    const name = document.getElementById("productName").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    if (name && price) {
      products.push({ name, price });
      saveData();
      displayProducts();
    }
  };

  function displayProducts() {
    const productList = document.getElementById("productList");
    productList.innerHTML = "";
    products.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.name} - ₹${p.price}`;
      productList.appendChild(li);
    });
  }

  function displaySupplierData(id) {
    const user = users[id];
    document.getElementById("supplierNameDisplay").textContent = user.name;
    document.getElementById("supplierMobileDisplay").textContent = user.mobile;
    document.getElementById("supplierPhotoDisplay").src = user.photo || "";

    displayMilkHistory();
    displayAvailableProducts();
  }

  window.submitMilk = function () {
    const litres = parseFloat(document.getElementById("milkAmount").value);
    if (!litres) return;
    const date = new Date().toISOString().split("T")[0];
    if (!milkData[currentUser]) milkData[currentUser] = [];
    milkData[currentUser].push({ date, litres });
    saveData();
    displayMilkHistory();
  };

  function displayMilkHistory() {
    milkHistoryList.innerHTML = "";
    const records = milkData[currentUser] || [];
    records.forEach(r => {
      const li = document.createElement("li");
      li.textContent = `${r.date} - ${r.litres} litres`;
      milkHistoryList.appendChild(li);
    });
  }

  function displayAvailableProducts() {
    supplierProductList.innerHTML = "";
    products.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.name} - ₹${p.price}`;
      supplierProductList.appendChild(li);
    });
  }
});