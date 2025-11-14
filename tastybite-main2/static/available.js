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

    // Render calendar
    function renderCalendar() {
        calendar.innerHTML = "";
        const year = current.getFullYear();
        const month = current.getMonth();

        title.innerText = `${current.toLocaleString(undefined, { month: "long" })} ${year}`;

        // Weekdays
        const weekdays = ["Su","Mo","Tu","We","Th","Fr","Sa"];
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
        for (let d = 1; d <= totalDays; d++) {
            const iso = ymd(year, month, d);
            const cell = document.createElement("div");
            cell.className = "date";
            cell.innerText = d;

            if (availableDates.includes(iso)) {
                cell.classList.add("available");
            }

            cell.addEventListener("click", () => toggleDate(iso));
            calendar.appendChild(cell);
        }
    }

    // Toggle date select/unselect
    function toggleDate(isoDate) {
        if (availableDates.includes(isoDate)) {
            availableDates = availableDates.filter(x => x !== isoDate);
        } else {
            availableDates.push(isoDate);
        }

        availableDates.sort((a,b) => new Date(a) - new Date(b));

        renderCalendar();
        renderTable();
        updateStats();
    }

    // Update "Upcoming Available Dates" table
    function renderTable() {
        dateBody.innerHTML = "";

        if (availableDates.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="2">No available dates</td>`;
            dateBody.appendChild(row);
            return;
        }

        availableDates.forEach(date => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${niceLabel(date)}</td>
                <td>
                    <button class="action-btn remove-btn" data-date="${date}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;

            dateBody.appendChild(row);
        });

        // Remove handler
        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const iso = btn.getAttribute("data-date");
                availableDates = availableDates.filter(d => d !== iso);
                renderCalendar();
                renderTable();
                updateStats();
            });
        });
    }

    // Stats
    function updateStats() {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        let nextMonth = thisMonth + 1;
        let nextYear = thisYear;
        if (nextMonth === 12) {
            nextMonth = 0;
            nextYear++;
        }

        let total = 0, tm = 0, nm = 0;

        availableDates.forEach(iso => {
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

    // Init
    renderCalendar();
    renderTable();
    updateStats();
});
