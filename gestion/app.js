// ==========================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDcQw9fbueQ2MRoO5thpfN3N_Pk4yaYmYM",
    authDomain: "heaven-99e7b.firebaseapp.com",
    projectId: "heaven-99e7b",
    storageBucket: "heaven-99e7b.firebasestorage.app",
    messagingSenderId: "762982225526",
    appId: "1:762982225526:web:eb1426623d1227bca0f157",
    measurementId: "G-Y9PTN2NLS6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ==========================================
// APPLICATION STATE
// ==========================================
let currentUser = null;
let clients = [];
let orders = [];
let costsData = {
    coffeeCost: 0,
    coffeeUnit: 'g',
    coffeeCostInput: 0,
    coffeeAmount: 0,
    capsuleCost: 0,
    lidCost: 0,
    boxCost12: 0,
    boxCost24: 0,
    boxCost48: 0,
    indirectCosts: 0,
    costPerCapsule: 0
};
window.costsData = costsData; // Make it global
let salesData = {
    priceBox12: 0,
    priceBox24: 0,
    priceBox48: 0
};
window.salesData = salesData; // Make it global
let cart = [];
let currentOrderFilter = 'all';

// ==========================================
// AUTHENTICATION
// ==========================================

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        showApp();
        loadInitialData();
        updateUserInfo();
    } else {
        currentUser = null;
        showLogin();
    }
});

// Google Sign In
window.signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
        console.log('Usuario autenticado:', currentUser.displayName);
    } catch (error) {
        console.error('Error en autenticación:', error);
        alert('Error al iniciar sesión. Por favor intenta de nuevo.');
    }
};

// Sign Out
window.signOutUser = async () => {
    try {
        await signOut(auth);
        currentUser = null;
        showLogin();
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
};

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
}

const SUPER_ADMIN = 'ueservicesllc1@gmail.com';
let authorizedUsers = [];

