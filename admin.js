// JavaScript untuk Verdant Admin Dashboard

document.addEventListener('DOMContentLoaded', function () {
    
    // Inisialisasi variabel orders dan chart
    let orders = [];
    let myChart = null;

    // Load data awal dari localStorage
    function loadOrders() {
        const storedOrders = localStorage.getItem('verdant_orders');
        if (storedOrders) {
            orders = JSON.parse(storedOrders);
        } else {
            // Jika kosong, inisialisasi dengan array kosong
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
        const estRevenue = total * 1500000; // Asumsi Rp 1.500.000 per unit

        document.getElementById('statTotalOrders').textContent = total;
        document.getElementById('statPendingOrders').textContent = pending;
        document.getElementById('statDeliveredOrders').textContent = delivered;
        
        // Format Pendapatan
        if (estRevenue >= 1000000000) {
            document.getElementById('statEstRevenue').textContent = (estRevenue / 1000000000).toFixed(1) + ' Miliar';
        } else if (estRevenue >= 1000000) {
            document.getElementById('statEstRevenue').textContent = (estRevenue / 1000000).toFixed(1) + ' Juta';
        } else {
            document.getElementById('statEstRevenue').textContent = formatRupiah(estRevenue);
        }

        // Notification badge count (number of pending items)
        const notificationBadge = document.getElementById('notificationBadge');
        if (pending > 0) {
            notificationBadge.style.display = 'block';
            notificationBadge.textContent = pending;
        } else {
            notificationBadge.style.display = 'none';
        }
    }

    // Render Tabel Orders
    function renderTable(dataToRender = orders) {
        const tbody = document.getElementById('ordersTableBody');
        tbody.innerHTML = '';

        if (dataToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i> Belum ada data pre-order masuk.
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

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold text-dark-green">${order.id}</td>
                <td>${order.email}</td>
                <td class="text-muted small">${order.date}</td>
                <td><span class="badge badge-pill ${badgeClass}">${statusText}</span></td>
                <td>
                    <div class="d-flex justify-content-center gap-1">
                        <button class="btn btn-sm btn-outline-success rounded-circle action-next" data-id="${order.id}" title="Ubah Status (Siklus)">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
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

    // Update & Render Chart.js
    function updateChart() {
        // Kelompokkan jumlah order berdasarkan tanggal
        const dateCounts = {};
        
        // Kita ambil 7 hari terakhir secara default atau tanggal yang ada di orders
        orders.forEach(order => {
            // Ambil bagian tanggal saja, abaikan jam
            const dateStr = order.date.split(',')[0].trim();
            dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        });

        // Urutkan tanggal
        const sortedDates = Object.keys(dateCounts).sort((a, b) => new Date(a) - new Date(b));
        const counts = sortedDates.map(d => dateCounts[d]);

        // Fallback jika tidak ada data
        const labels = sortedDates.length > 0 ? sortedDates : ['Hari Ini'];
        const dataValues = counts.length > 0 ? counts : [0];

        const ctx = document.getElementById('ordersChart').getContext('2d');
        
        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Registrasi Pre-order',
                    data: dataValues,
                    borderColor: '#198754', // Emerald Green
                    backgroundColor: 'rgba(25, 135, 84, 0.05)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 3,
                    pointBackgroundColor: '#0a3622',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        grid: {
                            borderDash: [5, 5]
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Handler Form Pre-order Manual
    const manualForm = document.getElementById('addManualOrderForm');
    if (manualForm) {
        manualForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = document.getElementById('manualEmail');
            const statusSelect = document.getElementById('manualStatus');

            const newOrder = {
                id: 'VRD-' + Math.floor(1000 + Math.random() * 9000),
                email: emailInput.value,
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

            // Reset Form
            emailInput.value = '';
            statusSelect.value = 'Pending';

            alert(`Sukses menambahkan order manual ${newOrder.id} (${newOrder.email})!`);
        });
    }

    // Handler Pencarian / Filtering Order
    const searchInput = document.getElementById('searchOrderInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase().trim();
            const filtered = orders.filter(order => order.email.toLowerCase().includes(query));
            renderTable(filtered);
        });
    }

    // Tombol Kosongkan Semua Data
    const clearBtn = document.getElementById('clearAllOrdersBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (confirm('Apakah Anda yakin ingin menghapus semua data orderan? Langkah ini tidak dapat dibatalkan.')) {
                orders = [];
                saveOrders();
                updateMetrics();
                renderTable();
                updateChart();
            }
        });
    }

    // Tombol Isi Dummy Data (Untuk Keperluan Demo / Preview)
    const dummyBtn = document.getElementById('generateDummyDataBtn');
    if (dummyBtn) {
        dummyBtn.addEventListener('click', function () {
            const dummyOrders = [
                { id: 'VRD-2345', email: 'budi.santoso@gmail.com', date: '15 Jun 2026, 09:20', status: 'Delivered' },
                { id: 'VRD-8761', email: 'anisa.lestari@yahoo.com', date: '16 Jun 2026, 14:15', status: 'Delivered' },
                { id: 'VRD-5432', email: 'rizky.hidayat@outlook.com', date: '17 Jun 2026, 10:45', status: 'Shipped' },
                { id: 'VRD-1908', email: 'citra.permata@gmail.com', date: '18 Jun 2026, 11:30', status: 'Pending' },
                { id: 'VRD-7612', email: 'hendra.wijaya@gmail.com', date: '19 Jun 2026, 08:12', status: 'Pending' },
                { id: 'VRD-3049', email: 'melissa.putri@hotmail.com', date: '19 Jun 2026, 13:05', status: 'Pending' }
            ];

            orders = [...dummyOrders, ...orders];
            // Pastikan ID tidak duplikat dengan memfilter keunikan
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
            alert('Dummy data berhasil ditambahkan untuk demo visual!');
        });
    }

    // Inisialisasi awal saat halaman admin dibuka
    loadOrders();
    updateMetrics();
    renderTable();
    updateChart();
});
