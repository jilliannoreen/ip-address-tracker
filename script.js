/**
 * Initialize Leaflet map centered at a default location.
 * Zoom control is removed for a cleaner UI.
 */
const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ',
  maxZoom: 19
}).addTo(map);

map.removeControl(map.zoomControl); // Optional: remove default zoom control

/**
 * Custom icon used for the IP location marker
 */
const myIcon = L.icon({
  iconUrl: 'images/icon-location.svg',
  iconSize: [46, 56],      // Width, height
  iconAnchor: [22, 94],    // Point of the icon that corresponds to the marker's location
  popupAnchor: [-3, -76]   // Point from which the popup opens relative to the iconAnchor
});

/**
 * Marker placed on the map with the custom icon
 */
const marker = L.marker([51.5, -0.09], { icon: myIcon }).addTo(map);

/**
 * Fetches location data based on IP address using ip-api.com.
 *
 * @param {string} [ip=""] - Optional IP address to query. If empty, fetches the user's current IP info.
 * @returns {Promise<Object>} - A promise resolving to location data.
 */
async function fetchIpInfo(ip = "") {
  return fetch(`https://ipapi.co/json/${ip}`) // Use HTTPS for security
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch IP info');
      return res.json();
    });
}

/**
 * Handles the "Submit" action triggered by a button or the Enter key.
 * Fetches location data based on the input IP address and updates the UI.
 */
function submitIpAddress() {
  const ip = document.getElementById("ip-address-input").value.trim();
  if (!ip) return;

  fetchIpInfo(ip)
    .then(display)
    .catch(err => console.error('Error:', err));
}

/**
 * Displays location data in the UI and updates the map position and marker.
 *
 * @param {Object} data - The data object returned by ip-api.
 * @param {string} data.ip - The queried IP address.
 * @param {string} data.city - City name.
 * @param {string} data.country_code - 2-letter country code.
 * @param {string} data.postal - ZIP/postal code.
 * @param {string} data.timezone - Timezone name.
 * @param {string} data.isp - Internet service provider.
 * @param {number} data.latitude - Latitude.
 * @param {number} data.longitude - Longitude.
 */
function display(data) {
  updateElement("ip-address", data.ip);
  updateElement("location", `${data.city}, ${data.country_code} ${data.postal}`);
  updateElement("timezone", data.timezone);
  updateElement("isp", data.isp);

  // Update map view and marker position
  const latlng = [data.latitude, data.longitude];
  map.panTo(latlng);
  marker.setLatLng(latlng, {animate: true});
}

/**
 * Updates the text content of an HTML element by ID.
 *
 * @param {string} id - The ID of the HTML element.
 * @param {string} value - The text to set.
 */
function updateElement(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// 📌 Fetch user's current IP info on page load
fetchIpInfo().then(display).catch(err => console.error('Error:', err));

// 🎯 Allow pressing "Enter" to submit the IP address
document.getElementById("ip-address-input")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission or default behavior
      submitIpAddress();
    }
  });