async function loadAuthorizations() {
    try {
        const q = query(
            collection(db, 'settings'),
            where('type', '==', 'permissions')
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            authorizedUsers = snapshot.docs[0].data().authorizedEmails || [];
        } else {
            // Initialize if not exists
            authorizedUsers = [SUPER_ADMIN];
            await addDoc(collection(db, 'settings'), {
                type: 'permissions',
                authorizedEmails: [SUPER_ADMIN],
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error loading permissions:", error);
        authorizedUsers = [SUPER_ADMIN]; // Fallback
    }
}

async function updateUserInfo() {
    if (currentUser) {
        const userNameElements = document.querySelectorAll('.user-name');
        const userEmailElements = document.querySelectorAll('.user-email');
        const userPhotoElements = document.querySelectorAll('.user-photo');

        userNameElements.forEach(el => el.textContent = currentUser.displayName);
        userEmailElements.forEach(el => el.textContent = currentUser.email);
        userPhotoElements.forEach(el => {
            if (el.tagName === 'IMG') {
                el.src = currentUser.photoURL;
            } else {
                el.style.backgroundImage = `url(${currentUser.photoURL})`;
            }
        });

        // Check Permissions
        await loadAuthorizations();

        const isSuperAdmin = currentUser.email === SUPER_ADMIN;
        const isAuthorized = authorizedUsers.includes(currentUser.email) || isSuperAdmin;

        // Show/Hide Design Link Icon in Header
        const designLink = document.getElementById('designLinkIcon');
        if (designLink) {
            designLink.style.display = isAuthorized ? 'flex' : 'none';
        }

        // Show/Hide Admin Tools in Settings
        const adminTools = document.getElementById('adminTools');
        if (adminTools && isSuperAdmin) {
            adminTools.style.display = 'block';
            renderAuthorizedUsers();
        }
    }
}

async function addAuthorizedUser() {
    const email = document.getElementById('newAdminEmail').value;
    if (!email) return;

    if (!authorizedUsers.includes(email)) {
        authorizedUsers.push(email);
        await saveAuthorizations();
        renderAuthorizedUsers();
        document.getElementById('newAdminEmail').value = '';
        alert('Usuario autorizado agregado');
    }
}

async function removeAuthorizedUser(email) {
    if (email === SUPER_ADMIN) {
        alert('No se puede eliminar al Super Admin');
        return;
    }
    authorizedUsers = authorizedUsers.filter(e => e !== email);
    await saveAuthorizations();
    renderAuthorizedUsers();
}

async function saveAuthorizations() {
    try {
        const q = query(
            collection(db, 'settings'),
            where('type', '==', 'permissions')
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await updateDoc(doc(db, 'settings', docId), {
                authorizedEmails: authorizedUsers,
                updatedAt: serverTimestamp()
            });
        }
    } catch (e) {
        console.error("Error saving permissions", e);
    }
}

function renderAuthorizedUsers() {
    const list = document.getElementById('authorizedUsersList');
    if (!list) return;

    list.innerHTML = authorizedUsers.map(email => `
        <div class="user-item" style="display:flex; justify-content:space-between; margin-bottom:0.5rem; padding:0.5rem; background:#333; border-radius:4px;">
            <span>${email}</span>
            ${email !== SUPER_ADMIN ? `<button onclick="removeAuthorizedUser('${email}')" style="background:none; border:none; color:red; cursor:pointer;">&times;</button>` : '<span style="color:gold;">★</span>'}
        </div>
    `).join('');
}

// Global expose
window.addAuthorizedUser = addAuthorizedUser;
window.removeAuthorizedUser = removeAuthorizedUser;


// ==========================================
// FIRESTORE DATA OPERATIONS
// ==========================================

// Load all data
async function loadAllData() {
    await Promise.all([
        loadClients(),
        loadOrders(),
        loadCostsSettings(),
        loadSalesSettings(),
        loadCompanySettings()
    ]);
    updateDashboard();
}

// CLIENTS
async function loadClients() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, 'clients'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        clients = [];
        querySnapshot.forEach((doc) => {
            clients.push({ id: doc.id, ...doc.data() });
        });

        renderClients();
        updateClientSelects();
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

async function saveClientToFirestore(clientData) {
    if (!currentUser) return;

    try {
        const docRef = await addDoc(collection(db, 'clients'), {
            ...clientData,
            userId: currentUser.uid,
            createdAt: serverTimestamp()
        });
        console.log('Cliente guardado con ID:', docRef.id);
        await loadClients();
    } catch (error) {
        console.error('Error guardando cliente:', error);
        throw error;
    }
}

async function deleteClientFromFirestore(clientId) {
    try {
        await deleteDoc(doc(db, 'clients', clientId));
        await loadClients();
    } catch (error) {
        console.error('Error eliminando cliente:', error);
    }
}

// ORDERS
async function loadOrders() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        renderOrders();
        updateOrderBadges();
    } catch (error) {
        console.error('Error cargando órdenes:', error);
    }
}

async function saveOrderToFirestore(orderData) {
    if (!currentUser) return;

    try {
        const docRef = await addDoc(collection(db, 'orders'), {
            ...orderData,
            userId: currentUser.uid,
            createdAt: serverTimestamp()
        });
        console.log('Orden guardada con ID:', docRef.id);
        await loadOrders();
    } catch (error) {
        console.error('Error guardando orden:', error);
        throw error;
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await updateDoc(doc(db, 'orders', orderId), {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
        await loadOrders();
    } catch (error) {
        console.error('Error actualizando orden:', error);
    }
}

async function deleteOrderFromFirestore(orderId) {
    try {
        await deleteDoc(doc(db, 'orders', orderId));
        await loadOrders();
    } catch (error) {
        console.error('Error eliminando orden:', error);
    }
}

// SETTINGS
async function loadCostsSettings() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, 'settings'),
            where('userId', '==', currentUser.uid),
            where('type', '==', 'costs')
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            costsData = { ...data };
            updateCostsForm();
            calculateCosts();
        }
    } catch (error) {
        console.error('Error cargando configuración de costos:', error);
    }
}

async function saveCostsSettings() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, 'settings'),
            where('userId', '==', currentUser.uid),
            where('type', '==', 'costs')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await addDoc(collection(db, 'settings'), {
                ...costsData,
                userId: currentUser.uid,
                type: 'costs',
                updatedAt: serverTimestamp()
            });
        } else {
            const docId = querySnapshot.docs[0].id;
            await updateDoc(doc(db, 'settings', docId), {
                ...costsData,
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error guardando configuración de costos:', error);
    }
}

async function loadSalesSettings() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, 'settings'),
            where('userId', '==', currentUser.uid),
            where('type', '==', 'sales')
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            salesData = { ...data };
            updateSalesForm();
            calculateProfits();
        }
    } catch (error) {
        console.error('Error cargando configuración de ventas:', error);
    }
}

