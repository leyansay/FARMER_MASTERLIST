// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

function showNotification(message, type = 'error', title = '') {
    const modal = document.getElementById('notificationModal');
    const icon = document.getElementById('notificationIcon');
    const titleEl = document.getElementById('notificationTitle');
    const messageEl = document.getElementById('notificationMessage');
    
    if (!modal || !icon || !titleEl || !messageEl) {
        console.error('Notification elements not found, using alert fallback');
        alert(message);
        return;
    }
    
    if (title) {
        titleEl.textContent = title;
    } else {
        titleEl.textContent = type === 'success' ? 'Success' : type === 'warning' ? 'Warning' : 'Error';
    }
    
    messageEl.innerHTML = message.replace(/\n/g, '<br>');
    
    if (type === 'success') {
        icon.textContent = '✓';
        icon.style.background = 'linear-gradient(135deg, #8BEB9B 0%, #6BCF7B 100%)';
    } else if (type === 'warning') {
        icon.textContent = '⚠';
        icon.style.background = 'linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)';
    } else {
        icon.textContent = '✕';
        icon.style.background = 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)';
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeNotification() {
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

document.addEventListener('click', function(event) {
    const modal = document.getElementById('notificationModal');
    const content = document.querySelector('.notification-content');
    
    if (modal && modal.classList.contains('active') && !content.contains(event.target)) {
        closeNotification();
    }
});

// ==========================================
// CHECK IF GUEST MODE
// ==========================================
function isGuestMode() {
    return localStorage.getItem('isGuest') === 'true';
}

// ==========================================
// IMMEDIATE SESSION CHECK - RUNS FIRST
// ==========================================
(function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const sessionActive = sessionStorage.getItem('sessionActive');
    
    if (!isLoggedIn && !sessionActive) {
        window.location.replace('index.html');
        return;
    }
})();

// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyB_hLdWDYdBsZFmhTFpg4QIzdOiB9JxxIw",
    authDomain: "nfa-main.firebaseapp.com",
    databaseURL: "https://farmer-s-masterlist-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nfa-main",
    storageBucket: "nfa-main.firebasestorage.app",
    messagingSenderId: "314192469082",
    appId: "1:314192469082:web:2f301895179a22dbe68c63",
    measurementId: "G-ZEJP0S67SY"
};

try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

const database = firebase.database();
const farmersRef = database.ref('farmers');

farmersRef.once('value')
    .then(snapshot => {
        console.log('Firebase connected! Existing farmers:', snapshot.numChildren());
    })
    .catch(error => {
        console.error('Firebase connection error:', error);
        alert('Cannot connect to Firebase. Check your internet connection and Firebase rules.');
    });

let farmers = [];
let editingId = null;

// ==========================================
// ENHANCED SESSION PROTECTION
// ==========================================

window.addEventListener('pageshow', function(event) {
    if (event.persisted || performance.navigation.type === 2) {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const sessionActive = sessionStorage.getItem('sessionActive');
        
        if (!isLoggedIn && !sessionActive) {
            window.location.replace('index.html');
        } else {
            window.location.reload();
        }
    }
});

window.history.pushState(null, null, window.location.href);

window.addEventListener('popstate', function() {
    window.history.pushState(null, null, window.location.href);
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const sessionActive = sessionStorage.getItem('sessionActive');
    
    if (!isLoggedIn && !sessionActive) {
        window.location.replace('index.html');
    }
});

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const sessionActive = sessionStorage.getItem('sessionActive');
        
        if (!isLoggedIn && !sessionActive) {
            window.location.replace('index.html');
        }
    }
});

setInterval(function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const sessionActive = sessionStorage.getItem('sessionActive');
    
    if (!isLoggedIn && !sessionActive) {
        window.location.replace('index.html');
    }
}, 2000);

window.addEventListener('focus', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const sessionActive = sessionStorage.getItem('sessionActive');
    
    if (!isLoggedIn && !sessionActive) {
        window.location.replace('index.html');
    }
});

// ==========================================
// DROPDOWN FUNCTIONS
// ==========================================

function toggleActionMenu(event, farmerId) {
    if (isGuestMode()) {
        showNotification('Guest users cannot perform this action. Please log in as admin.', 'warning', 'Guest Mode');
        return;
    }
    
    event.stopPropagation();
    const menu = document.getElementById(`actionMenu-${farmerId}`);
    const allMenus = document.querySelectorAll('.action-dropdown');
    
    allMenus.forEach(m => {
        if (m.id !== `actionMenu-${farmerId}`) {
            m.classList.remove('active');
        }
    });
    
    menu.classList.toggle('active');
}

