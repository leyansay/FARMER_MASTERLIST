 // Firebase Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyB_hLdWDYdBsZFmhTFpg4QIzdOiB9JxxIw",
            authDomain: "nfa-main.firebaseapp.com",
            databaseURL: "https://nfa-main-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "nfa-main",
            storageBucket: "nfa-main.firebasestorage.app",
            messagingSenderId: "314192469082",
            appId: "1:314192469082:web:2f301895179a22dbe68c63",
            measurementId: "G-ZEJP0S67SY"
        };

        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        const farmersRef = database.ref('farmers');

        let farmers = [];
        let editingId = null;

        function toggleActionMenu(event, farmerId) {
            event.stopPropagation();
            const menu = document.getElementById(`actionMenu-${farmerId}`);
            const allMenus = document.querySelectorAll('.action-dropdown');
            
            // Close all other menus
            allMenus.forEach(m => {
                if (m.id !== `actionMenu-${farmerId}`) {
                    m.classList.remove('active');
                }
            });
            
            // Toggle current menu
            menu.classList.toggle('active');
        }

        function toggleDropdown() {
            document.getElementById('userDropdown').classList.toggle('active');
            document.getElementById('dropdownMenu').classList.toggle('active');
        }

        document.addEventListener('click', function(event) {
            // Close action menus when clicking outside
            if (!event.target.closest('.action-menu-container')) {
                document.querySelectorAll('.action-dropdown').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
            
            // Close user dropdown when clicking outside
            const userSection = document.querySelector('.user-section');
            if (userSection && !userSection.contains(event.target)) {
                document.getElementById('userDropdown').classList.remove('active');
                document.getElementById('dropdownMenu').classList.remove('active');
            }
        });

        function init() {
            loadFarmersFromFirebase();
        }

        function loadFarmersFromFirebase() {
            farmersRef.on('value', (snapshot) => {
                farmers = [];
                snapshot.forEach((childSnapshot) => {
                    const farmer = childSnapshot.val();
                    farmer.id = childSnapshot.key;
                    farmer.dateAdded = farmer.dateAdded ? new Date(farmer.dateAdded) : new Date();
                    farmers.push(farmer);
                });
                
                renderTable();
                updateStats();
            });
        }


        function updateStats() {
            document.getElementById('totalFarmers').textContent = farmers.length;
            
            const maleCount = farmers.filter(f => f.gender === 'Male').length;
            const femaleCount = farmers.filter(f => f.gender === 'Female').length;
            
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            const thisMonthCount = farmers.filter(f => {
                const addedDate = new Date(f.dateAdded);
                return addedDate.getMonth() === currentMonth && addedDate.getFullYear() === currentYear;
            }).length;
            
            const thisYearCount = farmers.filter(f => {
                const addedDate = new Date(f.dateAdded);
                return addedDate.getFullYear() === currentYear;
            }).length;
            
            document.getElementById('thisMonth').textContent = thisMonthCount;
            document.getElementById('thisYear').textContent = thisYearCount;
            
            const locationCount = {};
            farmers.forEach(farmer => {
                const location = farmer.farmLocation || 'Unknown';
                locationCount[location] = (locationCount[location] || 0) + 1;
            });
            
            updateCharts(maleCount, femaleCount, locationCount);
            updateRecentActivity();
        }

        function updateCharts(maleCount, femaleCount, locationCount) {
            const genderCtx = document.getElementById('genderChart');
            if (window.genderChart instanceof Chart) {
                window.genderChart.destroy();
            }
            window.genderChart = new Chart(genderCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Male', 'Female'],
                    datasets: [{
                        data: [maleCount, femaleCount],
                        backgroundColor: ['#193532', '#8BEB9B'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });

            const locationCtx = document.getElementById('locationChart');
            if (window.locationChart instanceof Chart) {
                window.locationChart.destroy();
            }
            
            window.locationChart = new Chart(locationCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(locationCount),
                    datasets: [{
                        label: 'Farmers',
                        data: Object.values(locationCount),
                        backgroundColor: '#8BEB9B',
                        borderColor: '#193532',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        function updateRecentActivity() {
            const activityList = document.getElementById('activityList');
            const recentFarmers = [...farmers]
                .sort((a, b) => b.dateAdded - a.dateAdded)
                .slice(0, 5);
            
            activityList.innerHTML = '';
            
            if (recentFarmers.length === 0) {
                activityList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No recent registrations</p>';
                return;
            }
            
            recentFarmers.forEach(farmer => {
                const item = document.createElement('div');
                item.className = 'recent-item';
                const date = new Date(farmer.dateAdded);
                const formattedDate = date.toLocaleDateString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric' 
                });
                
                item.innerHTML = `
                    <div class="recent-name">${farmer.name} ${farmer.surname}</div>
                    <div class="recent-details">${farmer.farmLocation} • ${farmer.farmArea} ha</div>
                    <div class="recent-date">${formattedDate}</div>
                `;
                activityList.appendChild(item);
            });
        }

        function renderTable() {
            const tbody = document.getElementById('farmerTableBody');
            const sortOrder = document.getElementById('sortSelect').value;
            
            let sortedFarmers = [...farmers];
            if (sortOrder === 'latest') {
                sortedFarmers.sort((a, b) => b.dateAdded - a.dateAdded);
            } else {
                sortedFarmers.sort((a, b) => a.dateAdded - b.dateAdded);
            }
            
            tbody.innerHTML = '';
            
            if (sortedFarmers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="14" style="text-align: center; padding: 40px; color: #999;">No farmers yet. Click "Add Farmer" to get started.</td></tr>';
                return;
            }
            
            sortedFarmers.forEach(farmer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${farmer.surname || ''}</td>
                    <td>${farmer.name || ''}</td>
                    <td>${farmer.middleInitial || ''}</td>
                    <td>${farmer.address1 || ''}</td>
                    <td>${farmer.address2 || ''}</td>
                    <td>${farmer.address3 || ''}</td>
                    <td>${farmer.farmLocation || ''}</td>
                    <td>${farmer.birthdate || ''}</td>
                    <td>${farmer.gender || ''}</td>
                    <td>${farmer.civilStatus || ''}</td>
                    <td>${farmer.farmArea ? farmer.farmArea + ' ha' : ''}</td>
                    <td>${farmer.rsbsaNumber || ''}</td>
                    <td>${farmer.contactNumber || ''}</td>
                    <td>
                        <div class="action-menu-container">
                            <button class="kebab-btn" onclick="toggleActionMenu(event, '${farmer.id}')">⋮</button>
                            <div class="action-dropdown" id="actionMenu-${farmer.id}">
                                <button class="action-dropdown-item edit-item" onclick="editFarmer('${farmer.id}')">
                                    <span>✏️</span> Edit
                                </button>
                                <button class="action-dropdown-item delete-item" onclick="deleteFarmer('${farmer.id}')">
                                    <span>🗑️</span> Delete
                                </button>
                            </div>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function searchFarmers() {
            const searchTerm = document.getElementById('searchBar').value.toLowerCase();
            const rows = document.querySelectorAll('#farmerTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }

        function sortTable() {
            renderTable();
        }

        function openModal() {
            editingId = null;
            document.getElementById('modalTitle').textContent = 'Add Farmer';
            clearForm();
            document.getElementById('farmerModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('farmerModal').classList.remove('active');
            clearForm();
        }

        function clearForm() {
            ['surname', 'name', 'middleInitial', 'address1', 'address2', 'address3',
             'farmLocation', 'birthdate', 'gender', 'civilStatus', 'farmArea',
             'rsbsaNumber', 'contactNumber'].forEach(id => {
                document.getElementById(id).value = '';
            });
        }

        function saveFarmer() {
            const farmer = {
                surname: document.getElementById('surname').value.trim(),
                name: document.getElementById('name').value.trim(),
                middleInitial: document.getElementById('middleInitial').value.trim(),
                address1: document.getElementById('address1').value.trim(),
                address2: document.getElementById('address2').value.trim(),
                address3: document.getElementById('address3').value.trim(),
                farmLocation: document.getElementById('farmLocation').value.trim(),
                birthdate: document.getElementById('birthdate').value,
                gender: document.getElementById('gender').value,
                civilStatus: document.getElementById('civilStatus').value,
                farmArea: document.getElementById('farmArea').value,
                rsbsaNumber: document.getElementById('rsbsaNumber').value.trim(),
                contactNumber: document.getElementById('contactNumber').value.trim()
            };

            if (!farmer.surname || !farmer.name || !farmer.address1 || !farmer.farmLocation || 
                !farmer.birthdate || !farmer.gender || !farmer.civilStatus || !farmer.farmArea || 
                !farmer.rsbsaNumber || !farmer.contactNumber) {
                alert('Please fill in all required fields!');
                return;
            }

            if (editingId) {
                farmersRef.child(editingId).update(farmer)
                    .then(() => {
                        alert('Farmer updated successfully!');
                        closeModal();
                    })
                    .catch((error) => {
                        alert('Error updating farmer: ' + error.message);
                    });
            } else {
                farmer.dateAdded = new Date().toISOString();
                farmersRef.push(farmer)
                    .then(() => {
                        alert('Farmer added successfully!');
                        closeModal();
                    })
                    .catch((error) => {
                        alert('Error adding farmer: ' + error.message);
                    });
            }
        }

        function editFarmer(id) {
            editingId = id;
            const farmer = farmers.find(f => f.id === id);
            
            if (!farmer) {
                alert('Farmer not found!');
                return;
            }
            
            document.getElementById('modalTitle').textContent = 'Edit Farmer';
            document.getElementById('surname').value = farmer.surname || '';
            document.getElementById('name').value = farmer.name || '';
            document.getElementById('middleInitial').value = farmer.middleInitial || '';
            document.getElementById('address1').value = farmer.address1 || '';
            document.getElementById('address2').value = farmer.address2 || '';
            document.getElementById('address3').value = farmer.address3 || '';
            document.getElementById('farmLocation').value = farmer.farmLocation || '';
            document.getElementById('birthdate').value = farmer.birthdate || '';
            document.getElementById('gender').value = farmer.gender || '';
            document.getElementById('civilStatus').value = farmer.civilStatus || '';
            document.getElementById('farmArea').value = farmer.farmArea || '';
            document.getElementById('rsbsaNumber').value = farmer.rsbsaNumber || '';
            document.getElementById('contactNumber').value = farmer.contactNumber || '';
            
            document.getElementById('farmerModal').classList.add('active');
        }

        function deleteFarmer(id) {
            if (confirm('Are you sure you want to delete this farmer?')) {
                farmersRef.child(id).remove()
                    .then(() => {
                        alert('Farmer deleted successfully!');
                    })
                    .catch((error) => {
                        alert('Error deleting farmer: ' + error.message);
                    });
            }
        }

        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = 'index.html';
            }
        }

        window.addEventListener('DOMContentLoaded', init);