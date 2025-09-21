// Import Firebase and Chart.js functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import 'https://cdn.jsdelivr.net/npm/chart.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });
    }

    // 2. Firebase Project Configuration
    const firebaseConfig = {
    apiKey: "AIzaSyBdxqutV_IxDNWC6TwuSS9qlMYXeIaGx3M",
    authDomain: "smart-charging-socket-18a2f.firebaseapp.com",
    databaseURL: "https://smart-charging-socket-18a2f-default-rtdb.firebaseio.com",
    projectId: "smart-charging-socket-18a2f",
    storageBucket: "smart-charging-socket-18a2f.firebasestorage.app",
    messagingSenderId: "985649396695",
    appId: "1:985649396695:web:8201ae81e27dc3748ee992",
    measurementId: "G-GVKE1GC81V"
  };


    // Initialize Firebase and the database service
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);


    // Get a reference to the specific database paths
    const sensorDataRef = ref(database, 'sensor_data');
    const socketControlRef = ref(database, 'manual_control/socket_toggle');
    const chargingHistoryRef = ref(database, 'charging_history');

    // 3. Real-time Data Listener for Sensor Data
    onValue(sensorDataRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('temperature-value').textContent = `${data.temperature.toFixed(1)}°C`;
            document.getElementById('air-quality-value').textContent = `${data.air_quality} ppm`;

            const fanStatusEl = document.getElementById('fan-status');
            fanStatusEl.textContent = data.fan_status ? 'ON' : 'OFF';
            fanStatusEl.classList.toggle('active', data.fan_status);

            const socketStatusEl = document.getElementById('socket-status');
            socketStatusEl.textContent = data.socket_status ? 'ON' : 'OFF';
            socketStatusEl.classList.toggle('active', data.socket_status);
        }
    });

    // 4. Chart Setup and Data Listener
    const ctx = document.getElementById('socket-chart').getContext('2d');
    let socketChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Socket Status',
                data: [],
                backgroundColor: 'rgba(0, 255, 110, 0.5)',
                borderColor: 'rgba(0, 255, 110, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                x: { ticks: { color: 'white' }, grid: { display: false } }
            }
        }
    });

    onValue(chargingHistoryRef, (snapshot) => {
        const historyData = snapshot.val();
        if (historyData) {
            const labels = Object.keys(historyData);
            const dataPoints = Object.values(historyData).map(item => item.duration);
            socketChart.data.labels = labels;
            socketChart.data.datasets[0].data = dataPoints;
            socketChart.update();
        }
    });

    // 5. User Interaction - Manual Socket Toggle
    document.getElementById('socket-toggle-btn').addEventListener('click', () => {
        set(socketControlRef, true);
    });
});