async function saveSalesSettings() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, 'settings'),
            where('userId', '==', currentUser.uid),
            where('type', '==', 'sales')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await addDoc(collection(db, 'settings'), {
                ...salesData,
                userId: currentUser.uid,
                type: 'sales',
                updatedAt: serverTimestamp()
            });
        } else {
            const docId = querySnapshot.docs[0].id;
            await updateDoc(doc(db, 'settings', docId), {
                ...salesData,
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error guardando configuración de ventas:', error);
    }
}

async function loadCompanySettings() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, 'settings'),
            where('userId', '==', currentUser.uid),
            where('type', '==', 'company')
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            document.getElementById('companyName').value = data.name || 'HEAVEN';
            document.getElementById('companyPhone').value = data.phone || '';
            document.getElementById('companyEmail').value = data.email || '';
            document.getElementById('companyAddress').value = data.address || '';
        }
    } catch (error) {
        console.error('Error cargando configuración de empresa:', error);
    }
}

async function saveCompanySettings(companyData) {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, 'settings'),
            where('userId', '==', currentUser.uid),
            where('type', '==', 'company')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await addDoc(collection(db, 'settings'), {
                ...companyData,
                userId: currentUser.uid,
                type: 'company',
                updatedAt: serverTimestamp()
            });
        } else {
            const docId = querySnapshot.docs[0].id;
            await updateDoc(doc(db, 'settings', docId), {
                ...companyData,
                updatedAt: serverTimestamp()
            });
        }

        alert('Configuración guardada exitosamente');
    } catch (error) {
        console.error('Error guardando configuración de empresa:', error);
        alert('Error al guardar la configuración');
    }
}

// ==========================================
// NAVIGATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.getAttribute('data-view');
            switchView(viewName);

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
});

function switchView(viewName) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));

    const targetView = document.getElementById(viewName);
    if (targetView) {
        targetView.classList.add('active');
    }
}

// ==========================================
// COST CALCULATOR
// ==========================================
document.getElementById('costForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const coffeeCostInput = parseFloat(document.getElementById('coffeeCost').value);
    const coffeeUnit = document.getElementById('coffeeUnit')?.value || 'g';

    // Convert to cost per gram
    let costPerGram = coffeeCostInput;
    if (coffeeUnit === 'kg') costPerGram = coffeeCostInput / 1000;
    else if (coffeeUnit === 'lb') costPerGram = coffeeCostInput / 453.592;

    costsData.coffeeCostInput = coffeeCostInput;
    costsData.coffeeUnit = coffeeUnit;
    costsData.coffeeCost = costPerGram;
    costsData.coffeeAmount = parseFloat(document.getElementById('coffeeAmount').value);
    costsData.capsuleCost = parseFloat(document.getElementById('capsuleCost').value);
    costsData.lidCost = parseFloat(document.getElementById('lidCost').value);
    costsData.boxCost12 = parseFloat(document.getElementById('boxCost12').value);
    costsData.boxCost24 = parseFloat(document.getElementById('boxCost24').value);
    costsData.boxCost48 = parseFloat(document.getElementById('boxCost48').value);
    costsData.indirectCosts = parseFloat(document.getElementById('indirectCosts').value);

    calculateCosts();
    saveCostsSettings();
});

