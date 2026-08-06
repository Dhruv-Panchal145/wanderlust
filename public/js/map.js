document.addEventListener("DOMContentLoaded", function () {

  if (typeof maplibregl === "undefined") {
    console.error("MapLibre not loaded");
    return;
  }

  const mapDiv = document.getElementById("map"); // ✅ pehle define karo

  const lng = parseFloat(mapDiv.dataset.lng);
  const lat = parseFloat(mapDiv.dataset.lat);
  const apiKey = mapDiv.dataset.key; // ✅ baad mein use karo

  if (isNaN(lat) || isNaN(lng)) { // ✅ define hone ke baad check karo
    console.error("Invalid coordinates");
    return;
  }

  const region = "ap-south-1";

  console.log("lat:", lat, "lng:", lng);

  const map = new maplibregl.Map({
    container: "map",
    style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
    center: [lng, lat],
    zoom: 13,
  });

  new maplibregl.Marker({ color: "red" })
    .setLngLat([lng, lat])
    .addTo(map);

  map.addControl(new maplibregl.NavigationControl(), "top-left");
});