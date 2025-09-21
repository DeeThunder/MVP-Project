// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase Configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Get references to Firebase paths
const sensorDataRef = ref(database, 'sensor_data');
const socketControlRef = ref(database, 'manual_control/socket_toggle');
const chargingHistoryRef = ref(database, 'charging_history');

// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const connectionStatus = document.getElementById('connection-status');
const temperatureValue = document.getElementById('temperature-value');
const airQualityValue = document.getElementById('air-quality-value');
const fanStatus = document.getElementById('fan-status');
const socketStatus = document.getElementById('socket-status');
const socketToggleBtn = document.getElementById('socket-toggle-btn');
const chargingLog = document.getElementById('charging-log');

// Global variables
let isConnected = false;
let lastUpdateTime = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Smart Socket Dashboard initialized');
    initializeEventListeners();
    initializeFirebaseListeners();
    testConnection();
});

// Initialize event listeners
function initializeEventListeners() {
    // Theme Toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Socket Toggle
    socketToggleBtn.addEventListener('click', toggleSocket);
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
}

// Theme toggle function
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // Add success animation
    themeToggleBtn.classList.add('success-animation');
    setTimeout(() => {
        themeToggleBtn.classList.remove('success-animation');
    }, 300);
}

// Connection Status Update
function updateConnectionStatus(connected) {
    isConnected = connected;
    
    if (connected) {
        connectionStatus.textContent = '🟢 Connected to Firebase';
        connectionStatus.className = 'connection-status connected';
        socketToggleBtn.disabled = false;
    } else {
        connectionStatus.textContent = '🔴 Disconnected from Firebase';
        connectionStatus.className = 'connection-status disconnected';
        socketToggleBtn.disabled = true;
    }
}

// Initialize Firebase listeners
function initializeFirebaseListeners() {
    // Listen for sensor data updates
    onValue(sensorDataRef, (snapshot) => {
        const data = snapshot.val();
        console.log('Sensor data received:', data);
        
        if (data) {
            updateConnectionStatus(true);
            updateSensorData(data);
            lastUpdateTime = new Date();
        }
    }, (error) => {
        console.error('Error reading sensor data:', error);
        updateConnectionStatus(false);
        handleFirebaseError('sensor data', error);
    });

    // Listen for charging history updates
    onValue(chargingHistoryRef, (snapshot) => {
        const historyData = snapshot.val();
        console.log('Charging history received:', historyData);
        updateChargingHistory(historyData);
    }, (error) => {
        console.error('Error reading charging history:', error);
        handleChargingHistoryError();
    });
}

// Update sensor data display
function updateSensorData(data) {
    // Update temperature with animation
    if (data.temperature !== undefined) {
        const tempElement = temperatureValue;
        tempElement.classList.add('loading');
        setTimeout(() => {
            tempElement.textContent = `${data.temperature.toFixed(1)}°C`;
            tempElement.classList.remove('loading');
            
            // Add warning class for high temperature
            if (data.temperature > 30) {
                tempElement.style.color = '#ff6384';
            } else {
                tempElement.style.color = 'var(--glow-color)';
            }
        }, 200);
    }
    
    // Update air quality
    if (data.air_quality !== undefined) {
        const airElement = airQualityValue;
        airElement.classList.add('loading');
        setTimeout(() => {
            airElement.textContent = `${data.air_quality}`;
            airElement.classList.remove('loading');
            
            // Add warning class for poor air quality
            if (data.air_quality > 2000) {
                airElement.style.color = '#ff6384';
            } else {
                airElement.style.color = 'var(--glow-color)';
            }
        }, 300);
    }
    
    // Update fan status with animation
    if (data.fan_status !== undefined) {
        setTimeout(() => {
            fanStatus.textContent = data.fan_status ? 'ON' : 'OFF';
            fanStatus.classList.toggle('active', data.fan_status);
            
            if (data.fan_status) {
                fanStatus.classList.add('success-animation');
                setTimeout(() => fanStatus.classList.remove('success-animation'), 300);
            }
        }, 100);
    }
    
    // Update socket status with animation
    if (data.socket_status !== undefined) {
        setTimeout(() => {
            socketStatus.textContent = data.socket_status ? 'ON' : 'OFF';
            socketStatus.classList.toggle('active', data.socket_status);
            
            if (data.socket_status) {
                socketStatus.classList.add('success-animation');
                setTimeout(() => socketStatus.classList.remove('success-animation'), 300);
            }
        }, 150);
    }
    
    // Log timestamp if available
    if (data.timestamp) {
        console.log('Last ESP32 update:', data.timestamp);
    }
}

