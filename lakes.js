var changeLayer, lakeMarkers, hasLayer = false, width = window.innerWidth-10, height = window.innerHeight-10;
document.getElementById('map').style.width = width + 'px';
document.getElementById('map').style.height = height + 'px';
document.getElementById('menu').style.left = width - 150 + 'px';

var land = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', { id: 'mapbox.streets' });
var lakeFeatures = L.tileLayer('https://maps1.dnr.state.mn.us/mapcache/gmaps/lakefinder@mn_google/{z}/{x}/{y}.png');

var map = L.map('map', {
    center: [46.3924658,-93.5],
    zoom: 6,
    maxZoom: 16,
    minZoom: 4,
    layers: [land, lakeFeatures],
    maxBounds:([
        [20, -135],
        [60, -55]
    ])
});

var clusters = L.markerClusterGroup({
    showCoverageOnHover: false
}); //end L.markerClusterGroup
map.addLayer(clusters);
        
fetch('allLakes.json')
    .then((resp) => resp.json())
    .then((json) => {
 
    changeLayer = function(species) {
        if(hasLayer) {
            clusters.removeLayer(lakeMarkers);
        }
        lakeMarkers = L.geoJson(json,{
            pointToLayer: function(feature,LatLng){
                var marker = L.marker(LatLng);
                marker.bindTooltip(feature.properties.name);
                marker.bindPopup('<div class="name">'+feature.properties.name+'</div><br>Acres: '+feature.properties.acres+'<br>Littoral Acres: '+feature.properties.littoralAcres+'<br>Average Depth: '+feature.properties.averageDepth+'\'<br>Max Depth: '+feature.properties.maxDepth+'\'<br>Water Clarity: '+feature.properties.waterClarity+'\'<br>Shoreline Miles: '+feature.properties.shorelineMiles+' miles');
                for(var i=0; i<feature.properties.fishSpecies.length; i++) {
                    if(feature.properties.fishSpecies[i] == species) {
                        return marker;
                    } else if (species == "bullhead") {
                        if (feature.properties.fishSpecies[i] == ("black bullhead" || "brown bullhead" || "yellow bullhead")) {
                            return marker;
                        }
                    } else if (species == "sunfish") {
                        if (feature.properties.fishSpecies[i] == ("hybrid sunfish" || "green sunfish" || "pumpkinseed" || "bluegill")) {
                            return marker;
                        }
                    }else if (species == "crappie") {
                        if (feature.properties.fishSpecies[i] == ("black crappie" || "white crappie")) {
                            return marker;
                        }
                    } else if (species == "carp") {
                        if (feature.properties.fishSpecies[i] == ("white sucker" || "common carp" || "bigmouth buffalo" || "shorthead redhorse" || "silver redhorse")) {
                            return marker;
                        }
                    } else if (species == "all lakes") {
                        return marker;
                    }
                } //end for (i)
            }//end pointToLayer()
        }); //end L.geoJson
        clusters.addLayer(lakeMarkers);
        hasLayer = true;
    } //end changeLayer()             
}).catch(function(error) {
    console.log('error');
}); //end fetch