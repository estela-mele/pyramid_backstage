/*
=====================================================
PYRAMID BACKSTAGE
APP.JS
Global platform logic
=====================================================
*/

function initializeWorkspacePage() {

    const resolveButton =
        document.getElementById("resolve-conflict-btn");

    if (resolveButton) {
        resolveButton.addEventListener("click", triggerResolution);
    }

    console.log("Workspace initialized.");
}

window.initializeWorkspacePage = initializeWorkspacePage;

/*
=====================================================
TOAST NOTIFICATION SYSTEM
=====================================================
*/

function showToast(message, type = "info") {

    const toast = document.createElement("div");

    let styleClass = "";

    switch (type) {

        case "success":
            styleClass =
                "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400";
            break;

        case "warning":
            styleClass =
                "bg-amber-500/10 border border-amber-500/30 text-amber-400";
            break;

        case "error":
            styleClass =
                "bg-red-500/10 border border-red-500/30 text-red-400";
            break;

        default:
            styleClass =
                "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400";
            break;
    }

    toast.className = `
        fixed
        top-6
        right-6
        z-[9999]
        px-4
        py-3
        rounded-xl
        font-medium
        text-sm
        shadow-lg
        fade-in
        ${styleClass}
    `;

    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        toast.style.transition = "all .3s ease";

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3000);
}

/*
=====================================================
AI COPILOT SIMULATION
=====================================================
*/

function triggerCopilot(event) {

    event.preventDefault();

    const defaultText =
        document.getElementById("copilot-default-text");

    const resultsBox =
        document.getElementById("copilot-results");

    if (defaultText) {
        defaultText.classList.add("hidden");
    }

    if (resultsBox) {
        resultsBox.classList.remove("hidden");
    }

    const title =
        document.getElementById("req-title")?.value ||
        "Untitled Event";

    const size =
        document.getElementById("req-size")?.value ||
        "0";

    const venue =
        document.getElementById("req-venue")?.value ||
        "Orange Hall";

    console.log({
        title,
        size,
        venue
    });

    showToast(
        "AI Copilot generated proposal successfully.",
        "success"
    );

    setTimeout(() => {

        showToast(
            "Resource conflict detected: Projector #3",
            "warning"
        );

    }, 1200);
}

/*
=====================================================
CONFLICT RESOLUTION
=====================================================
*/

function triggerResolution() {

    const projectorStatus =
        document.getElementById(
            "workspace-projector-status"
        );

    if (projectorStatus) {

        projectorStatus.className =
            "flex justify-between text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded";

        projectorStatus.innerHTML = `
            <span>✓ Projector #5 Allocated</span>
            <span class="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">
                Rerouted
            </span>
        `;
    }

    const banner =
        document.getElementById(
            "ops-alert-banner"
        );

    if (banner) {

        banner.className =
            "p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2";

        banner.innerHTML = `
            <i data-lucide="check-circle"></i>
            Operational integrity restored.
            Projector #5 assigned successfully.
        `;
    }

    const inventoryStatus =
        document.getElementById(
            "inventory-projector-status"
        );

    if (inventoryStatus) {

        inventoryStatus.className =
            "font-bold text-emerald-400";

        inventoryStatus.innerText =
            "Resolved via Unit #5 swap";
    }

    if (window.lucide) {
        lucide.createIcons();
    }

    showToast(
        "Conflict resolved successfully.",
        "success"
    );
}

/*
=====================================================
DEMO METRICS
=====================================================
*/

function randomizeMetrics() {

    const revenue =
        document.getElementById("metric-revenue");

    const utilization =
        document.getElementById("metric-utilization");

    const events =
        document.getElementById("metric-events");

    if (!revenue) return;

    revenue.innerText =
        "$" +
        (
            Math.floor(Math.random() * 15000) +
            25000
        ).toLocaleString();

    if (utilization) {
        utilization.innerText =
            (70 + Math.random() * 20).toFixed(1) +
            "%";
    }

    if (events) {
        events.innerText =
            Math.floor(Math.random() * 50) + 40;
    }
}

/*
=====================================================
DEMO EVENT DATA
=====================================================
*/

const demoEvents = [
    {
        name: "Startup Albania Summit",
        venue: "Orange Hall",
        attendees: 180,
        status: "Under Review"
    },
    {
        name: "Design Week Tirana",
        venue: "Blue Hall",
        attendees: 250,
        status: "Approved"
    },
    {
        name: "Tech Founders Meetup",
        venue: "Green Hub",
        attendees: 90,
        status: "Setup"
    }
];

/*
=====================================================
EVENT TABLE RENDERER
=====================================================
*/

function renderEventTable(targetId) {

    const container =
        document.getElementById(targetId);

    if (!container) return;

    const rows = demoEvents
        .map(event => `
            <tr>
                <td>${event.name}</td>
                <td>${event.venue}</td>
                <td>${event.attendees}</td>
                <td>${event.status}</td>
            </tr>
        `)
        .join("");

    container.innerHTML = `
        <div class="table-wrapper">
            <table class="table">
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Venue</th>
                        <th>Attendees</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

/*
=====================================================
GLOBAL SHORTCUTS
=====================================================
*/

window.showToast = showToast;
window.triggerCopilot = triggerCopilot;
window.triggerResolution = triggerResolution;
window.renderEventTable = renderEventTable;
window.randomizeMetrics = randomizeMetrics;

/*
=====================================================
APP INIT
=====================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Pyramid Backstage initialized."
        );

        if (window.lucide) {
            lucide.createIcons();
        }
    }
);
