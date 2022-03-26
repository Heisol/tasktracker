/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  env: {
    apiKey: "AIzaSyAxJL1Z5o9qNryRClchNvsX-yVEk2A_gtw",
    authDomain: "tasktracker-d1d48.firebaseapp.com",
    projectId: "tasktracker-d1d48",
    storageBucket: "tasktracker-d1d48.appspot.com",
    messagingSenderId: "259293364929",
    appId: "1:259293364929:web:9d1c68632779823c71ca40"
  }
}

module.exports = nextConfig
