let editIndex = null;

// Show modal
document.getElementById("add_menu").onclick = function () {
    document.getElementById("menuModal").style.display = "flex";

    document.getElementById("modalTitle").innerText = "Add Menu Item";
    document.getElementById("updateItemBtn").style.display = "none";
    document.getElementById("saveItemBtn").style.display = "block";

    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
    document.getElementById("itemType").value = "";
    document.getElementById("itemCategory").value = "";
};

// Close modal
window.onclick = function (event) {
    if (event.target == document.getElementById("menuModal")) {
        document.getElementById("menuModal").style.display = "none";
    }
};

// Add Item
document.getElementById("saveItemBtn").onclick = function () {
    const name = itemName.value;
    const price = itemPrice.value;
    const type = itemType.value;
    const category = itemCategory.value;

    if (!name || !price || !type || !category) {
        alert("Please fill all fields");
        return;
    }

    const badge = type === "Veg" ? "badge-veg" : "badge-nonveg";

    const row = `
        <tr>
            <td>${name}</td>
            <td>₹${price}/plate</td>
            <td><span class="badge ${badge}">${type}</span></td>
            <td>${category}</td>
            <td>
                <button class="action-btn" onclick="editItem(this)"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="action-btn" onclick="deleteItem(this)"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        </tr>
    `;

    document.getElementById("menuBody").innerHTML += row;
    document.getElementById("menuModal").style.display = "none";
};

// Delete item
function deleteItem(btn) {
    btn.closest("tr").remove();
}

// Edit item
function editItem(btn) {
    const row = btn.closest("tr");
    editIndex = row.rowIndex - 1;

    const cells = row.children;

    document.getElementById("menuModal").style.display = "flex";
    document.getElementById("modalTitle").innerText = "Edit Menu Item";

    itemName.value = cells[0].innerText;
    itemPrice.value = cells[1].innerText.replace("₹", "").replace("/plate", "");
    itemType.value = cells[2].innerText.trim();
    itemCategory.value = cells[3].innerText;

    document.getElementById("saveItemBtn").style.display = "none";
    document.getElementById("updateItemBtn").style.display = "block";
}

// Update item
document.getElementById("updateItemBtn").onclick = function () {
    const table = document.getElementById("menuBody");
    const row = table.rows[editIndex];

    const badge = itemType.value === "Veg" ? "badge-veg" : "badge-nonveg";

    row.cells[0].innerText = itemName.value;
    row.cells[1].innerText = `₹${itemPrice.value}/plate`;
    row.cells[2].innerHTML = `<span class="badge ${badge}">${itemType.value}</span>`;
    row.cells[3].innerText = itemCategory.value;

    document.getElementById("menuModal").style.display = "none";
};
