const pageContainer = document.getElementById("page-container");

/*
=====================================================
PAGE LOADER
=====================================================
*/
// in router.js or app.js
var tours = { red: 'assets/red-flythrough.mp4' };
function openTour(id) {
    if (!tours[id]) return;
    var v = document.getElementById('tour-video');
    v.src = tours[id];
    document.getElementById('tour-modal').classList.remove('hidden');
    v.play();
}
function closeTour(e) {
    if (e.target.id !== 'tour-modal' && e.target.closest('button') === null) return;
    var v = document.getElementById('tour-video');
    v.pause(); v.src = '';
    document.getElementById('tour-modal').classList.add('hidden');
}
window.openTour = openTour;
window.closeTour = closeTour;

var pagePaths = {
    organizer: 'organizer/organizer',
    'create-event': 'organizer/create-event',
    documents: 'organizer/documents',
    'events-archive': 'organizer/events-archive',
    'track-tickets': 'organizer/track-tickets',
    inventory: 'inventory/dashboard',
    'inventory-assets': 'inventory/assets',
    coordinator: 'coordinator/dashboard',
    'coordinator-workspace': 'coordinator/workspace',
    'coordinator-calendar': 'coordinator/calendar',
    'coordinator-previous': 'coordinator/previous-events',
    admin: 'admin/admin',
    'admin-staff': 'admin/staff',
    'admin-organizers': 'admin/organizers',
    'admin-pricing': 'admin/pricing',
    'admin-assign': 'admin/assign-events',
    'admin-reports': 'admin/reports',
    'admin-tickets': 'admin/admin-tickets'
};

async function loadPage(pageName, clickedButton = null) {

    try {

        const pageUrl = `./pages/${pagePaths[pageName] || pageName}.html`;
        console.debug("Loading page:", pageUrl);

        const response = await fetch(pageUrl);

        if (!response.ok) {
            throw new Error(`Could not load ${pageName}.html`);
        }

        const html = await response.text();

        pageContainer.innerHTML = html;

        updateNavigation(clickedButton, pageName);

        initializePage(pageName);

        if (window.lucide) {
            lucide.createIcons();
        }

    } catch (error) {

        console.error(error);

        pageContainer.innerHTML = `
            <div class="card text-center fade-in">
                <h2 class="text-xl font-bold text-red-400 mb-3">
                    Failed to load page
                </h2>

                <p class="text-slate-400">
                    ${pageName}.html could not be found.
                </p>
            </div>
        `;
    }
}

/*
=====================================================
NAVIGATION STATE
=====================================================
*/

function updateNavigation(clickedButton, pageName) {

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active-nav");
    });

    if (clickedButton) {
        clickedButton.classList.add("active-nav");
        return;
    }

    // dropdown items (organizer/admin/inventory submenu pages) -> highlight parent button
    var parentKey = pageName && pageName.indexOf('admin') === 0 ? 'admin'
        : (pageName === 'create-event' || pageName === 'documents' || pageName === 'events-archive' || pageName === 'track-tickets') ? 'organizer'
            : (pageName === 'inventory-assets') ? 'inventory'
                : (pageName && pageName.indexOf('coordinator-') === 0) ? 'coordinator'
                    : pageName;

    var btn = document.querySelector(`[data-page="${parentKey}"]`);
    if (btn) btn.classList.add("active-nav");
}

/*
=====================================================
PAGE INITIALIZATION
Runs page-specific code after page load
=====================================================
*/

