var iris = angular.module("irisApp");

iris.controller(
		"annStatsCtrl", [
"$rootScope", "$scope", "$http", "$filter", 
"$document", "$timeout", "$location", "$route",
"$routeParams", "$log", "hotkeys",
"cytomineService", "projectService", "imageService", "sessionService", 
"helpService", "sharedService", "navService", "annotationService", "statisticsService",
"ngTableParams",
function($rootScope, $scope, $http, $filter, 
		$document, $timeout, $location, $route,
		$routeParams, $log, hotkeys,
		cytomineService, projectService, imageService, sessionService, 
		helpService, sharedService, navService, annotationService, statisticsService,
		ngTableParams) {
	$log.debug("annStatsCtrl");

	// retrieve the project parameter from the URL
	$scope.projectID = $routeParams["projectID"];

	// get the current date as long
	$scope.today = sharedService.today;

	$scope.annstats = {
			stillNew : (21 * (24 * 60 * 60 * 1000)), // last 21 days
			error : {},
			opening : {},
			slider : {
				options : {
					start: function (event, ui) {
						$log.debug('Slider start');
					},
					stop: function (event, ui) {
						$log.debug('Slider stop');
						if ($scope.annstats.slider.value === $scope.annstats.slider.max){
							$log.debug("reached maximum agreement")
						} else if ($scope.annstats.slider.value === $scope.annstats.slider.min){
							$log.debug("reached minimum agreement, showing all annotations")
						}

						// TODO filter the table!
						//$scope.tableParams.filter();
					}
				},
				// initial value of the slider
				min : 0,
				max : 0,
				// current slider value
				value : 0
			}
	};

	// refresh the page
	$scope.refreshPage = function(){
		// show the loading button
		$scope.loading = true;

		try {
			// -> evil hack to get back the pagination after refreshing table! <-
			$scope.tableParams.page(-1);
		} catch (ignored){
			//$log.debug("Expected (nullpointer) error on table parameters.");
		}

		statisticsService.fetchAnnotationAgreementList($scope.projectID, null, null, null, function(data) {
			// success
			$scope.annstats.annotations = data.annotationStats; // this should be a list of annotations
			$scope.terms = data.terms; // the term map
			$scope.users = data.users; // the sorted users list
			$scope.annstats.total = data.annotationStats.length;

			// set the slider max value
			$scope.annstats.slider.max = data.nUniqueUsersOverall;

			if (data.length < 1){
				$scope.annstats.error.empty= {
						message : "This project does not have any images."
				};
				$scope.loading = false;
				return;
			} else {
				delete $scope.annstats.error;
			}

			$scope.usercolumns = [];

			// the lookup map of user names
			$scope.usermap = {};

			// loop over the map and construct the dynamic columns
			for (var k = 0; k < data.users.length; k++) {
				var userid = data.users[k].id;
				var username = data.users[k].username;
				$scope.usercolumns.push(
					{
						title: String(username),
						userStats: 'userStats',
						visible: true,
						userID: userid
					}
				);
				$scope.usermap[userid] = {
					'username' : username,
					'firstname': data.users[k].firstname,
					'lastname': data.users[k].lastname
				};
			}

			// build the data table
			$scope.tableParams = new ngTableParams(
					{
						// define the parameters
						page : 1, // show first page
						count : 10, // count per page
						sorting : {
							// initial sorting
						},
						filter : {
							// applies filter to the "data" object before sorting
						}
					}, {
						// compute the pagination view
						total : $scope.annstats.annotations.length, // number of images
						getData : function($defer, params) {
							// use build-in angular filter
							var newData = $scope.annstats.annotations;

							var toRemove = [];

							// TODO search for minimum agreement in the data
							//for (var i = 0; i < newData.length; i++){
							//	var elmnt = newData[i];
							//	for (var j = 0; j < elmnt.annotationStats.length; j++){
							//		var agrmntEntry = elmnt.annotationStats[j];
							//		// search for an agreement level
							//		if (agrmntEntry.nUsers < $scope.annstats.slider.value){
							//			// collect the agreement entry to be removed
							//			toRemove.push(elmnt);
							//			continue;
							//		}
							//	}
							//}

							// TODO remove all elements below a certain agreement


							// use build-in angular filter
							newData = params.filter() ? $filter('filter')(newData,
									params.filter()) : newData;
							newData = params.sorting() ? $filter('orderBy')(
									newData, params.orderBy()) : newData;

							$scope.annstats.pageItemMin = (params.page() - 1) * params.count();
							
							var pageItemMax = params.page() * params.count();
							$scope.annstats.pageItemMax = pageItemMax > newData.length ? newData.length : pageItemMax;
							
							$scope.data = newData.slice($scope.annstats.pageItemMin, pageItemMax);
							params.total(newData.length); // set total for recalc pagination

							$defer.resolve($scope.data);
						},
						filterDelay : 0
					});

			$log.info("annotations refresh successful");
			// hide or show the completed images
			$scope.loading = false;
		}, function(data, status) {
			// image fetching failed
			$scope.annstats.error.retrieve = {
					status : status,
					message : data.error.message
			};
			$scope.loading = false;
		});
	};

//	fetch the annotations
	//$scope.refreshPage();

//	//////////////////////////////////////////
//	declare additional methods
//	//////////////////////////////////////////
//	Determine the row's background color class according 
//	to the current labeling progress.
	$scope.addKeys = function(url){
		try {
			return cytomineService.addKeys(url);
		} catch (e){
			return '';
		}
	};
}]);