function toggleDropdown() {
    // Don't show dropdown for guests
    if (isGuestMode()) {
        return;
    }
    
    const userDropdown = document.getElementById('userDropdown');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    userDropdown.classList.toggle('active');
    dropdownMenu.classList.toggle('active');
}

document.addEventListener('click', function(event) {
    if (!event.target.closest('.action-menu-container')) {
        document.querySelectorAll('.action-dropdown').forEach(menu => {
            menu.classList.remove('active');
        });
    }
    
    const userSection = document.querySelector('.user-section');
    if (userSection && !userSection.contains(event.target)) {
        const userDropdown = document.getElementById('userDropdown');
        const dropdownMenu = document.getElementById('dropdownMenu');
        if (userDropdown) userDropdown.classList.remove('active');
        if (dropdownMenu) dropdownMenu.classList.remove('active');
    }
});

// ==========================================
// ENHANCED LOGOUT FUNCTION
// ==========================================

function logout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }

    try {
        const adminId = localStorage.getItem('adminId') || localStorage.getItem('userId');
        
        if (adminId && !isGuestMode()) {
            firebase.database().ref('admins/' + adminId + '/status').set({
                online: false,
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            }).catch(err => console.error('Error updating status:', err));
        }

        localStorage.clear();
        sessionStorage.clear();
        
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        if (firebase.auth && firebase.auth().currentUser) {
            firebase.auth().signOut()
                .then(() => {
                    window.location.replace('index.html');
                })
                .catch(() => {
                    window.location.replace('index.html');
                });
        } else {
            window.location.replace('index.html');
        }
        
    } catch (error) {
        console.error('Logout error:', error);
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('index.html');
    }
}

// ==========================================
// PAGE NAVIGATION
// ==========================================

function showPage(page) {
    const homeBtn = document.querySelectorAll('.nav-item')[0];
    const masterlistBtn = document.querySelectorAll('.nav-item')[1];
    const homePage = document.getElementById('homePage');
    const masterlistPage = document.getElementById('masterlistPage');
    const profilePage = document.getElementById('profilePage');

    homePage.classList.add('hidden');
    masterlistPage.classList.add('hidden');
    if (profilePage) profilePage.classList.add('hidden');
    
    homeBtn.classList.remove('active');
    masterlistBtn.classList.remove('active');

    if (page === 'home') {
        homePage.classList.remove('hidden');
        homeBtn.classList.add('active');
        updateStats();
    } else if (page === 'masterlist') {
        masterlistPage.classList.remove('hidden');
        masterlistBtn.classList.add('active');
        renderTable();
    } else if (page === 'profile') {
        if (isGuestMode()) {
            showNotification('Guest users cannot access profile settings. Please log in as admin.', 'warning', 'Guest Mode');
            return;
        }
        if (profilePage) {
            profilePage.classList.remove('hidden');
            loadProfileData();
        }
    }
}

// ==========================================
// UPDATE USER ROLE DISPLAY
// ==========================================

function updateUserRoleDisplay() {
    const role = isGuestMode() ? 'GUEST' : (localStorage.getItem('role') || 'ADMIN');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    if (userRoleDisplay) {
        userRoleDisplay.textContent = role.toUpperCase();
    }
    
    // Update welcome message for guest
    if (isGuestMode()) {
        const welcomeText = document.querySelector('.welcome-text h1');
        if (welcomeText) {
            welcomeText.textContent = 'Welcome, Guest!';
        }
        
        // Remove dropdown functionality for guest
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.style.cursor = 'default';
            userDropdown.onclick = null;
        }
    }
}

window.addEventListener('DOMContentLoaded', function() {
    updateUserRoleDisplay();
    init();
    
    // Hide Add Farmer button and dropdown arrow if guest
    if (isGuestMode()) {
        const addBtn = document.querySelector('.add-btn');
        if (addBtn) {
            addBtn.style.display = 'none';
        }
        
        // Hide dropdown arrow for guest
        const dropdownArrow = document.querySelector('.dropdown-arrow');
        if (dropdownArrow) {
            dropdownArrow.style.display = 'none';
        }
    }
});

