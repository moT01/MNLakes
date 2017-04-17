var width = window.innerWidth-10, height = window.innerHeight-10;
document.getElementById('map').style.width = width + 'px';
document.getElementById('map').style.height = height + 'px';
document.getElementById('menu').style.left = width - 110 + 'px';

var map = L.map('map').setView([46.3924658,-93.5], 7);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
        minZoom: 6,
		id: 'mapbox.streets'
	}).addTo(map);

L.tileLayer('http://maps1.dnr.state.mn.us/mapcache/gmaps/lakefinder@mn_google/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 6,
	}).addTo(map);

fetch('testing2.json')
    .then((resp) => resp.json())
    .then((data) => {    
        console.log(data);
    
    var lakes = L.geoJson(data,{
        pointToLayer: function(feature,LatLng){
            var marker = L.marker(LatLng);
            marker.bindTooltip('Lake Name');
            marker.bindPopup('Lake Stats');
            return marker;
        }
    });
    var clusters = L.markerClusterGroup({
        showCoverageOnHover: false
    });
        clusters.addLayer(lakes);
        map.addLayer(clusters);
    map.setMaxBounds([
        [46.3924658, -93.5],
        [46.3924658, -93.5]
    ]);

}).catch(function(error) {
    console.log('error');
}); //end fetch