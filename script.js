// Import Firebase and Chart.js functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import 'https://cdn.jsdelivr.net/npm/chart.js';

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Firebase Project Configuration
    const firebaseConfig = {
      apiKey: "AIzaSyBdxqutV_IxDNWC6TwuSS9qlMYXeIaGx3M",
      authDomain: "smart-charging-socket-18a2f.firebaseapp.com",
      projectId: "smart-charging-socket-18a2f",
      storageBucket: "smart-charging-socket-18a2f.firebasestorage.app",
      messagingSenderId: "985649396695",
      appId: "1:985649396695:web:be3394e38ab343ce8ee992",
      measurementId: "G-BRSTL9SWZW"
    };

    // Initialize Firebase and the database service
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    // Get a reference to the specific database path where the ESP32 sends sensor data
    const sensorDataRef = ref(database, 'sensor_data');

    // Get a reference for manual fan control
    const fanControlRef = ref(database, 'manual_control/fan_toggle');

    // 2. Real-time Data Listener for Sensor Data
    onValue(sensorDataRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('temperature-value').textContent = `${data.temperature.toFixed(1)}°C`;
            document.getElementById('air-quality-value').textContent = `${data.air_quality} ppm`;

            const fanStatusEl = document.getElementById('fan-status');
            fanStatusEl.textContent = data.fan_status ? 'ON' : 'OFF';
            fanStatusEl.classList.toggle('active', data.fan_status);

            const socketStatusEl = document.getElementById('socket-status');
            socketStatusEl.textContent = data.is_charging ? 'CHARGING' : 'NOT IN USE';
            socketStatusEl.classList.toggle('active', data.is_charging);
        } else {
            // Display a message if no data is available
            document.getElementById('temperature-value').textContent = '-- °C';
            document.getElementById('air-quality-value').textContent = '-- ppm';
            document.getElementById('fan-status').textContent = 'OFFLINE';
            document.getElementById('socket-status').textContent = 'OFFLINE';
        }
    });

    // 3. Chart Setup and Data Listener
    const ctx = document.getElementById('charging-chart').getContext('2d');
    let chargingChart = new Chart(ctx, {
        type: 'line', // Line chart is often better for time-series data
        data: {
            labels: [],
            datasets: [{
                label: 'Charging Duration (minutes)',
                data: [],
                backgroundColor: 'rgba(0, 210, 255, 0.5)',
                borderColor: 'rgba(0, 210, 255, 1)',
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

    const chargingHistoryRef = ref(database, 'charging_history');
    onValue(chargingHistoryRef, (snapshot) => {
        const historyData = snapshot.val();
        if (historyData) {
            const labels = Object.keys(historyData);
            const dataPoints = Object.values(historyData).map(item => item.duration);

            chargingChart.data.labels = labels;
            chargingChart.data.datasets[0].data = dataPoints;
            chargingChart.update();
        }
    });

    // 4. User Interaction - Manual Fan Toggle
    document.getElementById('fan-toggle-btn').addEventListener('click', () => {
        // Send a boolean value to the database to toggle the fan
        set(fanControlRef, true);
        alert('Toggling fan status via manual control!');
    });
});