function calculateCosts() {
    const coffeeCostPerCapsule = costsData.coffeeCost * costsData.coffeeAmount;

    // Costo base sin caja (café + cápsula + tapa)
    const baseCostWithoutBox = coffeeCostPerCapsule + costsData.capsuleCost + costsData.lidCost;

    // Calcular costo por cápsula para CADA tamaño de caja
    const costPerCapsule12 = baseCostWithoutBox + (costsData.boxCost12 / 12);
    const costPerCapsule24 = baseCostWithoutBox + (costsData.boxCost24 / 24);
    const costPerCapsule48 = baseCostWithoutBox + (costsData.boxCost48 / 48);

    // Aplicar costos indirectos a cada uno
    const indirectRate = costsData.indirectCosts / 100;
    const finalCost12 = costPerCapsule12 * (1 + indirectRate);
    const finalCost24 = costPerCapsule24 * (1 + indirectRate);
    const finalCost48 = costPerCapsule48 * (1 + indirectRate);

    // Guardar el costo promedio (usando caja de 12 como referencia)
    costsData.costPerCapsule = finalCost12;

    // Costos totales por caja
    const costBox12 = finalCost12 * 12;
    const costBox24 = finalCost24 * 24;
    const costBox48 = finalCost48 * 48;

    // Mostrar costo por cápsula general
    document.getElementById('costPerCapsule').textContent = `$${finalCost12.toFixed(2)}`;

    // Mostrar costo total Y costo por cápsula para cada caja
    document.getElementById('costBox12').textContent = `$${costBox12.toFixed(2)} ($${finalCost12.toFixed(2)}/cáp)`;
    document.getElementById('costBox24').textContent = `$${costBox24.toFixed(2)} ($${finalCost24.toFixed(2)}/cáp)`;
    document.getElementById('costBox48').textContent = `$${costBox48.toFixed(2)} ($${finalCost48.toFixed(2)}/cáp)`;

    // Calculate percentages for breakdown
    const totalCost = coffeeCostPerCapsule + costsData.capsuleCost + costsData.lidCost;
    const coffeePercent = (coffeeCostPerCapsule / totalCost * 100).toFixed(1);
    const capsulePercent = (costsData.capsuleCost / totalCost * 100).toFixed(1);
    const lidPercent = (costsData.lidCost / totalCost * 100).toFixed(1);

    document.getElementById('coffeeBar').style.setProperty('--percentage', `${coffeePercent}%`);
    document.getElementById('capsuleBar').style.setProperty('--percentage', `${capsulePercent}%`);
    document.getElementById('lidBar').style.setProperty('--percentage', `${lidPercent}%`);

    document.getElementById('coffeePercent').textContent = `${coffeePercent}%`;
    document.getElementById('capsulePercent').textContent = `${capsulePercent}%`;
    document.getElementById('lidPercent').textContent = `${lidPercent}%`;

    // Recalculate profits if sales data exists
    if (salesData.priceBox12 > 0) {
        calculateProfits();
    }
}

function updateCostsForm() {
    document.getElementById('coffeeCost').value = costsData.coffeeCostInput || costsData.coffeeCost || '';
    if (document.getElementById('coffeeUnit')) {
        document.getElementById('coffeeUnit').value = costsData.coffeeUnit || 'g';
    }
    document.getElementById('coffeeAmount').value = costsData.coffeeAmount || '';
    document.getElementById('capsuleCost').value = costsData.capsuleCost || '';
    document.getElementById('lidCost').value = costsData.lidCost || '';
    document.getElementById('boxCost12').value = costsData.boxCost12 || '';
    document.getElementById('boxCost24').value = costsData.boxCost24 || '';
    document.getElementById('boxCost48').value = costsData.boxCost48 || '';
    document.getElementById('indirectCosts').value = costsData.indirectCosts || '';
}

// ==========================================
// SALES ANALYSIS
// ==========================================
document.getElementById('salesForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    salesData.priceBox12 = parseFloat(document.getElementById('priceBox12').value);
    salesData.priceBox24 = parseFloat(document.getElementById('priceBox24').value);
    salesData.priceBox48 = parseFloat(document.getElementById('priceBox48').value);

    calculateProfits();
    saveSalesSettings();
});

function calculateProfits() {
    // Recalcular costos específicos para cada caja
    const coffeeCostPerCapsule = costsData.coffeeCost * costsData.coffeeAmount;
    const baseCostWithoutBox = coffeeCostPerCapsule + costsData.capsuleCost + costsData.lidCost;

    const costPerCapsule12 = baseCostWithoutBox + (costsData.boxCost12 / 12);
    const costPerCapsule24 = baseCostWithoutBox + (costsData.boxCost24 / 24);
    const costPerCapsule48 = baseCostWithoutBox + (costsData.boxCost48 / 48);

    const indirectRate = costsData.indirectCosts / 100;
    const finalCost12 = costPerCapsule12 * (1 + indirectRate);
    const finalCost24 = costPerCapsule24 * (1 + indirectRate);
    const finalCost48 = costPerCapsule48 * (1 + indirectRate);

    const costBox12 = finalCost12 * 12;
    const costBox24 = finalCost24 * 24;
    const costBox48 = finalCost48 * 48;

    const profitBox12 = salesData.priceBox12 - costBox12;
    const profitBox24 = salesData.priceBox24 - costBox24;
    const profitBox48 = salesData.priceBox48 - costBox48;

    const marginBox12 = salesData.priceBox12 > 0 ? (profitBox12 / salesData.priceBox12 * 100).toFixed(1) : 0;
    const marginBox24 = salesData.priceBox24 > 0 ? (profitBox24 / salesData.priceBox24 * 100).toFixed(1) : 0;
    const marginBox48 = salesData.priceBox48 > 0 ? (profitBox48 / salesData.priceBox48 * 100).toFixed(1) : 0;

    document.getElementById('profitBox12').textContent = `$${profitBox12.toFixed(2)}`;
    document.getElementById('profitBox24').textContent = `$${profitBox24.toFixed(2)}`;
    document.getElementById('profitBox48').textContent = `$${profitBox48.toFixed(2)}`;

    document.getElementById('marginBox12').textContent = `${marginBox12}% margen`;
    document.getElementById('marginBox24').textContent = `${marginBox24}% margen`;
    document.getElementById('marginBox48').textContent = `${marginBox48}% margen`;
}

