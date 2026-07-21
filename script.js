let salesChartInstance = null;
let productsChartInstance = null;
let trafficChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    loadData();
    document.getElementById("date-filter").addEventListener("change", loadData);
    document.getElementById("refresh-btn").addEventListener("click", loadData);
    setupViewRouting();
    setupProfileFormValidation();
});

function setupViewRouting() {
    const btnOverview = document.getElementById("nav-overview");
    const btnProfile = document.getElementById("nav-profile");
    const viewOverview = document.getElementById("view-overview");
    const viewProfile = document.getElementById("view-profile");

    btnOverview.addEventListener("click", () => {
        viewOverview.classList.remove("d-none");
        viewProfile.classList.add("d-none");
        btnOverview.classList.add("active");
        btnOverview.classList.remove("text-white-50");
        btnProfile.classList.remove("active");
        btnProfile.classList.add("text-white-50");
        closeMobileSidebar();
    });

    btnProfile.addEventListener("click", () => {
        viewOverview.classList.add("d-none");
        viewProfile.classList.remove("d-none");
        btnProfile.classList.add("active");
        btnProfile.classList.remove("text-white-50");
        btnOverview.classList.remove("active");
        btnOverview.classList.add("text-white-50");
        closeMobileSidebar();
    });
}

function closeMobileSidebar() {
    const sidebarEl = document.getElementById('sidebarMenu');
    const instance = bootstrap.Offcanvas.getInstance(sidebarEl);
    if (instance) instance.hide();
}

function setupProfileFormValidation() {
    const form = document.getElementById("profileForm");
    const successMsg = document.getElementById("successMessage");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let isFormValid = true;

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const phoneInput = document.getElementById("phone");
        const bioInput = document.getElementById("bio");

        if (nameInput.value.trim() === "") {
            showInputError(nameInput, "Full Name is required.");
            isFormValid = false;
        } else {
            clearInputError(nameInput);
        }

        const emailValue = emailInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailValue === "") {
            showInputError(emailInput, "Email address is required.");
            isFormValid = false;
        } else if (!emailPattern.test(emailValue)) {
            showInputError(emailInput, "Please enter a valid email address.");
            isFormValid = false;
        } else {
            clearInputError(emailInput);
        }

        const phoneValue = phoneInput.value.trim();
        if (phoneValue === "") {
            showInputError(phoneInput, "Phone number is required.");
            isFormValid = false;
        } else if (phoneValue.length < 10) {
            showInputError(phoneInput, "Phone number must be at least 10 digits.");
            isFormValid = false;
        } else {
            clearInputError(phoneInput);
        }

        if (bioInput.value.trim() === "") {
            showInputError(bioInput, "Bio field cannot be left blank.");
            isFormValid = false;
        } else {
            clearInputError(bioInput);
        }

        if (isFormValid) {
            successMsg.classList.remove("d-none");
            form.reset();
            [nameInput, emailInput, phoneInput, bioInput].forEach(input => {
                input.parentNode.classList.remove("invalid");
            });
            setTimeout(() => { successMsg.classList.add("d-none"); }, 4000);
        } else {
            successMsg.classList.add("d-none");
        }
    });
}

function showInputError(inputElement, errorMessageString) {
    const groupBlock = inputElement.closest(".form-group-underline");
    groupBlock.classList.add("invalid");
    const errorTextContainer = groupBlock.querySelector(".error-msg");
    if (errorTextContainer) errorTextContainer.innerText = errorMessageString;
}

function clearInputError(inputElement) {
    const groupBlock = inputElement.closest(".form-group-underline");
    groupBlock.classList.remove("invalid");
    const errorTextContainer = groupBlock.querySelector(".error-msg");
    if (errorTextContainer) errorTextContainer.innerText = "";
}

function loadData() {
    showLoader();
    fetch("data.json")
        .then(response => {
            if (!response.ok) throw new Error("Network error.");
            return response.json();
        })
        .then(data => {
            const activeFilter = document.getElementById("date-filter").value;
            const simulatedData = applyFilterSimulation(data, activeFilter);
            updateCards(simulatedData);
            createSalesChart(simulatedData.weeklySales);
            createProductsChart(simulatedData.products);
            createTrafficChart(simulatedData.traffic);
            setTimeout(hideLoader, 400); 
        })
        .catch(error => {
            console.error("Error configuration data:", error);
            hideLoader();
        });
}

function showLoader() {
    document.getElementById("loader").classList.remove("d-none");
    document.getElementById("dashboard-content").classList.add("d-none");
}

function hideLoader() {
    document.getElementById("loader").classList.add("d-none");
    document.getElementById("dashboard-content").classList.remove("d-none");
}

function updateCards(data) {
    document.getElementById("kpi-revenue").innerText = `$${data.revenue.toLocaleString()}`;
    document.getElementById("kpi-orders").innerText = data.orders.toLocaleString();
    document.getElementById("kpi-customers").innerText = data.customers.toLocaleString();
    document.getElementById("kpi-conversion").innerText = data.conversion;
}

function createSalesChart(salesData) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    if (salesChartInstance) salesChartInstance.destroy();
    salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Sales ($)',
                data: salesData,
                borderColor: '#6a89cc',
                backgroundColor: 'rgba(106, 137, 204, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { grid: { display: false }, ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } }
        }
    });
}

function createProductsChart(productsData) {
    const ctx = document.getElementById('productsChart').getContext('2d');
    if (productsChartInstance) productsChartInstance.destroy();
    productsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(productsData),
            datasets: [{
                data: Object.values(productsData),
                backgroundColor: ['#b8263f', '#6a89cc', '#0dcaf0', '#ffc107'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } }
        }
    });
}

function createTrafficChart(trafficData) {
    const ctx = document.getElementById('trafficChart').getContext('2d');
    if (trafficChartInstance) trafficChartInstance.destroy();
    trafficChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(trafficData),
            datasets: [{
                data: Object.values(trafficData),
                backgroundColor: ['#b8263f', '#20c997', '#ffc107', '#6a89cc'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#fff', boxWidth: 10 } } }
        }
    });
}

function applyFilterSimulation(baseData, filter) {
    let modifier = 1.0;
    if (filter === 'today') modifier = 0.15;
    if (filter === '30days') modifier = 3.8;
    if (filter === 'year') modifier = 12.4;
    if (modifier === 1.0) return baseData;
    return {
        revenue: Math.round(baseData.revenue * modifier),
        orders: Math.round(baseData.orders * modifier),
        customers: Math.round(baseData.customers * modifier),
        conversion: baseData.conversion,
        weeklySales: baseData.weeklySales.map(val => Math.round(val * modifier)),
        products: Object.fromEntries(Object.entries(baseData.products).map(([k, v]) => [k, Math.round(v * modifier)])),
        traffic: baseData.traffic
    };
}