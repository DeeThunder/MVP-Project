  // Import the functions you need from the SDKs you need

  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";

  // TODO: Add SDKs for Firebase products that you want to use

  // https://firebase.google.com/docs/web/setup#available-libraries



  // Your web app's Firebase configuration

  // For Firebase JS SDK v7.20.0 and later, measurementId is optional

  const firebaseConfig = {
    apiKey: "AIzaSyBdxqutV_IxDNWC6TwuSS9qlMYXeIaGx3M",
    authDomain: "smart-charging-socket-18a2f.firebaseapp.com",
    projectId: "smart-charging-socket-18a2f",
    storageBucket: "smart-charging-socket-18a2f.firebasestorage.app",
    messagingSenderId: "985649396695",
    appId: "1:985649396695:web:be3394e38ab343ce8ee992",
    measurementId: "G-BRSTL9SWZW"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);