function updateSalesForm() {
    document.getElementById('priceBox12').value = salesData.priceBox12 || '';
    document.getElementById('priceBox24').value = salesData.priceBox24 || '';
    document.getElementById('priceBox48').value = salesData.priceBox48 || '';
}

window.calculateProjections = () => {
    const qty12 = parseInt(document.getElementById('projectionBox12').value) || 0;
    const qty24 = parseInt(document.getElementById('projectionBox24').value) || 0;
    const qty48 = parseInt(document.getElementById('projectionBox48').value) || 0;

    const revenue = (qty12 * salesData.priceBox12) + (qty24 * salesData.priceBox24) + (qty48 * salesData.priceBox48);
    const costs = (qty12 * costsData.costPerCapsule * 12) + (qty24 * costsData.costPerCapsule * 24) + (qty48 * costsData.costPerCapsule * 48);
    const profit = revenue - costs;

    document.getElementById('projectedRevenue').textContent = `$${revenue.toFixed(2)}`;
    document.getElementById('projectedCosts').textContent = `$${costs.toFixed(2)}`;
    document.getElementById('projectedProfit').textContent = `$${profit.toFixed(2)}`;
};

// ==========================================
// CLIENTS MANAGEMENT
// ==========================================
window.showAddClientModal = () => {
    document.getElementById('addClientModal').classList.add('active');
};

window.closeModal = (modalId) => {
    document.getElementById(modalId).classList.remove('active');
};

window.saveClient = async (e) => {
    e.preventDefault();

    const clientData = {
        name: document.getElementById('clientName').value,
        phone: document.getElementById('clientPhone').value,
        email: document.getElementById('clientEmail').value,
        address: document.getElementById('clientAddress').value,
        city: document.getElementById('clientCity').value,
        state: document.getElementById('clientState').value,
        zip: document.getElementById('clientZip').value
    };

    try {
        await saveClientToFirestore(clientData);
        closeModal('addClientModal');
        document.getElementById('addClientForm').reset();
        alert('Cliente guardado exitosamente');
    } catch (error) {
        alert('Error al guardar el cliente');
    }
};

function renderClients() {
    const grid = document.getElementById('clientsGrid');

    if (clients.length === 0) {
        grid.innerHTML = '<p class="empty-state">No hay clientes registrados. Agrega tu primer cliente.</p>';
        return;
    }

    grid.innerHTML = clients.map(client => `
        <div class="client-card">
            <h4>${client.name}</h4>
            <div class="client-info">
                <p><i data-lucide="phone" class="info-icon"></i> ${client.phone}</p>
                ${client.email ? `<p><i data-lucide="mail" class="info-icon"></i> ${client.email}</p>` : ''}
                ${client.address ? `<p><i data-lucide="map-pin" class="info-icon"></i> ${client.address}${client.city ? ', ' + client.city : ''}${client.state ? ', ' + client.state : ''}${client.zip ? ' ' + client.zip : ''}</p>` : ''}
            </div>
            <div class="client-actions">
                <button class="btn btn-secondary" onclick="deleteClient('${client.id}')">Eliminar</button>
            </div>
        </div>
    `).join('');

    // Re-initialize Lucide icons
    lucide.createIcons();
}

window.deleteClient = async (clientId) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
        await deleteClientFromFirestore(clientId);
    }
};

