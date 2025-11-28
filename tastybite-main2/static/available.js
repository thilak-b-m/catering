document.addEventListener("DOMContentLoaded", () => {

    // --- DOM refs ---
    const calendar = document.getElementById("calendar");
    const title = document.getElementById("calendar-title");
    const prevBtn = document.getElementById("prev-month");
    const nextBtn = document.getElementById("next-month");

    const totalDaysSpan = document.getElementById("totalDays");
    const thisMonthSpan = document.getElementById("thisMonth");
    const nextMonthSpan = document.getElementById("nextMonth");

    const dateBody = document.getElementById("dateBody");

    // --- State ---
    let current = new Date();               // displayed month/year
    let availableDates = [];                // store as "YYYY-MM-DD"

    // Helper: format to YYYY-MM-DD
    function ymd(y, m0, d) {
        const mm = String(m0 + 1).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        return `${y}-${mm}-${dd}`;
    }

    // Helper: label formatting
    function niceLabel(isoDate) {
        const d = new Date(isoDate + "T00:00:00");
        return d.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    // Load availability from server
    async function loadAvailability() {
        try {
            const response = await fetch('/api/availability');
            const data = await response.json();
            availableDates = data.map(d => d.available_date);
            
            renderCalendar();
            renderTable();
            updateStats();
        } catch (error) {
            console.error('Error loading availability:', error);
        }
    }

    // Toggle date on server
    async function toggleDate(isoDate) {
        const isAvailable = availableDates.includes(isoDate);
        
        try {
            if (isAvailable) {
                // Remove date
                await fetch(`/api/availability/${isoDate}`, {
                    method: 'DELETE'
                });
                availableDates = availableDates.filter(x => x !== isoDate);
            } else {
                // Add date
                const response = await fetch('/api/availability', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: isoDate })
                });
                
                if (response.ok) {
                    availableDates.push(isoDate);
                } else {
                    const result = await response.json();
                    if (result.message === "Date already exists") {
                        // Date already exists, just update UI
                        if (!availableDates.includes(isoDate)) {
                            availableDates.push(isoDate);
                        }
                    }
                }
            }

            availableDates.sort((a, b) => new Date(a) - new Date(b));

            renderCalendar();
            renderTable();
            updateStats();
        } catch (error) {
            console.error('Error toggling date:', error);
            alert('Error updating availability. Please try again.');
        }
    }

    // Render calendar
    function renderCalendar() {
        calendar.innerHTML = "";
        const year = current.getFullYear();
        const month = current.getMonth();

        title.innerText = `${current.toLocaleString(undefined, { month: "long" })} ${year}`;

        // Weekdays
        const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        weekdays.forEach(w => {
            const wdiv = document.createElement("div");
            wdiv.className = "weekday";
            wdiv.innerText = w;
            calendar.appendChild(wdiv);
        });

        // Empty cells before first day
        const firstDay = new Date(year, month, 1).getDay();
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            empty.className = "empty";
            calendar.appendChild(empty);
        }

        // Dates
        const totalDays = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let d = 1; d <= totalDays; d++) {
            const iso = ymd(year, month, d);
            const cell = document.createElement("div");
            cell.className = "date";
            cell.innerText = d;

            // Check if date is in the past
            const dateObj = new Date(year, month, d);
            const isPast = dateObj < today;

            if (isPast) {
                cell.classList.add("past");
                cell.style.opacity = "0.4";
                cell.style.cursor = "not-allowed";
            } else {
                if (availableDates.includes(iso)) {
                    cell.classList.add("available");
                }
                cell.addEventListener("click", () => toggleDate(iso));
            }

            calendar.appendChild(cell);
        }
    }

    // Update "Upcoming Available Dates" table
    function renderTable() {
        dateBody.innerHTML = "";

        // Filter to future dates only
        const today = new Date().toISOString().split('T')[0];
        const futureDates = availableDates.filter(d => d >= today);

        if (futureDates.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="2" style="text-align: center; color: #888; padding: 20px;">No available dates set. Click on dates in the calendar to add them.</td>`;
            dateBody.appendChild(row);
            return;
        }

        futureDates.forEach(date => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${niceLabel(date)}</td>
                <td>
                    <button class="action-btn remove-btn" data-date="${date}">
                        <i class="fa-solid fa-trash"></i> Remove
                    </button>
                </td>
            `;

            dateBody.appendChild(row);
        });

        // Remove handler
        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const iso = btn.getAttribute("data-date");
                await toggleDate(iso);
            });
        });
    }

    // Stats
    function updateStats() {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const today = now.toISOString().split('T')[0];

        let nextMonth = thisMonth + 1;
        let nextYear = thisYear;
        if (nextMonth === 12) {
            nextMonth = 0;
            nextYear++;
        }

        let total = 0, tm = 0, nm = 0;

        availableDates.forEach(iso => {
            // Only count future dates
            if (iso < today) return;
            
            const d = new Date(iso + "T00:00:00");
            total++;
            if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) tm++;
            if (d.getFullYear() === nextYear && d.getMonth() === nextMonth) nm++;
        });

        totalDaysSpan.innerText = total;
        thisMonthSpan.innerText = tm;
        nextMonthSpan.innerText = nm;
    }

    // Month Navigation
    prevBtn.addEventListener("click", () => {
        current.setMonth(current.getMonth() - 1);
        renderCalendar();
    });

    nextBtn.addEventListener("click", () => {
        current.setMonth(current.getMonth() + 1);
        renderCalendar();
    });

    // Init - Load from server
    loadAvailability();
});