function initializePage(pageName) {

    switch (pageName) {

        case "organizer":
            initializeOrganizerPage();
            break;

        case "workspace":
            initializeWorkspacePage();
            break;

        case "coordinator":
            initializeCoordinatorPage();
            break;

        case "coordinator-workspace":
            initializeCoordinatorPage();
            break;

        case "coordinator-calendar":
            initializeCoordinatorCalendarPage();
            break;

        case "inventory":
            initializeInventoryPage();
            break;

        case "inventory-assets":
            initializeAssetsRegistryPage();
            break;

        case "admin":
            initializeAdminPage();
            break;

        case "calendar":
            initializeCalendarPage();
            break;

        case "track-tickets":
            initializeTrackTicketsPage();
            break;

        case "admin-tickets":
            initializeAdminTicketsPage();
            break;

        case "create-event": initializeCreateEventPage(); break;
        case "documents": initializeDocumentsPage(); break;
        case "events-archive": initializeEventsArchivePage(); break;

        default:
            break;
    }
}

/*
=====================================================
ORGANIZER PAGE
=====================================================
*/

function initializeOrganizerPage() {
    setStage(2);
}

function initializeCreateEventPage() {
    const form = document.getElementById("event-request-form");
    if (!form) return;

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const events = JSON.parse(localStorage.getItem('pyramid-events') || '[]');
        events.push({
            title: document.getElementById('req-title')?.value,
            org: document.getElementById('req-org')?.value,
            email: document.getElementById('req-email')?.value,
            venue: document.getElementById('req-venue')?.value,
            size: document.getElementById('req-size')?.value,
            date: document.querySelector('input[type=date]')?.value,
            chairs: document.querySelectorAll('input[type=number]')[1]?.value || 0,
            tables: document.querySelectorAll('input[type=number]')[2]?.value || 0,
            mics: document.querySelectorAll('input[type=number]')[3]?.value || 0,
            screens: document.querySelectorAll('input[type=number]')[4]?.value || 0,
            projectors: document.querySelectorAll('input[type=number]')[5]?.value || 0,
            stage: document.querySelectorAll('input[type=number]')[6]?.value || 0,
            catering: document.getElementById('req-catering')?.checked,
            status: 'Under Review'
        });
        localStorage.setItem('pyramid-events', JSON.stringify(events));
        triggerCopilot(e);
    });
}

function initializeEventsArchivePage() {
    renderArchive();
}

var RATES = { venue: 800, chair: 2, table: 15, mic: 50, screen: 100, projector: 120, stage: 300, catering: 500 };

function calcBill(e) {
    return [
        { label: 'Venue rental', qty: 1, rate: RATES.venue },
        { label: 'Chairs', qty: +e.chairs, rate: RATES.chair },
        { label: 'Tables', qty: +e.tables, rate: RATES.table },
        { label: 'Microphones', qty: +e.mics, rate: RATES.mic },
        { label: 'Screens', qty: +e.screens, rate: RATES.screen },
        { label: 'Projector', qty: +e.projectors, rate: RATES.projector },
        { label: 'Stage', qty: +e.stage, rate: RATES.stage },
        e.catering ? { label: 'Catering / F&B', qty: 1, rate: RATES.catering } : null
    ].filter(Boolean).filter(l => l.qty > 0);
}