window.filterClients = () => {
    const searchTerm = document.getElementById('clientSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.client-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
};

// ==========================================
// CONTACT MESSAGES
// ==========================================
window.loadMessages = async () => {
    const list = document.getElementById('messagesList');
    if (!list) return;

    list.innerHTML = '<p>Cargando mensajes...</p>';

    try {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            list.innerHTML = '<p class="empty-state" style="text-align:center; padding:2rem; color:#888;">No hay mensajes nuevos.</p>';
            return;
        }

        list.innerHTML = '';
        snapshot.forEach(doc => {
            const msg = doc.data();
            const date = msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() : 'Reciente';

            const item = document.createElement('div');
            item.className = 'message-card';
            item.style.cssText = 'background: #2a2a2a; padding: 1.5rem; border-radius: 8px; border: 1px solid #444; margin-bottom: 1rem;';
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; border-bottom:1px solid #444; padding-bottom:0.5rem;">
                    <div>
                        <h4 style="color:#fff; margin:0 0 0.25rem 0; font-size:1.1rem;">${msg.subject || 'Sin Asunto'}</h4>
                        <span style="color:var(--gold-primary); font-size:0.9rem;">${msg.name} &lt;${msg.email}&gt;</span>
                    </div>
                    <span style="color:#666; font-size:0.85rem;">${date}</span>
                </div>
                <div style="background:#222; padding:1rem; border-radius:4px; color:#ccc; line-height:1.6; white-space:pre-wrap;">${msg.message}</div>
                <div style="margin-top:1rem; text-align:right;">
                    <button onclick="window.replyToMessage('${msg.email}')" style="background:#333; color:white; border:1px solid #555; padding:0.5rem 1rem; border-radius:4px; cursor:pointer; margin-right:0.5rem;">Responder</button>
                    <button onclick="deleteMessage('${doc.id}')" style="background:rgba(220, 53, 69, 0.2); color:#dc3545; border:1px solid #dc3545; padding:0.5rem 1rem; border-radius:4px; cursor:pointer;">Eliminar</button>
                </div>
            `;
            list.appendChild(item);
        });

    } catch (e) {
        console.error("Error loading messages:", e);
        list.innerHTML = '<p class="error">Error cargando mensajes. Verifica permisos.</p>';
    }
};

window.replyToMessage = (email) => {
    window.location.href = `mailto:${email}`;
};

window.deleteMessage = async (id) => {
    if (confirm('¿Estás seguro de eliminar este mensaje?')) {
        try {
            await deleteDoc(doc(db, 'messages', id));
            loadMessages();
        } catch (e) {
            console.error(e);
            alert('Error al borrar el mensaje');
        }
    }
};



function updateClientSelects() {
    const selects = ['posClient', 'orderClient'];

    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">-- Seleccionar Cliente --</option>' +
                clients.map(client => `<option value="${client.id}">${client.name}</option>`).join('');
            select.value = currentValue;
        }
    });
}

// ==========================================
// POS (Point of Sale)
// ==========================================
window.addToCart = () => {
    const productType = document.getElementById('productType').value;
    const quantity = parseInt(document.getElementById('productQuantity').value);

    let price = 0;
    let productName = '';

    switch (productType) {
        case '12':
            price = salesData.priceBox12;
            productName = 'Caja x12';
            break;
        case '24':
            price = salesData.priceBox24;
            productName = 'Caja x24';
            break;
        case '48':
            price = salesData.priceBox48;
            productName = 'Caja x48';
            break;
    }

    if (price === 0) {
        alert('Por favor configura los precios de venta primero');
        return;
    }

    cart.push({
        id: Date.now(),
        productName,
        productType,
        quantity,
        price,
        total: price * quantity
    });

    renderCart();
};

function renderCart() {
    const cartItemsDiv = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-state">El carrito está vacío</p>';
        document.getElementById('cartTotal').textContent = '$0.00';
        return;
    }

    cartItemsDiv.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <strong>${item.productName}</strong>
                <p>${item.quantity} x $${item.price.toFixed(2)}</p>
            </div>
            <div>
                <strong>$${item.total.toFixed(2)}</strong>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
}

window.removeFromCart = (itemId) => {
    cart = cart.filter(item => item.id !== itemId);
    renderCart();
};

window.generateReceipt = () => {
    const clientId = document.getElementById('posClient').value;

    if (!clientId) {
        alert('Por favor selecciona un cliente');
        return;
    }

    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    const client = clients.find(c => c.id === clientId);
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    const date = new Date().toLocaleString('es-ES');

    const receiptHTML = `
        <div class="receipt-header">
            <h2>HEAVEN</h2>
            <p>Café Premium en Cápsulas</p>
            <p style="font-size: 0.9em; margin-top: 10px;">${date}</p>
        </div>
        <div class="receipt-body">
            <p><strong>Cliente:</strong> ${client.name}</p>
            <p><strong>Teléfono:</strong> ${client.phone}</p>
            <hr style="border: 1px dashed #000; margin: 15px 0;">
            ${cart.map(item => `
                <div class="receipt-line">
                    <span>${item.productName} x${item.quantity}</span>
                    <span>$${item.total.toFixed(2)}</span>
                </div>
            `).join('')}
            <hr style="border: 1px dashed #000; margin: 15px 0;">
            <div class="receipt-line" style="font-size: 1.2em; font-weight: bold;">
                <span>TOTAL</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
        <div class="receipt-footer">
            <p>¡Gracias por su compra!</p>
            <p style="font-size: 0.8em; margin-top: 10px;">www.heaven.com</p>
        </div>
    `;

    document.getElementById('receiptContent').innerHTML = receiptHTML;
    document.getElementById('printBtn').style.display = 'block';
};

window.printReceipt = () => {
    const printContent = document.getElementById('receiptContent').innerHTML;
    const printWindow = window.open('', '', 'height=600,width=400');

    printWindow.document.write('<html><head><title>Recibo HEAVEN</title>');
    printWindow.document.write('<style>body{font-family: "Courier New", monospace; padding: 20px;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();

    // Clear cart after printing
    cart = [];
    renderCart();
    document.getElementById('posClient').value = '';
};

// ==========================================
// ORDERS MANAGEMENT
// ==========================================
window.showNewOrderModal = () => {
    document.getElementById('newOrderModal').classList.add('active');
};

window.saveOrder = async (e) => {
    e.preventDefault();

    const clientId = document.getElementById('orderClient').value;
    const productType = document.getElementById('orderProduct').value;
    const quantity = parseInt(document.getElementById('orderQuantity').value);
    const notes = document.getElementById('orderNotes').value;

    const client = clients.find(c => c.id === clientId);

    let productName = '';
    let price = 0;

    switch (productType) {
        case '12':
            productName = 'Caja x12';
            price = salesData.priceBox12;
            break;
        case '24':
            productName = 'Caja x24';
            price = salesData.priceBox24;
            break;
        case '48':
            productName = 'Caja x48';
            price = salesData.priceBox48;
            break;
    }

    const orderData = {
        orderNumber: `ORD-${Date.now()}`,
        clientId,
        clientName: client.name,
        productName,
        productType,
        quantity,
        price,
        total: price * quantity,
        notes,
        status: 'received'
    };

    try {
        await saveOrderToFirestore(orderData);
        closeModal('newOrderModal');
        document.getElementById('newOrderForm').reset();
        alert('Orden creada exitosamente');
    } catch (error) {
        alert('Error al crear la orden');
    }
};

function renderOrders() {
    const grid = document.getElementById('ordersGrid');

    const filteredOrders = currentOrderFilter === 'all'
        ? orders
        : orders.filter(order => order.status === currentOrderFilter);

    if (filteredOrders.length === 0) {
        grid.innerHTML = '<p class="empty-state">No hay órdenes en esta categoría</p>';
        return;
    }

    grid.innerHTML = filteredOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-number">${order.orderNumber}</span>
                <span class="order-status ${order.status}">${getStatusLabel(order.status)}</span>
            </div>
            <div class="order-info">
                <p><strong>Cliente:</strong> ${order.clientName}</p>
                <p><strong>Producto:</strong> ${order.productName} x${order.quantity}</p>
                <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ''}
            </div>
            <div class="order-actions">
                ${getOrderActions(order)}
            </div>
        </div>
    `).join('');
}

function getStatusLabel(status) {
    const labels = {
        received: 'Recibida',
        sales: 'En Ventas',
        packing: 'Empacado',
        delivery: 'Entrega',
        completed: 'Completada'
    };
    return labels[status] || status;
}

function getOrderActions(order) {
    const nextStatus = {
        received: 'sales',
        sales: 'packing',
        packing: 'delivery',
        delivery: 'completed'
    };

    if (order.status === 'completed') {
        return `<button class="btn btn-danger btn-small" onclick="deleteOrder('${order.id}')">Eliminar</button>`;
    }

    return `
        <button class="btn btn-primary" onclick="advanceOrder('${order.id}', '${nextStatus[order.status]}')">
            Avanzar
        </button>
        <button class="btn btn-danger" onclick="deleteOrder('${order.id}')">
            Eliminar
        </button>
    `;
}

window.advanceOrder = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
};

window.deleteOrder = async (orderId) => {
    if (confirm('¿Estás seguro de eliminar esta orden?')) {
        await deleteOrderFromFirestore(orderId);
    }
};

window.filterOrders = (status) => {
    currentOrderFilter = status;

    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-status') === status) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    renderOrders();
};

function updateOrderBadges() {
    const statusCounts = {
        all: orders.length,
        received: orders.filter(o => o.status === 'received').length,
        sales: orders.filter(o => o.status === 'sales').length,
        packing: orders.filter(o => o.status === 'packing').length,
        delivery: orders.filter(o => o.status === 'delivery').length,
        completed: orders.filter(o => o.status === 'completed').length
    };

    Object.keys(statusCounts).forEach(status => {
        const badge = document.getElementById(`badge${status.charAt(0).toUpperCase() + status.slice(1)}`);
        if (badge) {
            badge.textContent = statusCounts[status];
        }
    });
}

// ==========================================
// SETTINGS
// ==========================================
document.getElementById('companyForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const companyData = {
        name: document.getElementById('companyName').value,
        phone: document.getElementById('companyPhone').value,
        email: document.getElementById('companyEmail').value,
        address: document.getElementById('companyAddress').value
    };

    await saveCompanySettings(companyData);
});