// Update charging history display
function updateChargingHistory(historyData) {
    if (historyData) {
        const entries = Object.entries(historyData)
            .sort((a, b) => b[0].localeCompare(a[0])) // Sort by timestamp descending
            .slice(0, 15); // Show only last 15 entries
        
        if (entries.length > 0) {
            chargingLog.innerHTML = entries.map(([timestamp, data]) => {
                const formattedTime = formatTimestamp(timestamp);
                const status = data.status || 'charging';
                const duration = calculateDuration(timestamp);
                
                return `
                    <div class="log-entry">
                        <span class="timestamp">${formattedTime}</span><br>
                        <small>Status: ${status.toUpperCase()} | ${duration}</small>
                    </div>
                `;
            }).join('');
        } else {
            chargingLog.innerHTML = '<p style="text-align: center; color: var(--text-color); opacity: 0.7;">No charging history available</p>';
        }
    } else {
        chargingLog.innerHTML = '<p style="text-align: center; color: var(--text-color); opacity: 0.7;">No charging history available</p>';
    }
}

// Format timestamp for display
function formatTimestamp(timestamp) {
    try {
        // Convert format: 2025-09-21_23-59-35 to readable format
        const parts = timestamp.split('_');
        if (parts.length === 2) {
            const datePart = parts[0].replace(/-/g, '/');
            const timePart = parts[1].replace(/-/g, ':');
            return `${datePart} ${timePart}`;
        }
        return timestamp.replace('_', ' ').replace(/-/g, '/');
    } catch (error) {
        return timestamp;
    }
}

// Calculate duration since timestamp
function calculateDuration(timestamp) {
    try {
        const parts = timestamp.split('_');
        if (parts.length === 2) {
            const datePart = parts[0];
            const timePart = parts[1].replace(/-/g, ':');
            const dateTime = new Date(`${datePart}T${timePart}`);
            const now = new Date();
            const diffMs = now - dateTime;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            if (diffHours > 0) {
                return `${diffHours}h ${diffMins}m ago`;
            } else if (diffMins > 0) {
                return `${diffMins}m ago`;
            } else {
                return 'Just now';
            }
        }
        return 'Recently';
    } catch (error) {
        return 'Recently';
    }
}

// Socket toggle functionality
async function toggleSocket() {
    if (!isConnected) {
        showNotification('Not connected to Firebase. Please wait...', 'error');
        return;
    }
    
    try {
        // Disable button and show loading state
        socketToggleBtn.disabled = true;
        socketToggleBtn.textContent = 'Toggling...';
        socketToggleBtn.classList.add('loading');
        
        // Set the toggle flag in Firebase
        await set(socketControlRef, true);
        console.log('Socket toggle command sent successfully');
        
        showNotification('Socket toggle command sent!', 'success');
        
        // Re-enable button after a delay
        setTimeout(() => {
            socketToggleBtn.disabled = false;
            socketToggleBtn.textContent = 'Toggle Socket';
            socketToggleBtn.classList.remove('loading');
        }, 2000);
        
    } catch (error) {
        console.error('Error toggling socket:', error);
        showNotification('Failed to toggle socket. Please try again.', 'error');
        
        // Re-enable button immediately on error
        socketToggleBtn.disabled = false;
        socketToggleBtn.textContent = 'Toggle Socket';
        socketToggleBtn.classList.remove('loading');
    }
}

// Show notification to user
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#00ff6e';
        notification.style.boxShadow = '0 0 15px rgba(0, 255, 110, 0.4)';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ff6384';
        notification.style.boxShadow = '0 0 15px rgba(255, 99, 132, 0.4)';
    } else {
        notification.style.backgroundColor = 'var(--glow-color)';
        notification.style.boxShadow = '0 0 15px rgba(0, 210, 255, 0.4)';
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Handle Firebase errors
function handleFirebaseError(context, error) {
    console.error(`Firebase error in ${context}:`, error);
    showNotification(`Error loading ${context}`, 'error');
}

// Handle charging history errors
function handleChargingHistoryError() {
    chargingLog.innerHTML = '<p style="text-align: center; color: #ff6384;">Error loading charging history</p>';
}

// Test Firebase connection
async function testConnection() {
    try {
        console.log('Testing Firebase connection...');
        const snapshot = await get(sensorDataRef);
        console.log('Firebase connection test successful');
        updateConnectionStatus(true);
        
        // If we have data, display it immediately
        if (snapshot.exists()) {
            const data = snapshot.val();
            updateSensorData(data);
        }
        
    } catch (error) {
        console.error('Firebase connection test failed:', error);
        updateConnectionStatus(false);
        showNotification('Failed to connect to Firebase', 'error');
    }
}

// Auto-refresh connection every 30 seconds
setInterval(() => {
    if (!isConnected) {
        console.log('Retrying Firebase connection...');
        testConnection();
    }
}, 30000);

// Update last seen indicator
setInterval(() => {
    if (lastUpdateTime) {
        const timeDiff = Math.floor((new Date() - lastUpdateTime) / 1000);
        if (timeDiff > 30) { // If no update for 30 seconds
            updateConnectionStatus(false);
        }
    }
}, 5000);