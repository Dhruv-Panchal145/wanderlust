document.addEventListener("DOMContentLoaded", function () {

  if (typeof maplibregl === "undefined") {
    console.error("MapLibre not loaded");
    return;
  }

  const apiKey = process.env.AWS_TOKEN;
  const region = "ap-south-1";

  const mapDiv = document.getElementById("map");
  
  const lng = parseFloat(mapDiv.dataset.lng);
  const lat = parseFloat(mapDiv.dataset.lat);

  console.log("lat:", lat, "lng:", lng);

  const map = new maplibregl.Map({
    container: "map",
    style: `https://maps.geo.${region}.amazonaws.com/v2/styles/Standard/descriptor?key=${apiKey}`,
    center: [lng, lat],
    zoom: 13,
  });

  new maplibregl.Marker({ color: "red" })
    .setLngLat([lng, lat])
    .addTo(map);

  map.addControl(new maplibregl.NavigationControl(), "top-left");
});