window.clearAllData = async () => {
    if (!confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS tus datos de forma permanente. ¿Estás seguro?')) {
        return;
    }

    if (!confirm('Esta acción NO se puede deshacer. ¿Confirmas que quieres continuar?')) {
        return;
    }

    try {
        // Delete all clients
        for (const client of clients) {
            await deleteDoc(doc(db, 'clients', client.id));
        }

        // Delete all orders
        for (const order of orders) {
            await deleteDoc(doc(db, 'orders', order.id));
        }

        alert('Todos los datos han sido eliminados');
        await loadAllData();
    } catch (error) {
        console.error('Error eliminando datos:', error);
        alert('Error al eliminar los datos');
    }
};

// ==========================================
// DASHBOARD
// ==========================================
function updateDashboard() {
    // Calculate today's sales
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => {
        const orderDate = order.createdAt?.toDate?.()?.toDateString();
        return orderDate === today;
    });

    const todaySales = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    document.getElementById('todaySales').textContent = `$${todaySales.toFixed(2)}`;

    // Pending orders
    const pendingOrders = orders.filter(o => o.status !== 'completed').length;
    document.getElementById('pendingOrders').textContent = pendingOrders;

    // Active clients
    document.getElementById('activeClients').textContent = clients.length;

    // Month profit
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthOrders = orders.filter(order => {
        const orderDate = order.createdAt?.toDate?.();
        return orderDate && orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const monthCosts = monthOrders.reduce((sum, order) => {
        const qty = order.quantity || 0;
        const boxSize = parseInt(order.productType) || 12;
        return sum + (costsData.costPerCapsule * boxSize * qty);
    }, 0);
    const monthProfit = monthRevenue - monthCosts;

    document.getElementById('monthProfit').textContent = `$${monthProfit.toFixed(2)}`;

    // Update settings info
    document.getElementById('totalClients').textContent = clients.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('lastUpdate').textContent = new Date().toLocaleString('es-ES');

    // Recent orders list
    const recentOrders = orders.slice(0, 5);
    const recentOrdersList = document.getElementById('recentOrdersList');

    if (recentOrders.length === 0) {
        recentOrdersList.innerHTML = '<p class="empty-state">No hay órdenes recientes</p>';
    } else {
        recentOrdersList.innerHTML = recentOrders.map(order => `
            <div class="order-card" style="margin-bottom: 1rem;">
                <div class="order-header">
                    <span class="order-number">${order.orderNumber}</span>
                    <span class="order-status ${order.status}">${getStatusLabel(order.status)}</span>
                </div>
                <div class="order-info">
                    <p><strong>${order.clientName}</strong> - $${order.total.toFixed(2)}</p>
                </div>
            </div>
        `).join('');
    }
}

// ==========================================
// INITIALIZATION
// ==========================================
function loadInitialData() {
    loadAllData();
}

console.log('HEAVEN App initialized');
