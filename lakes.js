var changeLayer, lakeMarkers, hasLayer = false, width = window.innerWidth-10, height = window.innerHeight-10;
var speciesCodes = {"WAE":"walleye","SAR":"walleye","NOP":"northern pike", "MUE":"muskellunge", "TME":"tiger muskellunge", "CCF":"channel catfish", "FCF":"flathead catfish", "SMB":"smallmouth bass", "LMB":"largemouth bass", "WHB":"white bass", "RKB":"rock bass", "BLC":"crappie", "WHC":"crappie","BLG":"sunfish","PMK":"sunfish","HSF":"sunfish","SUN":"sunfish","GSF":"sunfish","YEP":"yellow perch","BRB":"bullhead","BLB":"bullhead","YEB":"bullhead","LAT":"lake trout","BNT":"brown trout","BKT":"brook trout","RBT":"rainbow trout","LKS":"lake sturgeon","LKW":"lake whitefish","BUB":"burbot","BOF":"bowfin (dogfish)","WTS":"carp","SHR":"carp","CAP":"carp","GLR":"carp","BIB":"carp","SLR":"carp","GRR":"carp"};                                
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
        
fetch('https://firebasestorage.googleapis.com/v0/b/lakes-f76ce.appspot.com/o/surveyTest_xaa.geojson?alt=media&token=7ee7db7c-212c-4b45-9fd4-022209c980c9')
    .then((resp) => resp.json())
    .then((json) => {
    
    fetch('averageResults.json')
        .then((resp) => resp.json())
        .then((averages) => {

        changeLayer = function(species) {
            if(hasLayer) {
                clusters.removeLayer(lakeMarkers);
            }
            lakeMarkers = L.geoJson(json,{
                pointToLayer: function(feature,LatLng){
                    var marker = L.marker(LatLng);
                    marker.bindTooltip(feature.properties.name);
                    var segmentWidth = 160 / feature.properties.surveys.length-1, quantityLine = "M0 ", qualityLine = "M0 ";

                    for (var j=0; j<feature.properties.surveys.length; j++) { //go through each survey
                        var quantity = 0, quality = 0, trapTypes = [], speciesFound = false;
                        for (var k=0; k<feature.properties.surveys[j].fishCatchSummaries.length; k++) { //go through the summaries
                            if((speciesCodes[feature.properties.surveys[j].fishCatchSummaries[k].species] == species) && (feature.properties.surveys[j].fishCatchSummaries[k].gear == ('Standard gill nets' || 'Standard trap nets' || 'Standard electrofishing' || 'Standard trawling' || 'Survey seining'))) { //if the species of the survey equals the species selected
                                quantity += parseFloat(feature.properties.surveys[j].fishCatchSummaries[k].CPUE);
                                quality += parseFloat(feature.properties.surveys[j].fishCatchSummaries[k].averageWeight);
                                trapTypes.push(feature.properties.surveys[j].fishCatchSummaries[k].gear);
                                speciesFound = true;
                            } //end if (species match)
                        } //end for (k)

                        var averageCPUE = 0, averageWeight = 0;
                        for (var m=0; m<trapTypes.length; m++) {
                            averageCPUE += averages[trapTypes[m]][species + ' average CPUE'];
                            averageWeight += averages[trapTypes[m]][species + ' average weight'];
                        }
                        
                        var x = segmentWidth*j, y1 = quantity / averageCPUE, y2 = quality / averageWeight;
                        
                        function translate (y) {
                            var newY = 120-(120*(y/3));
                            return newY;
                        }
                        
                       if (y1 > 3) {
                            y1 = 3; }
                        if (y2 > 3) {
                            y2 = 3; }
                        if (y1 == NaN) {
                            y1 = 120; }
                        if (y2 == NaN) {
                            y2 = 120; }
                        
                        if(speciesFound) {
                            if(feature.properties.surveys.length == 1) { //just one survey
                                quantityLine += translate(y1) + ' L160 ' + translate(y1);  
                                qualityLine += translate(y2) + 'L160 ' + translate(y2);
                            } else {
                                if (x == 0) {
                                    quantityLine += translate(y1) + ' ';
                                    qualityLine += translate(y2) + ' ';
                                } else {
                                    quantityLine += 'L' + x + ' ' + translate(y1) + ' ';
                                    qualityLine += 'L' + x + ' ' + translate(y2) + ' ';
                                }
                            }
                        } else { //if (!speciesFound) end if (speciesFound)
                            if (x == 0) {
                                quantityLine += '120 ';
                                qualityLine += '120 ';
                            } else {
                                quantityLine += 'L' + x + ' 120 ';
                                qualityLine += 'L' + x + ' 120 ';
                            }
                        }
                    } //end for (j)
                    
                    var popupContent = '<div class="center bold">'+feature.properties.name+'</div>';
                        popupContent += '<br>Acres: '+feature.properties.acres+'<br>';
                        popupContent += 'Littoral Acres: '+feature.properties.littoralAcres+'<br>';
                        popupContent += 'Average Depth: '+feature.properties.averageDepth+'\'<br>';
                        popupContent += 'Max Depth: '+feature.properties.maxDepth+'\'<br>';
                        popupContent += 'Water Clarity: '+feature.properties.waterClarity+'\'<br>';
                        popupContent += 'Shoreline Miles: '+feature.properties.shorelineMiles+' miles<br><br>';
                        popupContent += '<svg width="200" height="120">';
                        popupContent += '<line x1="0" y1="80" x2="160" y2="80" stroke="#ccc" stroke-width="1"></line>';
                        //popupContent += '<line x1="140" y1="0" x2="140" y2="120" stroke="#000" stroke-width="1.5"></line>';
                        popupContent += '<path d="'+qualityLine+'" fill="none" stroke="green" stroke-width="2"></path>';
                        popupContent += '<path d="'+quantityLine+'" fill="none" stroke="blue" stroke-width="1"></path>';
                        popupContent += '</svg><br><br>';
                        popupContent += '<div class="center"><div class="quantity">quantity&nbsp;&nbsp;</div><div class="quality">&nbsp;&nbsp;quality</div></div>';
                        popupContent += '<div class="center average">statewide ' + species +' average</div>';
                        popupContent += '<div class="center">most recent survey</div>';
                        
                    marker.bindPopup(popupContent);
                    for(var i=0; i<feature.properties.fishSpecies.length; i++) {
                        if(feature.properties.fishSpecies[i] == species) {
                            return marker;
                        } else if (species == "bullhead") {
                            if (feature.properties.fishSpecies[i] == ("black bullhead" || "brown bullhead" || "yellow bullhead")) {
                                return marker;
                            }
                        } else if (species == "sunfish") {
                            if (feature.properties.fishSpecies[i] == ("hybrid sunfish" || "green sunfish" || "pumpkinseed" || "bluegill" || "sunfish")) {
                                return marker;
                            }
                        }else if (species == "crappie") {
                            if (feature.properties.fishSpecies[i] == ("black crappie" || "white crappie")) {
                                return marker;
                            }
                        } else if (species == "carp") {
                            if (feature.properties.fishSpecies[i] == ("white sucker" || "common carp" || "bigmouth buffalo" || "shorthead redhorse" || "silver redhorse" || "golden redhorse" || "greater redhorse")) {
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
        console.log('error fetching average results');
    }); //end fetch(averageResults.json)
}).catch(function(error) {
    console.log('error fetching lake data');
}); //end fetch(lakeData.json)
