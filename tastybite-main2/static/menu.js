let editId = null;

// Helpers to show/hide modal
function showModal(kind = "add") {
    document.getElementById("menuModal").style.display = "flex";
    if (kind === "add") {
        document.getElementById("modalTitle").innerText = "Add Menu Item";
        document.getElementById("saveItemBtn").style.display = "block";
        document.getElementById("updateItemBtn").style.display = "none";
        document.getElementById("itemName").value = "";
        document.getElementById("itemPrice").value = "";
        document.getElementById("itemType").value = "";
        document.getElementById("itemCategory").value = "";
    } else {
        document.getElementById("modalTitle").innerText = "Edit Menu Item";
        document.getElementById("saveItemBtn").style.display = "none";
        document.getElementById("updateItemBtn").style.display = "block";
    }
}
function hideModal() {
    document.getElementById("menuModal").style.display = "none";
}

// Load items from server
async function loadMenu(caterer_id=null) {
    const qs = caterer_id ? `?caterer_id=${encodeURIComponent(caterer_id)}` : "";
    const res = await fetch(`/api/menu${qs}`);
    const items = await res.json();
    const tbody = document.getElementById("menuBody");
    tbody.innerHTML = "";

    items.forEach(item => {
        const badge = item.type === "Veg" ? "badge-veg" : "badge-nonveg";
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", item.id);
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>₹${item.price}/plate</td>
            <td><span class="badge ${badge}">${item.type}</span></td>
            <td>${item.category}</td>
            <td>
                <button class="action-btn" onclick="editItem(${item.id}, this)"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="action-btn" onclick="deleteItem(${item.id})"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// initial load
document.addEventListener("DOMContentLoaded", () => {
    loadMenu();
});

// Show modal when Add clicked
document.getElementById("add_menu").onclick = function () {
    editId = null;
    showModal("add");
};

// Close modal if click outside content
window.onclick = function (event) {
    if (event.target === document.getElementById("menuModal")) {
        hideModal();
    }
};

// Save new item
document.getElementById("saveItemBtn").onclick = async function () {
    const name = document.getElementById("itemName").value.trim();
    const price = document.getElementById("itemPrice").value;
    const type = document.getElementById("itemType").value;
    const category = document.getElementById("itemCategory").value;

    if (!name || !price || !type || !category) {
        alert("Please fill all fields");
        return;
    }

    await fetch("/api/menu", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ name, price, type, category })
    });

    hideModal();
    loadMenu();
};

// Delete item
async function deleteItem(id) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    loadMenu();
}

// Edit: open modal with values
function editItem(id, btn) {
    editId = id;
    const row = btn.closest("tr");
    const cells = row.children;

    document.getElementById("itemName").value = cells[0].innerText;
    document.getElementById("itemPrice").value = cells[1].innerText.replace("₹","").replace("/plate","");
    document.getElementById("itemType").value = cells[2].innerText.trim();
    document.getElementById("itemCategory").value = cells[3].innerText;

    showModal("edit");
}

// Update item
document.getElementById("updateItemBtn").onclick = async function () {
    if (!editId) return;
    const name = document.getElementById("itemName").value.trim();
    const price = document.getElementById("itemPrice").value;
    const type = document.getElementById("itemType").value;
    const category = document.getElementById("itemCategory").value;

    if (!name || !price || !type || !category) {
        alert("Please fill all fields");
        return;
    }

    await fetch(`/api/menu/${editId}`, {
        method: "PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ name, price, type, category })
    });

    hideModal();
    loadMenu();
};