// ==========================================
// PROFILE PAGE FUNCTIONS
// ==========================================

function loadProfileData() {
    if (isGuestMode()) {
        showNotification('Guest users cannot access profile settings.', 'warning', 'Guest Mode');
        return;
    }
    
    console.log('Loading profile data...');
    
    const adminUsername = localStorage.getItem('username') || 'admin';
    const adminEmail = localStorage.getItem('email') || 'admin@nfa.gov.ph';
    const adminName = localStorage.getItem('fullName') || localStorage.getItem('username') || 'Admin';
    const adminRole = 'ADMIN';
    const adminId = localStorage.getItem('adminId') || localStorage.getItem('userId');
    
    localStorage.setItem('role', 'ADMIN');
    
    const profileNameEl = document.getElementById('profileName');
    const profileDisplayNameEl = document.getElementById('profileDisplayName');
    const profileUsernameEl = document.getElementById('profileUsername');
    const profileEmailEl = document.getElementById('profileEmail');
    const profileRoleEl = document.getElementById('profileRole');
    const profileRoleTextEl = document.getElementById('profileRoleText');
    
    if (profileNameEl) profileNameEl.textContent = adminName;
    if (profileDisplayNameEl) profileDisplayNameEl.textContent = adminName;
    if (profileUsernameEl) profileUsernameEl.textContent = adminUsername;
    if (profileEmailEl) profileEmailEl.textContent = adminEmail;
    if (profileRoleEl) profileRoleEl.textContent = 'ADMIN';
    if (profileRoleTextEl) profileRoleTextEl.textContent = 'ADMIN';
    
    if (adminId) {
        const adminRef = database.ref('admins/' + adminId);
        adminRef.once('value')
            .then(snapshot => {
                const adminData = snapshot.val();
                if (adminData) {
                    if (adminData.contact && document.getElementById('profileContact')) {
                        document.getElementById('profileContact').textContent = adminData.contact;
                    }
                }
            })
            .catch(error => {
                console.error('Error loading profile data:', error);
            });
    }
}

function editProfile() {
    if (isGuestMode()) {
        showNotification('Guest users cannot edit profile. Please log in as admin.', 'warning', 'Guest Mode');
        return;
    }
    
    const currentName = document.getElementById('profileDisplayName').textContent;
    const currentUsername = document.getElementById('profileUsername').textContent;
    const currentEmail = document.getElementById('profileEmail').textContent;
    const currentContact = document.getElementById('profileContact').textContent;
    
    document.getElementById('editProfileModal').classList.add('active');
    
    document.getElementById('editFullName').value = currentName;
    document.getElementById('editUsername').value = currentUsername;
    document.getElementById('editEmail').value = currentEmail;
    document.getElementById('editContact').value = currentContact;
    document.getElementById('editRole').value = 'ADMIN';
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.remove('active');
}

