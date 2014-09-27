var iris = angular.module("irisApp");

iris.constant("image")

iris.controller("mapCtrl", function($scope, $log, $location, $http, olData, sharedService, sessionService, imageService, projectService, olHelpers){
	console.log("mapCtrl");
	
	// top right
	//$scope.annotation = {"class":"be.cytomine.ontology.UserAnnotation","id":138246291,"created":"1411712567955","updated":null,"deleted":null,"location":"POLYGON ((56590.3125 39104.125, 56590.3125 39156.125, 56638.3125 39156.125, 56638.3125 39104.125, 56590.3125 39104.125))","image":94255021,"geometryCompression":0.0,"project":93519082,"container":93519082,"user":93518990,"nbComments":0,"area":1055.0,"perimeterUnit":"mm","areaUnit":"micron²","perimeter":0.0,"x":56614.3125,"y":39130.125,"term":[95795881],"similarity":null,"rate":null,"idTerm":null,"idExpectedTerm":null,"cropURL":"http://beta.cytomine.be/api/userannotation/138246291/crop.jpg","smallCropURL":"http://beta.cytomine.be/api/userannotation/138246291/crop.png?maxSize=256","url":"http://beta.cytomine.be/api/userannotation/138246291/crop.jpg","imageURL":"http://beta.cytomine.be/#tabs-image-93519082-94255021-138246291","reviewed":false};
	//$scope.annotation = {"class":"be.cytomine.ontology.UserAnnotation","id":138246683,"created":"1411712682787","updated":null,"deleted":null,"location":"POLYGON ((56630.8125 1.6250000000000009, 56630.8125 9.625, 56638.8125 9.625, 56638.8125 1.6250000000000009, 56630.8125 1.6250000000000009))","image":94255021,"geometryCompression":0.0,"project":93519082,"container":93519082,"user":93518990,"nbComments":0,"area":27.0,"perimeterUnit":"mm","areaUnit":"micron²","perimeter":0.0,"x":56634.8125,"y":5.625,"term":[95795881],"similarity":null,"rate":null,"idTerm":null,"idExpectedTerm":null,"cropURL":"http://beta.cytomine.be/api/userannotation/138246683/crop.jpg","smallCropURL":"http://beta.cytomine.be/api/userannotation/138246683/crop.png?maxSize=256","url":"http://beta.cytomine.be/api/userannotation/138246683/crop.jpg","imageURL":"http://beta.cytomine.be/#tabs-image-93519082-94255021-138246683","reviewed":false}
	
	// cell
	//$scope.annotation = {"class":"be.cytomine.ontology.UserAnnotation","id":95166527,"created":"1390206214759","updated":null,"deleted":null,"location":"POLYGON ((37390 14006, 37393.75693066626 14012.325030868275, 37394.6164357884 14019.6313154549, 37392.42989912241 14026.655530779337, 37387.57539272194 14032.183126199, 37380.892304845416 14035.258330249198, 37373.53620210064 14035.349412212301, 37366.77902148027 14032.440623189437, 37361.78914090065 14027.034919228176, 37359.42935604561 14020.066995652698, 37360.107695154584 14012.741669750802, 37363.7068672331 14006.325556919424, 37369.60454273133 14001.928061355664, 37376.78095997694 14000.309549992488, 37383.995251232445 14001.749878148303, 37390 14006))","image":94255021,"geometryCompression":0.0,"project":93519082,"container":93519082,"user":93518990,"nbComments":0,"area":403.0,"perimeterUnit":"mm","areaUnit":"micron²","perimeter":0.0,"x":37377.0,"y":14018.0,"term":[95202360],"similarity":null,"rate":null,"idTerm":null,"idExpectedTerm":null,"cropURL":"http://beta.cytomine.be/api/userannotation/95166527/crop.jpg","smallCropURL":"http://beta.cytomine.be/api/userannotation/95166527/crop.png?maxSize=256","url":"http://beta.cytomine.be/api/userannotation/95166527/crop.jpg","imageURL":"http://beta.cytomine.be/#tabs-image-93519082-94255021-95166527","reviewed":false};

	// small blob
	//$scope.annotation = {"class":"be.cytomine.ontology.UserAnnotation","id":114156761,"created":"1395487722306","updated":null,"deleted":null,"location":"POLYGON ((37814.47308554502 13587.50884353635, 37798.893637608904 13592.651359678839, 37787.48239872964 13602.04720420449, 37782.2124757773 13614.071750236246, 37783.99508630609 13626.64584452565, 37792.52200076107 13637.595311938, 37806.318838168394 13645.026890084913, 37823 13647.655591591021, 37839.681161831606 13645.026890084913, 37853.47799923893 13637.595311938, 37862.00491369391 13626.64584452565, 37863.7875242227 13614.071750236246, 37858.51760127036 13602.04720420449, 37847.106362391096 13592.651359678839, 37831.52691445498 13587.50884353635, 37814.47308554502 13587.50884353635))","image":94255021,"geometryCompression":0.0,"project":93519082,"container":93519082,"user":93518990,"nbComments":0,"area":1607.0,"perimeterUnit":"mm","areaUnit":"micron²","perimeter":0.0,"x":37823.00000000001,"y":13617.25,"term":[95795881],"similarity":null,"rate":null,"idTerm":null,"idExpectedTerm":null,"cropURL":"http://beta.cytomine.be/api/userannotation/114156761/crop.jpg","smallCropURL":"http://beta.cytomine.be/api/userannotation/114156761/crop.png?maxSize=256","url":"http://beta.cytomine.be/api/userannotation/114156761/crop.jpg","imageURL":"http://beta.cytomine.be/#tabs-image-93519082-94255021-114156761","reviewed":false}
	
	// large blob
	$scope.annotation = {"class":"be.cytomine.ontology.UserAnnotation","id":98921281,"created":"1391545026362","updated":"1391545030358","deleted":null,"location":"POLYGON ((20636.030824992 11276.411811874, 20573.906496135744 10800.683799942288, 20710.649112290244 10340.816394596397, 21022.61463285472 9976.324847984853, 21455.86138520579 9770.23305981854, 21935.477069938777 9758.176172556532, 22378.531777991633 9942.23893153981, 22708.41732531636 10290.595213582497, 22868.093503864402 10743.011052801941, 22829.950851752255 11221.259640528231, 22600.584580045226 11642.64745119147, 22219.654200848625 11934.312704139902, 21753.026037369396 12045.823827443108, 21281.38433825688 11957.899534835207, 20886.28023801796 11685.74273527523, 20636.030824992 11276.411811874))","image":94255021,"geometryCompression":0.0,"project":93519082,"container":93519082,"user":93518990,"nbComments":0,"area":1715713.0,"perimeterUnit":"mm","areaUnit":"micron²","perimeter":5.0,"x":21724.030824991998,"y":10892.411811874,"term":[],"similarity":null,"rate":null,"idTerm":null,"idExpectedTerm":null,"cropURL":"http://beta.cytomine.be/api/userannotation/98921281/crop.jpg","smallCropURL":"http://beta.cytomine.be/api/userannotation/98921281/crop.png?maxSize=256","url":"http://beta.cytomine.be/api/userannotation/98921281/crop.jpg","imageURL":"http://beta.cytomine.be/#tabs-image-93519082-94255021-98921281","reviewed":false}
	
	var currImg = sessionService.getCurrentImage();

	var imgWidth = currImg.cytomine.width;//56640;
	var imgHeight = currImg.cytomine.height;//39163;
	var centroid = { x: $scope.annotation.x, y: $scope.annotation.y };		
	
	var annStyle = new ol.style.Style({
	    fill: new ol.style.Fill({
	      color: [0xff, 0xff, 0xff, 0.0]
	    }),
		stroke: new ol.style.Stroke({
		  width: 5,
	      color: [0x00, 0x00, 0x00, 0.5]
	    })
	}); 
	
	var url = currImg.olTileServerURL;//"http://localhost:8080/image/tile?zoomify=/data/beta.cytomine.be/93518990/93518990/1389785459805/HE_32911_12_converted.tif/";

	var crossOrigin = 'anonymous';
	var imgCenter = [imgWidth / 2, imgHeight / 2];
	
	// create the zoomify dummy projection
	var proj = new ol.proj.Projection({
		code: 'Zoomify',
		units: 'pixels',
		extent: [0, 0, imgWidth, imgHeight] // don't skip that, otherwise the image is not rendered
	});

	// configure the openlayers map properties
	var initializeMap = function(){
		angular.extend($scope, {
	        layers: {
	            main: {
	            	opacity: 1,
	            	type: "Zoomify",
	                source: {
	                	type: "Zoomify",
	                    url: url,
	                    width: imgWidth,
	                    height: imgHeight,
	                    crossOrigin: crossOrigin,
	                },
	            },
	            annotations: {
	            	opacity: 1,
	            	type: 'Vector',
	            	source: {
	            		type: 'Vector',
	            	},
	            	style: {
	            		fill: {
	            			color: annStyle.getFill().getColor()
	            		},
	            		stroke: {
	            			width: annStyle.getStroke().getWidth(),
	            			color: annStyle.getStroke().getColor()
	            		}
	            	
	            	}
	            },
	    	},

			// initially move to annotation center
		    center: {
	            lon: centroid.x,
	            lat: centroid.y-imgHeight, 
	            //zoom: 8,
	            bounds: [],
	            projection: proj,
	            centerUrlHash: false
	        },
	        
	        // these default controls are applied to the map
	        // at creation time
		    defaults: {
		        controls: {
		        	rotate: false,
			    	attribution: false
			    },
		        maxZoom: 8,
		        minZoom: 0
		    },
		});
	};
	
	var createAnnotationFeature = function (annotation){
//		console.log("Shape: " + annotation["location"]);
//		console.log("Center: " + centroid.x + ", " + centroid.y);

		var format = new ol.format.WKT();
		var feature = format.readFeature(annotation["location"]);
		
//		var feature = new ol.Feature({ 
//				geometry: new ol.geom.Circle([ centroid.x, centroid.y ], 40),
//				name: 'annotation center'
//				});
		
		var coords = feature.getGeometry().flatCoordinates;
		
		// transform the coordinates 
		// TODO a better solution would be writing a custom
		// ol.proj.addCoordinateTransforms(source, destination, forward, inverse) function	
		for (var i=1; i <= coords.length; i+=2){
			coords[i] = coords[i] - imgHeight;
		}
		
		console.log("Transformed Center: " + coords[0] + ", " + coords[1]);
		
		// write out the extent
		$scope.extent = feature.getGeometry().getExtent();
		return feature;
	};
	
	// move to the annotation and draw the shape
	var setFeature = function (feature, layer) {
		// construct the layer if it its null
		if (layer){
			// add the feature to the source
			layer.getSource().clear();
			layer.getSource().addFeature(feature);
		}else {
			var layer = new ol.layer.Vector({
			  	source: new ol.source.Vector({
			    	features: [feature]
					}),
				style: annStyle
				});
		}
		return feature;
	};
	// add a listener to the map's layers
	olData.getMap().then(function(map){
		map.getLayers().on('add', function(e) {
			var layer = e.element;
			var layerName = (layer.get('name'));
			if (layerName === 'annotations'){
				setFeature(feature, layer);
				$scope.moveToCenter();
			}
		})
	});
	
	// fit the geometry to the center
	$scope.moveToCenter = function(){
		$scope.center.lon = centroid.x;
		$scope.center.lat = centroid.y-imgHeight;
		olData.getMap().then(function(map) {
			var polygon = feature.getGeometry();
			var size = map.getSize();
			map.getView().fitGeometry(
					polygon,
					size,
					{
						constrainResolution: true
					})
		});
	};
	
	// create the feature 
    var feature = createAnnotationFeature($scope.annotation);
    // construct the map
    initializeMap();
});

