// JavaScript untuk Verdant Admin Dashboard

document.addEventListener('DOMContentLoaded', function () {
    
    // Inisialisasi variabel orders dan chart
    let orders = [];
    let myChart = null;
    let currentFilter = 'all';

    // Load data awal dari localStorage
    function loadOrders() {
        const storedOrders = localStorage.getItem('verdant_orders');
        if (storedOrders) {
            try {
                orders = JSON.parse(storedOrders);
            } catch (e) {
                orders = [];
            }
        } else {
            orders = [];
        }
    }

    // Simpan data orders ke localStorage
    function saveOrders() {
        localStorage.setItem('verdant_orders', JSON.stringify(orders));
    }

    // Format mata uang Rupiah
    function formatRupiah(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Update Kartu Metrik Statistik
    function updateMetrics() {
        const total = orders.length;
        const pending = orders.filter(o => o.status === 'Pending').length;
        const delivered = orders.filter(o => o.status === 'Delivered').length;
        const estRevenue = total * 1487500; // Harga pre-order promo

        const totalEl = document.getElementById('statTotalOrders');
        const pendingEl = document.getElementById('statPendingOrders');
        const deliveredEl = document.getElementById('statDeliveredOrders');
        const revEl = document.getElementById('statEstRevenue');

        if (totalEl) totalEl.textContent = total;
        if (pendingEl) pendingEl.textContent = pending;
        if (deliveredEl) deliveredEl.textContent = delivered;
        
        // Format Pendapatan
        if (revEl) {
            if (estRevenue >= 1000000000) {
                revEl.textContent = (estRevenue / 1000000000).toFixed(1) + ' Miliar';
            } else if (estRevenue >= 1000000) {
                revEl.textContent = (estRevenue / 1000000).toFixed(1) + ' Juta';
            } else {
                revEl.textContent = formatRupiah(estRevenue);
            }
        }

        // Notification badge count (number of pending items)
        const notificationBadge = document.getElementById('notificationBadge');
        if (notificationBadge) {
            if (pending > 0) {
                notificationBadge.style.display = 'block';
                notificationBadge.textContent = pending;
            } else {
                notificationBadge.style.display = 'none';
            }
        }
    }

    // Render Tabel Orders
    function renderTable(dataToRender = null) {
        if (!dataToRender) {
            if (currentFilter === 'all') {
                dataToRender = orders;
            } else {
                dataToRender = orders.filter(o => o.status === currentFilter);
            }
        }

        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (dataToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i> Tidak ada data orderan pada kategori ini.
                    </td>
                </tr>
            `;
            return;
        }

        dataToRender.forEach(order => {
            let badgeClass = 'badge-pending';
            let statusText = 'Pending';
            
            if (order.status === 'Shipped') {
                badgeClass = 'badge-shipped';
                statusText = 'Dikirim';
            } else if (order.status === 'Delivered') {
                badgeClass = 'badge-delivered';
                statusText = 'Selesai';
            }

            const custName = order.name || 'Pelanggan';
            const custEmail = order.email || '-';
            const custPhone = order.whatsapp || '';
            const podColor = order.podColor || 'Sage Emerald';
            const seedsStr = Array.isArray(order.seeds) ? order.seeds.join(', ') : (order.seeds || 'Kemangi, Tomat, Mint');
            const city = order.city || 'Indonesia';
            const date = order.date || '-';

            // Clean phone number for WhatsApp link
            let cleanPhone = custPhone.replace(/[^0-9]/g, '');
            if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);

            const waBtnHtml = cleanPhone ? `
                <a href="https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${custName}! Kami dari tim Verdant ingin mengonfirmasi status pesanan Verdant Pod Anda (${order.id}).`)}" 
                   target="_blank" class="btn btn-sm btn-outline-success rounded-circle" title="Chat WhatsApp">
                    <i class="bi bi-whatsapp"></i>
                </a>
            ` : '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold text-dark-green">${order.id}</td>
                <td>
                    <div class="fw-semibold text-dark-green">${custName}</div>
                    <div class="text-muted small">${custEmail}</div>
                    ${custPhone ? `<small class="text-success"><i class="bi bi-whatsapp me-1"></i>${custPhone}</small>` : ''}
                </td>
                <td>
                    <span class="badge bg-light text-dark border mb-1">${podColor}</span>
                    <div class="text-muted small text-truncate" style="max-width: 220px;" title="${seedsStr}">
                        <i class="bi bi-flower2 text-emerald me-1"></i>${seedsStr}
                    </div>
                </td>
                <td class="text-muted small">${city}</td>
                <td class="text-muted small">${date}</td>
                <td><span class="badge badge-pill ${badgeClass}">${statusText}</span></td>
                <td>
                    <div class="d-flex justify-content-center gap-1">
                        <button class="btn btn-sm btn-outline-primary rounded-circle action-next" data-id="${order.id}" title="Ubah Status (Siklus)">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                        ${waBtnHtml}
                        <button class="btn btn-sm btn-outline-danger rounded-circle action-delete" data-id="${order.id}" title="Hapus Orderan">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Hubungkan Event Listener pada tombol aksi table
        document.querySelectorAll('.action-next').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                cycleStatus(id);
            });
        });

        document.querySelectorAll('.action-delete').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                deleteOrder(id);
            });
        });
    }

    // Aksi Mengubah Status Siklus: Pending -> Shipped -> Delivered -> Pending
    function cycleStatus(id) {
        orders = orders.map(order => {
            if (order.id === id) {
                let nextStatus = 'Pending';
                if (order.status === 'Pending') nextStatus = 'Shipped';
                else if (order.status === 'Shipped') nextStatus = 'Delivered';
                return { ...order, status: nextStatus };
            }
            return order;
        });
        saveOrders();
        updateMetrics();
        renderTable();
        updateChart();
    }

    // Aksi Menghapus Orderan
    function deleteOrder(id) {
        if (confirm(`Apakah Anda yakin ingin menghapus orderan ${id}?`)) {
            orders = orders.filter(order => order.id !== id);
            saveOrders();
            updateMetrics();
            renderTable();
            updateChart();
        }
    }

    // Filter Buttons Listener
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => {
                b.classList.remove('active', 'btn-emerald');
                b.classList.add('btn-outline-secondary');
            });
            this.classList.add('active', 'btn-emerald');
            this.classList.remove('btn-outline-secondary');

            currentFilter = this.dataset.filter;
            renderTable();
        });
    });

    // Update & Render Chart.js
    function updateChart() {
        const dateCounts = {};
        
        orders.forEach(order => {
            const dateStr = (order.date || 'Hari Ini').split(',')[0].trim();
            dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        });

        const sortedDates = Object.keys(dateCounts).sort((a, b) => new Date(a) - new Date(b));
        const counts = sortedDates.map(d => dateCounts[d]);

        const labels = sortedDates.length > 0 ? sortedDates : ['Hari Ini'];
        const dataValues = counts.length > 0 ? counts : [0];

        const chartCanvas = document.getElementById('ordersChart');
        if (!chartCanvas) return;
        const ctx = chartCanvas.getContext('2d');
        
        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pre-order Verdant Pod',
                    data: dataValues,
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#198754',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#0a3622',
                        titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' },
                        bodyFont: { family: "'Plus Jakarta Sans', sans-serif" },
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            font: { family: "'Plus Jakarta Sans', sans-serif" }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: { family: "'Plus Jakarta Sans', sans-serif" }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Handler Tambah Order Manual
    const addOrderForm = document.getElementById('addManualOrderForm');
    if (addOrderForm) {
        addOrderForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = document.getElementById('manualEmail');
            const statusSelect = document.getElementById('manualStatus');

            const newOrder = {
                id: 'VRD-' + Math.floor(1000 + Math.random() * 9000),
                name: 'Pesanan Manual',
                email: emailInput.value,
                whatsapp: '081234567890',
                city: 'Jakarta',
                podColor: 'Sage Emerald',
                seeds: ['Kemangi Italia', 'Tomat Ceri', 'Peppermint'],
                date: new Date().toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                status: statusSelect.value
            };

            orders.unshift(newOrder);
            saveOrders();
            updateMetrics();
            renderTable();
            updateChart();

            emailInput.value = '';
            statusSelect.value = 'Pending';

            alert(`Sukses menambahkan order manual ${newOrder.id} (${newOrder.email})!`);
        });
    }

    // Handler Pencarian
    const searchInput = document.getElementById('searchOrderInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase().trim();
            const filtered = orders.filter(order => {
                const name = (order.name || '').toLowerCase();
                const email = (order.email || '').toLowerCase();
                const city = (order.city || '').toLowerCase();
                const id = (order.id || '').toLowerCase();
                return name.includes(query) || email.includes(query) || city.includes(query) || id.includes(query);
            });
            renderTable(filtered);
        });
    }

    // Tombol Kosongkan Semua Data
    const clearBtn = document.getElementById('clearAllOrdersBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (confirm('Apakah Anda yakin ingin menghapus semua data orderan?')) {
                orders = [];
                saveOrders();
                updateMetrics();
                renderTable();
                updateChart();
            }
        });
    }

    // Tombol Isi Dummy Data
    const dummyBtn = document.getElementById('generateDummyDataBtn');
    if (dummyBtn) {
        dummyBtn.addEventListener('click', function () {
            const dummyOrders = [
                {
                    id: 'VRD-2345',
                    name: 'Budi Santoso',
                    email: 'budi.santoso@gmail.com',
                    whatsapp: '081234567890',
                    city: 'Bandung',
                    podColor: 'Sage Emerald',
                    seeds: ['Kemangi Italia', 'Tomat Ceri Manis', 'Peppermint Dingin'],
                    date: '15 Jun 2026, 09:20',
                    status: 'Delivered'
                },
                {
                    id: 'VRD-8761',
                    name: 'Anisa Lestari',
                    email: 'anisa.lestari@yahoo.com',
                    whatsapp: '081987654321',
                    city: 'Jakarta Selatan',
                    podColor: 'Arctic White',
                    seeds: ['Selada Romaine', 'Tomat Ceri', 'Daun Bawang'],
                    date: '16 Jun 2026, 14:15',
                    status: 'Delivered'
                },
                {
                    id: 'VRD-5432',
                    name: 'Rizky Hidayat',
                    email: 'rizky.hidayat@outlook.com',
                    whatsapp: '085712349999',
                    city: 'Surabaya',
                    podColor: 'Midnight Obsidian',
                    seeds: ['Rosemary Mediterania', 'Kemangi Italia', 'Cabai Rawit Hias'],
                    date: '17 Jun 2026, 10:45',
                    status: 'Shipped'
                },
                {
                    id: 'VRD-1908',
                    name: 'Citra Permata',
                    email: 'citra.permata@gmail.com',
                    whatsapp: '082133445566',
                    city: 'Yogyakarta',
                    podColor: 'Scandinavian Bamboo',
                    seeds: ['Lavender Relaksasi', 'Peppermint Dingin', 'Kemangi Italia'],
                    date: '18 Jun 2026, 11:30',
                    status: 'Pending'
                },
                {
                    id: 'VRD-7612',
                    name: 'Hendra Wijaya',
                    email: 'hendra.wijaya@gmail.com',
                    whatsapp: '081399887766',
                    city: 'Denpasar, Bali',
                    podColor: 'Sage Emerald',
                    seeds: ['Tomat Ceri Manis', 'Cabai Rawit Hias', 'Daun Bawang'],
                    date: '19 Jun 2026, 08:12',
                    status: 'Pending'
                },
                {
                    id: 'VRD-3049',
                    name: 'Melissa Putri',
                    email: 'melissa.putri@hotmail.com',
                    whatsapp: '087811223344',
                    city: 'Semarang',
                    podColor: 'Arctic White',
                    seeds: ['Kemangi Italia', 'Selada Romaine', 'Peppermint Dingin'],
                    date: '19 Jun 2026, 13:05',
                    status: 'Pending'
                }
            ];

            orders = [...dummyOrders, ...orders];
            const uniqueOrders = [];
            const seenIds = new Set();
            orders.forEach(o => {
                if (!seenIds.has(o.id)) {
                    seenIds.add(o.id);
                    uniqueOrders.push(o);
                }
            });
            orders = uniqueOrders;

            saveOrders();
            updateMetrics();
            renderTable();
            updateChart();
            alert('Dummy data pre-order lengkap berhasil dimuat untuk demo visual!');
        });
    }

    // Inisialisasi awal saat halaman admin dibuka
    loadOrders();
    updateMetrics();
    renderTable();
    updateChart();
});