window.openBill = function(idx) {
    var events = JSON.parse(localStorage.getItem('pyramid-events') || '[]');
    var e = events[idx], lines = calcBill(e);
    var total = lines.reduce((s, l) => s + l.qty * l.rate, 0);
    document.getElementById('bill-title').textContent = e.title;
    document.getElementById('bill-date').textContent = (e.date || '—') + ' · ' + (e.venue || '—');
    document.getElementById('bill-lines').innerHTML = lines.map(l =>
        '<div class="flex justify-between text-slate-300"><span>' + l.label + (l.qty > 1 ? ' <span class="text-slate-500">×' + l.qty + '</span>' : '') + '</span><span class="font-mono">$' + (l.qty * l.rate).toLocaleString() + '</span></div>'
    ).join('');
    document.getElementById('bill-total').textContent = '$' + total.toLocaleString();
    document.getElementById('bill-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
};

window.closeBill = function(e) { if (e.target.id === 'bill-modal') document.getElementById('bill-modal').classList.add('hidden'); };

function venueColor(v) {
    if (!v) return 'bg-slate-500';
    v = v.toLowerCase();
    if (v.includes('blue')) return 'bg-cyan-500';
    if (v.includes('orange')) return 'bg-orange-500';
    if (v.includes('green')) return 'bg-emerald-500';
    if (v.includes('yellow')) return 'bg-yellow-500';
    return 'bg-indigo-500';
}

function renderArchive() {
    var events = JSON.parse(localStorage.getItem('pyramid-events') || '[]');
    var list = document.getElementById('archive-list');
    var empty = document.getElementById('archive-empty');
    if (!list) return;
    if (!events.length) { if (empty) empty.classList.remove('hidden'); return; }
    if (empty) empty.classList.add('hidden');
    list.innerHTML = events.map(function(e, i) {
        var lines = calcBill(e);
        var total = lines.reduce((s, l) => s + l.qty * l.rate, 0);
        var statusMap = { 'Approved': 'badge-success', 'Under Review': 'badge-warning', 'Completed': 'badge-info', 'Rejected': 'badge-danger' };
        return '<div class="p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-cyan-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-3">' +
            '<div class="flex items-center gap-3"><div class="w-2 h-10 rounded-full ' + venueColor(e.venue) + '"></div>' +
            '<div><div class="font-semibold">' + (e.title || 'Untitled') + '</div>' +
            '<div class="text-slate-500 text-xs flex flex-wrap items-center gap-3 mt-1">' +
            '<span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i>' + (e.venue || '—') + '</span>' +
            '<span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i>' + (e.date || '—') + '</span>' +
            '<span class="flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i>' + (e.size || '—') + '</span>' +
            '<span class="flex items-center gap-1"><i data-lucide="building-2" class="w-3 h-3"></i>' + (e.org || '—') + '</span>' +
            '</div></div></div>' +
            '<div class="flex items-center gap-3">' +
            '<span class="font-mono text-sm text-slate-300">$' + total.toLocaleString() + '</span>' +
            '<span class="badge ' + (statusMap[e.status] || 'badge-info') + '">' + (e.status || 'Under Review') + '</span>' +
            '<button onclick="openBill(' + i + ')" class="btn-secondary !py-1 !px-3 text-xs flex items-center gap-1"><i data-lucide="receipt" class="w-3 h-3"></i>Bill</button>' +
            '</div></div>';
    }).join('');
    if (window.lucide) lucide.createIcons();
}

/*
=====================================================
NOTIFICATIONS
=====================================================
*/
function toggleNotifMenu(e) { e.stopPropagation(); document.getElementById('notif-menu').classList.toggle('hidden'); }
function closeNotifMenu() { var m = document.getElementById('notif-menu'); if (m) m.classList.add('hidden'); }
document.addEventListener('click', closeNotifMenu);
window.toggleNotifMenu = toggleNotifMenu; window.closeNotifMenu = closeNotifMenu;

/*
=====================================================
DOCUMENTS & QUOTATIONS PAGE
=====================================================
*/

function initializeDocumentsPage() {
    var events = {
        'EVT-094': {
            name: 'Startup Albania Summit', venue: 'Orange Hall', status: 'Under Review', color: 'bg-orange-500',
            docs: { proposal: true, quote: true, contract: false }
        },
        'EVT-088': {
            name: 'Design Week Tirana', venue: 'Blue Hall', status: 'Approved', color: 'bg-cyan-500',
            docs: { proposal: true, quote: true, contract: true }
        },
        'EVT-071': {
            name: 'Tech Meetup', venue: 'Green Hub', status: 'Completed', color: 'bg-emerald-500',
            docs: { proposal: true, quote: true, contract: true }
        }
    };
    var statusBadge = { 'Under Review': 'badge-warning', 'Approved': 'badge-success', 'Completed': 'badge-info' };
    var docMeta = { proposal: ['file-text', 'Proposal.pdf'], quote: ['receipt', 'Quote.pdf'], contract: ['file-check', 'Contract.pdf'] };
    var wrap = document.getElementById('doc-events');
    function render(q) {
        var ids = Object.keys(events).filter(function (id) {
            return !q || events[id].name.toLowerCase().indexOf(q) > -1 || events[id].venue.toLowerCase().indexOf(q) > -1;
        });
        wrap.innerHTML = ids.length ? ids.map(function (id) {
            var ev = events[id];
            var cards = Object.keys(docMeta).map(function (k) {
                var ready = ev.docs[k], m = docMeta[k];
                return '<div class="p-4 rounded-xl border bg-slate-900' + (ready ? ' border-slate-800 cursor-pointer hover:border-cyan-500/50 hover:-translate-y-0.5 transition' : ' border-slate-800/50 opacity-40') + '"' +
                    (ready ? ' onclick="showDoc(\'' + id + '\',\'' + k + '\')"' : '') + '>' +
                    '<div class="flex items-center gap-2 mb-2"><div class="p-1.5 rounded-lg ' + (ready ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500') + '"><i data-lucide="' + m[0] + '" class="w-4 h-4"></i></div><span class="font-medium text-sm">' + m[1] + '</span></div>' +
                    '<p class="text-xs ' + (ready ? 'text-emerald-400' : 'text-slate-500') + '">' + (ready ? 'Ready to download' : 'Awaiting approval') + '</p></div>';
            }).join('');
            return '<div class="card overflow-hidden">' +
                '<div class="flex items-center gap-3 mb-4"><div class="w-2 h-10 rounded-full ' + ev.color + '"></div>' +
                '<div class="flex-1"><h3 class="font-bold">' + ev.name + '</h3><p class="text-slate-500 text-xs">' + ev.venue + '</p></div>' +
                '<span class="badge ' + statusBadge[ev.status] + '">' + ev.status + '</span></div>' +
                '<div class="grid md:grid-cols-3 gap-3">' + cards + '</div></div>';
        }).join('') : '<div class="card text-center text-slate-500 text-sm py-8">No events match your search.</div>';
        if (window.lucide) lucide.createIcons();
    }
    window.docFilter = function (v) { render(v.toLowerCase()); };
    render('');

    var docData = {
        proposal: {
            title: "Event Proposal", body:
                "<p><b>Equipment:</b> see event details</p>" +
                '<p class="text-amber-600 mt-2"><b>⚠ Conflict:</b> Projector #3 overlaps another booking — pending resolution</p>'
        },
        quote: {
            title: "Quotation", body:
                '<table class="w-full text-sm mt-2"><tr class="border-b"><td class="py-1">Venue (9 hrs)</td><td class="text-right">$1,350</td></tr>' +
                '<tr class="border-b"><td class="py-1">Equipment package</td><td class="text-right">$650</td></tr>' +
                '<tr class="font-bold"><td class="py-2">Total</td><td class="text-right">$2,450</td></tr></table>'
        },
        contract: {
            title: "Service Contract", body:
                "<p>This agreement confirms the booking, equipment, and terms per Pyramid Backstage policy.</p>" +
                '<div class="mt-6 flex justify-between text-sm"><span>Organizer signature: ___________</span><span>Pyramid rep: ___________</span></div>'
        }
    };
    window.showDoc = function (eventId, type) {
        var ev = events[eventId], d = docData[type];
        document.getElementById("doc-content").innerHTML =
            '<button onclick="closeDoc()" class="absolute top-3 right-3 text-slate-400 hover:text-slate-900">✕</button>' +
            '<h2 class="text-xl font-bold">' + d.title + '</h2><p class="text-xs text-slate-500 mb-4">' + eventId + ' — ' + ev.name + '</p>' + d.body +
            '<button onclick="window.print()" class="btn-primary mt-6 !text-slate-900" style="background:#06b6d4">Download as PDF</button>';
        document.getElementById("doc-modal").classList.remove("hidden");
    };
    window.closeDoc = function () {
        document.getElementById("doc-modal").classList.add("hidden");
    };
}

/*
=====================================================
TRACK TICKETS PAGE
=====================================================
*/

function initializeTrackTicketsPage() {
    var tickets = {
        'TKT-1042': {
            event: 'Startup Albania Summit', status: 'Open', statusColor: 'badge-warning',
            ai: 'AI matched Orange Hall (cap. 180) for 200 expected attendees.',
            thread: [{ from: 'You', text: "This doesn't fit — we now expect 200+ people. Can we look at Blue Hall instead?" }]
        },
        'TKT-1038': {
            event: 'Design Week Tirana', status: 'Awaiting Admin', statusColor: 'badge-info',
            ai: 'AI flagged a projector conflict and suggested swapping to a backup unit.',
            thread: [{ from: 'You', text: 'Backup unit is fine, but can we get it confirmed in writing first?' },
            { from: 'Admin', text: 'Confirmed — backup Projector #5 reserved. Updating your proposal now.' }]
        },
        'TKT-1021': {
            event: 'Tech Meetup', status: 'Resolved', statusColor: 'badge-success',
            ai: 'AI suggested Green Hub over Yellow Studio due to AV requirements.',
            thread: [{ from: 'You', text: 'Agreed, Green Hub works better.' },
            { from: 'Admin', text: 'Locking in Green Hub. Updated quote sent.' }]
        }
    };
    var list = document.getElementById('ticket-list');
    list.innerHTML = Object.keys(tickets).map(function (id) {
        var t = tickets[id];
        return '<div class="ticket-row p-3 rounded-xl border border-slate-800 bg-slate-900 cursor-pointer hover:border-cyan-500/40" onclick="selectTicket(\'' + id + '\')" data-id="' + id + '">' +
            '<div class="flex justify-between items-center"><span class="font-mono text-xs text-slate-500">' + id + '</span><span class="badge ' + t.statusColor + '">' + t.status + '</span></div>' +
            '<div class="text-sm font-medium mt-1">' + t.event + '</div></div>';
    }).join('');
    window.selectTicket = function (id) {
        var t = tickets[id];
        document.querySelectorAll('.ticket-row').forEach(function (r) { r.style.borderColor = r.dataset.id === id ? 'rgb(6 182 212)' : ''; });
        document.getElementById('ticket-detail').innerHTML =
            '<div class="flex justify-between items-center mb-3"><h3 class="card-title mb-0">' + t.event + '</h3><span class="badge ' + t.statusColor + '">' + t.status + '</span></div>' +
            '<p class="font-mono text-xs text-slate-500 mb-4">' + id + '</p>' +
            '<div class="p-3 rounded-xl bg-cyan-500/10 text-cyan-300 text-sm mb-4"><b>AI Copilot:</b> ' + t.ai + '</div>' +
            '<div class="space-y-3 mb-4">' + t.thread.map(function (m) {
                return '<div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm"><b class="' + (m.from === 'Admin' ? 'text-emerald-400' : 'text-slate-300') + '">' + m.from + ':</b> ' + m.text + '</div>';
            }).join('') + '</div>' +
            '<div class="flex gap-2"><input class="input-field" placeholder="Reply to admin..."><button class="btn-primary">Send</button></div>';
    };
    selectTicket(Object.keys(tickets)[0]);
}
function toggleOrgMenu(e) { e.stopPropagation(); document.getElementById('org-menu').classList.toggle('hidden'); }
function closeOrgMenu() { var m = document.getElementById('org-menu'); if (m) m.classList.add('hidden'); }
document.addEventListener('click', closeOrgMenu);
window.toggleOrgMenu = toggleOrgMenu; window.closeOrgMenu = closeOrgMenu;

/*
=====================================================
COORDINATOR PAGE
=====================================================
*/

function initializeCoordinatorPage() {

    const resolveButton =
        document.getElementById("resolve-conflict-btn");

    if (!resolveButton) return;

    resolveButton.addEventListener(
        "click",
        triggerResolution
    );
}

function initializeCoordinatorCalendarPage() {
    if (window.setStage) setStage(2);
}

function toggleCoordMenu(e) { e.stopPropagation(); document.getElementById('coord-menu').classList.toggle('hidden'); }
function closeCoordMenu() { var m = document.getElementById('coord-menu'); if (m) m.classList.add('hidden'); }
document.addEventListener('click', closeCoordMenu);
window.toggleCoordMenu = toggleCoordMenu; window.closeCoordMenu = closeCoordMenu;

/*
=====================================================
INVENTORY PAGES
=====================================================
*/

function initializeInventoryPage() {
    console.log("Inventory dashboard initialized.");
}

function initializeAssetsRegistryPage() {
    var assets = [
        { name: 'Ergonomic Chairs', location: 'Warehouse B', condition: 'Good', available: '420 / 600', status: 'ok' },
        { name: 'Banquet Tables', location: 'Warehouse A', condition: 'Good', available: '108 / 120', status: 'ok' },
        { name: 'Wireless Mic Set', location: 'AV Storage', condition: 'Good', available: '14 / 20', status: 'ok' },
        { name: 'Projector Array #3', location: 'Orange Hall', condition: 'Fair', available: '0 / 1', status: 'conflict' },
        { name: 'PA Speaker Set', location: 'AV Storage', condition: 'Good', available: '6 / 8', status: 'ok' }
    ];
    var statusMap = { ok: '<span class="badge badge-success">Available</span>', conflict: '<span class="badge badge-warning">Conflict Detected</span>' };
    var rows = document.getElementById('asset-rows');
    function render(q) {
        var list = assets.filter(function (a) { return !q || a.name.toLowerCase().indexOf(q) > -1; });
        rows.innerHTML = list.length ? list.map(function (a) {
            return '<tr><td>' + a.name + '</td><td>' + a.location + '</td><td>' + a.condition + '</td><td class="font-mono">' + a.available + '</td><td>' + statusMap[a.status] + '</td></tr>';
        }).join('') : '<tr><td colspan="5" class="text-center text-slate-500 py-6">No assets match your search.</td></tr>';
    }
    window.assetFilter = function (v) { render(v.toLowerCase()); };
    render('');
}

/*
=====================================================
ADMIN PAGE
=====================================================
*/

function initializeAdminPage() {
    var ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['W1', 'W2', 'W3', 'W4'],
            datasets: [{
                data: [7200, 8800, 9100, 9790],
                borderColor: '#22d3ee',
                backgroundColor: 'rgba(34,211,238,0.1)',
                fill: true, tension: 0.35, pointRadius: 0
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

/*
=====================================================
ADMIN TICKETS PAGE
=====================================================
*/

function initializeAdminTicketsPage() {
    var tickets = {
        'TKT-1042': {
            event: 'Startup Albania Summit', status: 'Open', statusColor: 'badge-warning',
            request: { org: 'Enterprise Tech Group', headcount: 200, venuePref: 'No preference', date: 'Jul 12, 2026' },
            ai: 'AI matched Orange Hall (cap. 180) — closest fit by capacity and AV needs.',
            thread: [{ from: 'Organizer', text: "This doesn't fit — we now expect 200+ people. Can we look at Blue Hall instead?" }]
        },
        'TKT-1038': {
            event: 'Design Week Tirana', status: 'Awaiting Reply', statusColor: 'badge-info',
            request: { org: 'Design Hub Tirana', headcount: 250, venuePref: 'Blue Hall', date: 'Jun 28, 2026' },
            ai: 'AI flagged a projector conflict and suggested swapping to backup Projector #5.',
            thread: [{ from: 'Organizer', text: 'Backup unit is fine, but can we get it confirmed in writing first?' }]
        },
        'TKT-1021': {
            event: 'Tech Meetup', status: 'Resolved', statusColor: 'badge-success',
            request: { org: 'Startup Grind AL', headcount: 120, venuePref: 'Yellow Studio', date: 'Jun 5, 2026' },
            ai: 'AI suggested Green Hub over Yellow Studio due to AV requirements.',
            thread: [{ from: 'Organizer', text: 'Agreed, Green Hub works better.' },
            { from: 'Admin', text: 'Locking in Green Hub. Updated quote sent.' }]
        }
    };
    var list = document.getElementById('atk-list');
    list.innerHTML = Object.keys(tickets).map(function (id) {
        var t = tickets[id];
        return '<div class="atk-row p-3 rounded-xl border border-slate-800 bg-slate-900 cursor-pointer hover:border-cyan-500/40" onclick="selectAtk(\'' + id + '\')" data-id="' + id + '">' +
            '<div class="flex justify-between items-center"><span class="font-mono text-xs text-slate-500">' + id + '</span><span class="badge ' + t.statusColor + '">' + t.status + '</span></div>' +
            '<div class="text-sm font-medium mt-1">' + t.event + '</div></div>';
    }).join('');
    window.selectAtk = function (id) {
        var t = tickets[id];
        document.querySelectorAll('.atk-row').forEach(function (r) { r.style.borderColor = r.dataset.id === id ? 'rgb(6 182 212)' : ''; });
        document.getElementById('atk-detail').innerHTML =
            '<div class="flex justify-between items-center mb-3"><h3 class="card-title mb-0">' + t.event + '</h3><span class="badge ' + t.statusColor + '">' + t.status + '</span></div>' +
            '<p class="font-mono text-xs text-slate-500 mb-4">' + id + '</p>' +
            '<div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm mb-3"><b>Original Request:</b> ' + t.request.org + ' · ' + t.request.headcount + ' attendees · venue pref: ' + t.request.venuePref + ' · ' + t.request.date + '</div>' +
            '<div class="p-3 rounded-xl bg-cyan-500/10 text-cyan-300 text-sm mb-4"><b>AI Copilot recommended:</b> ' + t.ai + '</div>' +
            '<div class="space-y-3 mb-4">' + t.thread.map(function (m) {
                return '<div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm"><b class="' + (m.from === 'Admin' ? 'text-emerald-400' : 'text-slate-300') + '">' + m.from + ':</b> ' + m.text + '</div>';
            }).join('') + '</div>' +
            '<div class="flex gap-2"><input class="input-field" placeholder="Reply to organizer..."><button class="btn-primary">Send</button></div>';
    };
    selectAtk(Object.keys(tickets)[0]);
}
function toggleAdminMenu(e) { e.stopPropagation(); document.getElementById('admin-menu').classList.toggle('hidden'); }
function closeAdminMenu() { var m = document.getElementById('admin-menu'); if (m) m.classList.add('hidden'); }
document.addEventListener('click', closeAdminMenu);
window.toggleAdminMenu = toggleAdminMenu; window.closeAdminMenu = closeAdminMenu;

function toggleInvMenu(e) { e.stopPropagation(); document.getElementById('inv-menu').classList.toggle('hidden'); }
function closeInvMenu() { var m = document.getElementById('inv-menu'); if (m) m.classList.add('hidden'); }
document.addEventListener('click', closeInvMenu);
window.toggleInvMenu = toggleInvMenu; window.closeInvMenu = closeInvMenu;

/*
=====================================================
CALENDAR PAGE
=====================================================
*/

function initializeCalendarPage() {
    var events = [
        { d: 0, t: '09:00', n: 'Team Sync', v: 'Blue Hall' },
        { d: 0, t: '14:00', n: 'Vendor Walkthrough', v: 'Green Hub' },
        { d: 1, t: '10:00', n: 'Hackathon Briefing', v: 'Yellow Studio' },
        { d: 2, t: '09:00', n: 'Startup Albania Summit', v: 'Orange Hall', span: 2 },
        { d: 4, t: '14:00', n: 'Press Setup', v: 'Green Hub' },
        { d: 4, t: '18:00', n: 'Photography Exhibition', v: 'Green Hub' },
        { d: 5, t: '16:00', n: 'Private Wedding Reception', v: 'Blue Hall' },
        { d: 1, t: '10:00', n: 'Vendor Tasting', v: 'Blue Hall' }
    ];
    var wk = 0, q = '', base = new Date(2026, 3, 6), names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    function fmt(d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    function render() {
        var mon = new Date(base); mon.setDate(base.getDate() + wk * 7);
        var sun = new Date(mon); sun.setDate(mon.getDate() + 6);
        document.getElementById('cal-range').textContent = fmt(mon) + ' – ' + fmt(sun);
        var hdr = document.getElementById('cal-hdr'); hdr.innerHTML = '';
        for (var i = 0; i < 7; i++) {
            var dt = new Date(mon); dt.setDate(mon.getDate() + i);
            var today = dt.toDateString() === new Date().toDateString();
            hdr.innerHTML += '<span' + (today ? ' class="t"' : '') + '>' + names[i] + '<b>' + dt.getDate() + '</b></span>';
        }
        var byDay = [[], [], [], [], [], [], []];
        if (wk === 0) {
            events.forEach(function (e) {
                if (q && e.n.toLowerCase().indexOf(q) === -1) return;
                var n = e.span || 1;
                for (var k = 0; k < n; k++) byDay[e.d + k].push({ t: e.t, n: e.n, v: e.v, multi: n > 1 });
            });
        }
        var grid = document.getElementById('cg'); grid.innerHTML = '';
        for (var i = 0; i < 7; i++) {
            byDay[i].sort(function (a, b) { return a.t === b.t ? a.v.localeCompare(b.v) : a.t.localeCompare(b.t) });
            var html = byDay[i].map(function (e, idx, arr) {
                var clash = idx > 0 && arr[idx - 1].t === e.t;
                return '<div class="cal-ev' + (e.multi ? ' cal-multi' : '') + (clash ? ' cal-clash' : '') + '"><div class="cal-et">' + e.t + (clash ? ' <span class="cal-tag">·also</span>' : '') + '</div><div class="cal-en">' + e.n + '</div><div class="cal-et">' + e.v + '</div></div>';
            }).join('');
            grid.innerHTML += '<div class="cal-day">' + (html || '<div class="cal-empty">No events</div>') + '</div>';
        }
    }
    window.calNav = function (n) { wk += n; render() };
    window.calFilter = function (v) { q = v.toLowerCase(); render() };
    render();
}

/*
=====================================================
HELPERS
=====================================================
*/

function navigateTo(pageName) {

    const targetButton =
        document.querySelector(
            `[data-page="${pageName}"]`
        );

    loadPage(pageName, targetButton);
}

window.setStage = function (n) {
    document.querySelectorAll("#lifecycle-steps .timeline-step").forEach(function (el) {
        var i = +el.dataset.idx;
        el.classList.toggle("completed", i < n);
        el.classList.toggle("active", i === n);
    });
    document.querySelectorAll("#doc-cards > div").forEach(function (card) {
        var need = +card.dataset.unlock, unlocked = n >= need;
        card.style.opacity = unlocked ? 1 : .4;
        card.style.pointerEvents = unlocked ? "auto" : "none";
        var s = card.querySelector(".doc-status");
        if (s) s.textContent = unlocked ? "Ready to download" : "Locked — unlocks at stage " + need;
    });
};

/*
=====================================================
EXPOSE GLOBALLY
=====================================================
*/

window.loadPage = loadPage;
window.navigateTo = navigateTo;