function saveProfile() {
    if (isGuestMode()) {
        showNotification('Guest users cannot save profile changes.', 'warning', 'Guest Mode');
        return;
    }
    
    const fullName = document.getElementById('editFullName').value.trim();
    const username = document.getElementById('editUsername').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const contact = document.getElementById('editContact').value.trim();
    const role = 'ADMIN';
    
    if (!fullName || !username || !email) {
        showNotification('Please fill in all required fields (Name, Username, Email)!', 'error', 'Validation Error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address!', 'error', 'Validation Error');
        return;
    }
    
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    localStorage.setItem('role', 'ADMIN');
    
    const adminId = localStorage.getItem('adminId') || localStorage.getItem('userId');
    if (adminId) {
        const updates = {
            fullName: fullName,
            username: username,
            email: email,
            contact: contact,
            role: 'ADMIN',
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        };
        
        database.ref('admins/' + adminId).update(updates)
            .then(() => {
                console.log('Profile updated in Firebase');
                updateUserRoleDisplay();
                loadProfileData();
                closeEditProfileModal();
                showNotification('Profile updated successfully!', 'success');
            })
            .catch((error) => {
                console.error('Error updating profile:', error);
                showNotification('Error updating profile: ' + error.message, 'error');
            });
    } else {
        updateUserRoleDisplay();
        loadProfileData();
        closeEditProfileModal();
        showNotification('Profile updated successfully!', 'success');
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

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

// ==========================================
// STATISTICS AND CHARTS
// ==========================================

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
        const location = farmer.address3 || 'Unknown';
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

// ==========================================
// TABLE FUNCTIONS
// ==========================================

function renderTable() {
    const tbody = document.getElementById('farmerTableBody');
    const thead = document.querySelector('#farmerTable thead tr');
    const sortOrder = document.getElementById('sortSelect').value;
    
    // Handle table header - remove Action column for guests
    if (isGuestMode()) {
        const actionHeader = thead.querySelector('th:last-child');
        if (actionHeader && actionHeader.textContent === 'Action') {
            actionHeader.style.display = 'none';
        }
    } else {
        const actionHeader = thead.querySelector('th:last-child');
        if (actionHeader) {
            actionHeader.style.display = '';
        }
    }
    
    let sortedFarmers = [...farmers];
    if (sortOrder === 'latest') {
        sortedFarmers.sort((a, b) => b.dateAdded - a.dateAdded);
    } else {
        sortedFarmers.sort((a, b) => a.dateAdded - b.dateAdded);
    }
    
    tbody.innerHTML = '';
    
    if (sortedFarmers.length === 0) {
        const colspan = isGuestMode() ? '13' : '14';
        tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center; padding: 40px; color: #999;">No farmers yet. Click "Add Farmer" to get started.</td></tr>`;
        return;
    }
    
    sortedFarmers.forEach(farmer => {
        const row = document.createElement('tr');
        
        // For guest mode, completely remove action column
        let actionColumn = '';
        if (!isGuestMode()) {
            actionColumn = `
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
        }
        
        row.innerHTML = `
            <td>${farmer.surname || ''}</td>
            <td>${farmer.name || ''}</td>
            <td>${farmer.middleName || farmer.middleInitial || ''}</td>
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
            ${actionColumn}
        `;
        tbody.appendChild(row);
    });
}

// Add this sa imong JavaScript file
document.getElementById('searchBar').addEventListener('input', searchFarmers);

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

// ==========================================
// MODAL FUNCTIONS
// ==========================================

function openModal() {
    if (isGuestMode()) {
        showNotification('Guest users cannot add farmers. Please log in as admin to add new farmers.', 'warning', 'Guest Mode');
        return;
    }
    
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
    ['surname', 'name', 'middleName', 'address1', 'address2', 'address3',
     'farmLocation', 'birthdate', 'gender', 'civilStatus', 'farmArea',
     'rsbsaNumber', 'contactNumber'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
            element.style.border = '';
        }
    });
}

// ==========================================
// FARMER CRUD OPERATIONS
// ==========================================

function saveFarmer() {
    if (isGuestMode()) {
        showNotification('Guest users cannot save farmers. Please log in as admin.', 'warning', 'Guest Mode');
        return;
    }
    
    console.log('Save farmer function called');
    
    const surnameInput = document.getElementById('surname');
    const nameInput = document.getElementById('name');
    const middleNameInput = document.getElementById('middleName');
    const contactNumberInput = document.getElementById('contactNumber');
    
    const surname = surnameInput.value.trim();
    const name = nameInput.value.trim();
    const middleName = middleNameInput.value.trim();
    const contactNumber = contactNumberInput.value.trim();
    
    surnameInput.style.border = '';
    nameInput.style.border = '';
    middleNameInput.style.border = '';
    contactNumberInput.style.border = '';
    
    let hasError = false;
    let errors = [];
    
    if (!surname) {
        surnameInput.style.border = '2px solid #ff0000';
        errors.push('Surname is required');
        hasError = true;
    } else if (!/^[A-Za-z\s]+$/.test(surname)) {
        surnameInput.style.border = '2px solid #ff0000';
        errors.push('Surname must contain only letters');
        hasError = true;
    }
    
    if (!name) {
        nameInput.style.border = '2px solid #ff0000';
        errors.push('Name is required');
        hasError = true;
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
        nameInput.style.border = '2px solid #ff0000';
        errors.push('Name must contain only letters');
        hasError = true;
    }
    
    if (middleName && !/^[A-Za-z\s]+$/.test(middleName)) {
        middleNameInput.style.border = '2px solid #ff0000';
        errors.push('Middle name must contain only letters');
        hasError = true;
    }
    
   
    
    if (hasError) {
        showNotification(errors.join('\n'), 'error', 'Validation Error');
        console.log('Validation failed');
        return;
    }
    
    const farmer = {
        surname: surname.toUpperCase(),
        name: name.toUpperCase(),
        middleName: middleName.toUpperCase(),
        address1: document.getElementById('address1').value.trim().toUpperCase(),
        address2: document.getElementById('address2').value.trim().toUpperCase(),
        address3: document.getElementById('address3').value.trim().toUpperCase(),
        farmLocation: document.getElementById('farmLocation').value.trim().toUpperCase(),
        birthdate: document.getElementById('birthdate').value,
        gender: document.getElementById('gender').value,
        civilStatus: document.getElementById('civilStatus').value,
        farmArea: document.getElementById('farmArea').value,
        rsbsaNumber: document.getElementById('rsbsaNumber').value.trim().toUpperCase(),
        contactNumber: contactNumber
    };

    console.log('Farmer data:', farmer);

    if (editingId) {
        console.log('Updating farmer:', editingId);
        farmersRef.child(editingId).update(farmer)
            .then(() => {
                console.log('Farmer updated successfully');
                showNotification('Farmer updated successfully!', 'success');
                closeModal();
            })
            .catch((error) => {
                console.error('Update error:', error);
                showNotification('Error updating farmer: ' + error.message, 'error');
            });
    } else {
        farmer.dateAdded = new Date().toISOString();
        console.log('Adding new farmer:', farmer);
        
        farmersRef.push(farmer)
            .then(() => {
                console.log('Farmer added successfully to Firebase');
                showNotification('Farmer added successfully!', 'success');
                closeModal();
            })
            .catch((error) => {
                console.error('Firebase save error:', error);
                showNotification('Error adding farmer: ' + error.message, 'error');
            });
    }
}

function editFarmer(id) {
    if (isGuestMode()) {
        showNotification('Guest users cannot edit farmers. Please log in as admin to edit farmer information.', 'warning', 'Guest Mode');
        return;
    }
    
    editingId = id;
    const farmer = farmers.find(f => f.id === id);
    
    if (!farmer) {
        alert('Farmer not found!');
        return;
    }
    
    document.getElementById('modalTitle').textContent = 'Edit Farmer';
    document.getElementById('surname').value = farmer.surname || '';
    document.getElementById('name').value = farmer.name || '';
    document.getElementById('middleName').value = farmer.middleName || farmer.middleInitial || '';
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
    if (isGuestMode()) {
        showNotification('Guest users cannot delete farmers. Please log in as admin to delete farmer records.', 'warning', 'Guest Mode');
        return;
    }
    
    if (confirm('Are you sure you want to delete this farmer?')) {
        farmersRef.child(id).remove()
            .then(() => {
                showNotification('Farmer deleted successfully!', 'success');
            })
            .catch((error) => {
                showNotification('Error deleting farmer: ' + error.message, 'error');
            });
    }
}       

// Guest Mode Handler - Check and display login button
function checkGuestMode() {
    const isGuest = localStorage.getItem('isGuest') === 'true';
    const guestLoginBtn = document.getElementById('guestLoginBtn');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    
    if (isGuest) {
        // Show login button for guest mode
        if (guestLoginBtn) {
            guestLoginBtn.style.display = 'inline-block';
        }
        if (userRoleDisplay) {
            userRoleDisplay.textContent = 'GUEST';
        }
        
        // Update welcome message if exists
        const welcomeText = document.querySelector('.welcome-text h1');
        if (welcomeText) {
            welcomeText.textContent = 'Welcome, Guest!';
        }
        
        // Hide dropdown arrow for guest
        const dropdownArrow = document.querySelector('.dropdown-arrow');
        if (dropdownArrow) {
            dropdownArrow.style.display = 'none';
        }
        
        // Remove dropdown functionality for guest
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.style.cursor = 'default';
            userDropdown.onclick = null;
        }
    } else {
        // Hide login button for logged-in users
        if (guestLoginBtn) {
            guestLoginBtn.style.display = 'none';
        }
        
        // Show dropdown arrow for logged-in users
        const dropdownArrow = document.querySelector('.dropdown-arrow');
        if (dropdownArrow) {
            dropdownArrow.style.display = 'inline';
        }
    }
}

// Guest Login Function
function guestLogin() {
    // Clear guest mode
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login page
    window.location.replace('index.html');
}

// Run check when page loads
document.addEventListener('DOMContentLoaded', checkGuestMode);

// Also check after a short delay to ensure everything is loaded
setTimeout(checkGuestMode, 100);