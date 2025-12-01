// booking.js - Handle food selection and booking process

let selectedFoodItems = [];
let currentCatererId = null;

// Load menu items for selected caterer
async function loadMenuItems(catererId) {
    try {
        const response = await fetch(`/api/menu?caterer_id=${catererId}`);
        const items = await response.json();
        displayMenuItems(items, catererId);
        currentCatererId = catererId;
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}

// Display menu items with checkboxes
function displayMenuItems(items, catererId) {
    const container = document.getElementById('menuItemsContainer');
    if (!container) return;
    
    container.innerHTML = '<h4>Select Food Items:</h4>';
    
    if (items.length === 0) {
        container.innerHTML += '<p>No menu items available</p>';
        return;
    }
    
    const itemsHtml = items.map(item => `
        <div class="menu-item-checkbox">
            <label>
                <input type="checkbox" value="${item.id}" data-price="${item.price}" onchange="updateSelectedItems()">
                ${item.name} - ₹${item.price} (${item.category})
            </label>
            <input type="number" class="item-quantity" value="1" min="1" max="100" onchange="updateSelectedItems()" style="display:none;">
        </div>
    `).join('');
    
    container.innerHTML += itemsHtml;
}

// Update selected items based on checkboxes
function updateSelectedItems() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    selectedFoodItems = [];
    
    checkboxes.forEach(checkbox => {
        const container = checkbox.closest('.menu-item-checkbox');
        const quantityInput = container.querySelector('.item-quantity');
        
        selectedFoodItems.push({
            menu_item_id: parseInt(checkbox.value),
            name: checkbox.parentElement.textContent.split('-')[0].trim(),
            price: parseInt(checkbox.dataset.price),
            quantity: parseInt(quantityInput.value) || 1
        });
    });
    
    updateTotalPrice();
}

// Calculate and display total price
function updateTotalPrice() {
    let total = 0;
    selectedFoodItems.forEach(item => {
        total += item.price * item.quantity;
    });
    
    const totalElement = document.getElementById('totalPrice');
    if (totalElement) {
        totalElement.textContent = total;
    }
    
    const selectedElement = document.getElementById('selectedItemsCount');
    if (selectedElement) {
        selectedElement.textContent = selectedFoodItems.length;
    }
}

// Handle booking submission
async function submitBooking(event) {
    event.preventDefault();
    
    if (selectedFoodItems.length === 0) {
        alert('Please select at least one food item');
        return;
    }
    
    const formData = new FormData(event.target);
    const bookingData = {
        caterer_id: currentCatererId,
        event_date: formData.get('event_date'),
        event_time: formData.get('event_time'),
        location: formData.get('location'),
        guest_count: parseInt(formData.get('guest_count')) || 50,
        special_requests: formData.get('special_requests'),
        food_items: selectedFoodItems.map(item => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity
        }))
    };
    
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        if (response.ok) {
            alert('✓ Booking created successfully!');
            location.reload();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        alert('Error creating booking');
    }
}

// Display booked food items for caterer
async function displayBookingItems(bookingId) {
    try {
        const response = await fetch(`/api/booking_items/${bookingId}`);
        const items = await response.json();
        
        const container = document.querySelector(`[data-booking-id="${bookingId}"] .booking-items`);
        if (!container) return;
        
        if (items.length === 0) {
            container.innerHTML = 'No items selected';
            return;
        }
        
        let total = 0;
        const itemsHtml = items.map(item => {
            total += item.price * item.quantity;
            return `
                <div class="booking-item">
                    <span>${item.name}</span>
                    <span>Qty: ${item.quantity}</span>
                    <span>₹${item.price * item.quantity}</span>
                </div>
            `;
        }).join('');
        
        container.innerHTML = `
            ${itemsHtml}
            <div class="booking-item-total">
                <strong>Total: ₹${total}</strong>
            </div>
        `;
    } catch (error) {
        console.error('Error loading booking items:', error);
    }
}

// Load all bookings with their items (for caterer)
async function loadBookingsWithItems() {
    try {
        const response = await fetch('/api/bookings');
        const bookings = await response.json();
        
        bookings.forEach(booking => {
            displayBookingItems(booking.booking_id);
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadBookingsWithItems();
});
