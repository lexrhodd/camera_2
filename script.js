
		var app_id = "att6f75cc83f1b648";
		var app_key = "keyv7ZopWtGY1rwVv";
		var cat_names = [["NYCHA","NYCHA"],["Commercial","Commercial"]];
		var categories = "";
		// var ages = "";
		var work = 0;
		function load_first() {
				cat_names.forEach((cat, index) => {
						$("#categories").html( $("#categories").html() + "<input type=\"checkbox\" name=\"checkbox-v-"+cat[0]+"\" id=\"checkbox-v-"+cat[0]+"\" onChange=\"list_page();\" checked=\"checked\">");
						$("#categories").html( $("#categories").html() + "<label for=\"checkbox-v-"+cat[0]+"\">"+cat[1]+"</label>");
				});
				$( '#categories' ).enhanceWithin();
				load_api_data('#filter',0);
		}
		load_first();
		function load_api_data(target,mode=3,id='') {
			work = 1;
			if (mode == 0) {
				apicall = "https://api.airtable.com/v0/"+app_id+"/Locations/?sort[0][field]=Name&sort[0][direction]=asc";
			} else if (mode == 1) {
				apicall = "https://api.airtable.com/v0/"+app_id+"/Categories/?sort[0][field]=Name&sort[0][direction]=asc";
			} else if (mode == 2) {
				apicall = "https://api.airtable.com/v0/"+app_id+"/" + $('#town').find(":selected").text() + "/?filterByFormula=AND(OR("+categories+"))&sort[0][field]=Name&sort[0][direction]=asc";
			} else if (mode == 3) {
				apicall = "https://api.airtable.com/v0/"+app_id+"/" + $('#town').find(":selected").text() + "/?filterByFormula=(RECORD_ID()=\""+id+"\")";
			}
			var app = new Vue({
	              el: target,
	              data: {
	                  items: []
	              },
	              mounted: function(){
	                 this.loadItems();
	              },
	              methods: {
	                  loadItems: function(){
	                      // Init variables
	                      var self = this
	                      this.items = []
						axios.get(
														 apicall,
	                          {
	                              headers: { Authorization: "Bearer "+ app_key }
	                          }
	                      ).then(function(response){
	                          self.items = response.data.records;
														work = 0;
														if (mode == 0) {	$('#loading_selection').remove() }
	                      }).catch(function(error){
	                          console.log(error)
	                      })
	                  }
	              }
	          });
		}
		function results_page() {
			if ($('#town').find(":selected").val() == 0) {
				alert('You must choose a location.');
			} else if ($('#checkbox-v-NYCHA').is(":checked") || $('#checkbox-v-Commercial').is(":checked")) {
				next_page_1()
	   		} else {
				alert('You must choose at least one type of service.')
			}
		}
		function next_page_1() {
			if (work == 0) {
				if ($('input[name=radio-choice-h-2]:checked', '#filter').val() == "map") {
						size_map();
						$.mobile.changePage($('#map-page'), { transition: 'slide'});
				} else {
						$.mobile.changePage($('#results'), { transition: 'slide'});
				}
			} else {
				if ($.mobile.loading().is(':hidden')) {
					$.mobile.loading("show");
				}
				setTimeout(function () {
	        next_page_1()
	    	}, 100);
			}
		}
		function list_page() {
			if ($('#town').find(":selected").val() != 0 ) {
					$("#org_list").html("");
					$("#org_geo_list").html("<li id=\"ge0_points\" v-for=\"item in items\">{{ item['id'] }},{{ item['fields']['Name'] }},{{ item['fields']['Latitude'] }},{{ item['fields']['Longitude'] }}</li>");
					categories = "";
					cat_names.forEach((cat, index) => {
						if ($('#checkbox-v-'+cat[0]).is(":checked")){
							$("#org_list").html( $("#org_list").html() + "<li data-role=\"list-divider\">"+cat[1]+"</li>")
							// $("#org_list").html( $("#org_list").html() + "<li data-role=\"list-divider\">"+"item['fields']['County']"+"</li>")
							$("#org_list").html( $("#org_list").html() + "<li v-for=\"item in items\" v-if=\"item['fields']['Category'] == '"+cat[1]+"'\"><a href=\"javascript:void('')\" v-bind:id=\"item['id']\" onClick=\"details_page(this.id);\">{{ item['fields']['Name'] }}<p>Managed by: {{ item['fields']['manager'] }}; Number of Cameras: {{ item['fields']['no_cameras']  }}</p></a></li>")
							
							if (categories != "") {
								categories = categories+",";
							}
							categories = categories+"FIND(\""+cat[1]+"\",{Category})";
						}
					});
					$('#town_name').html($('#town').find(":selected").text());
			    load_api_data('#results',2);
					geo_data = $('#town').find(":selected").val().split(',').map(Number);
					lat = geo_data[0];
					lon = geo_data[1];
					zoomin = geo_data[2];
		  	} else {
					return false;
				}
			}
			function details_page(id) {
	      	$("#detail").attr("v-for", "item in items");
	      	$("#detail").html("");
	      	$("#detail").html($("#detail").html() + "<h3>{{ item['fields']['Name'] }}</h3>")
	      	$("#detail").html($("#detail").html() + "<h4>{{ item['fields']['Category'] }}</h4>");
	      	$("#detail").html($("#detail").html() + "<p><b>Managed by:</b> {{ item['fields']['manager']}} &nbsp;&nbsp; </p>");
			$("#detail").html($("#detail").html() + "<p><b>Phone:</b> <a v-bind:href=\"'tel:'+item['fields']['Phone']\" target=\"_blank\">{{ item['fields']['Phone'] }}</p>");
			$("#detail").html($("#detail").html() + "<p><b>Camera Type:</b> {{ item['fields']['Camera type']}} &nbsp;&nbsp; <b>Number of Cameras:</b> {{ item['fields']['no_cameras']}} </p>");
			$("#detail").html($("#detail").html() + "<p><b>Email:</b> <a v-bind:href=\"'mailto:'+item['fields']['Email']\" target=\"_blank\">{{ item['fields']['Email'] }}</a></p>");
	      	$("#detail").html($("#detail").html() + "<p><b>Website:</b> <a v-bind:href=\"item['fields']['Website']\" target=\"_blank\">{{ item['fields']['Website'] }}</a></p>");
	      	$("#detail").html($("#detail").html() + "<p><b>Address:</b> <a v-bind:href=\"'https://www.google.com/maps/place/'+item['fields']['Address']  +'+'+item['fields']['County'] \" target=\"_blank\">{{ item['fields']['Address'] }}</a> <b>Building no.</b> {{ item['fields']['building']}} <b>Stairhall: </b> {{ item['fields']['Stairhall']}}</p>");
			$("#detail").html($("#detail").html() + "<p><b>Description:</b> {{ item['fields']['Description'] }}</p>");
					$("#detail").html($("#detail").html() + "<p><b>Valid As Of:</b> {{ item['fields']['createdTime'] }}</p>");
				load_api_data('#details',3,id);
				next_page_2();
	    }
			function next_page_2() {
				if (work == 0) {
					$.mobile.changePage($('#details'), { transition: 'slide'})
				} else {
					if ($.mobile.loading().is(':hidden')) {
						$.mobile.loading("show");
					}
					setTimeout(function () {
						next_page_2()
					}, 100);
				}
			}
			//list_page();
			// map items- currently broken!!    https://developers.google.com/maps/documentation/javascript/adding-a-google-map
			// map items- new feature- geolocation!!    https://developers.google.com/maps/documentation/javascript/geolocation
			var markers = [];
			function initMap(lat,lon,zoomin) {
				var infobx = {lat: lat, lng: lon};
				var map = new google.maps.Map(document.getElementById('map'), {
					zoom: 12,
					center: infobx
					});
				i = 0;
				$('#org_geo_list li').each(function(){
					//alert($(this).text());
					pin_data = $(this).text().split(',');
					marker = new google.maps.Marker({
						position: {lat: Number(pin_data[2]), lng: Number(pin_data[3])},
						map: map,
						title:  '<p><b>Description:</b> {{ item[\'fields\'][\'Name\'] }}</p>'
					});
					// var markerCluster = new MarkerCluster(map, markers, {imagepath: 'https://fontawesome.com/icons/video?style=solid'});
					var infowindow = new google.maps.InfoWindow({
						content: "<div id= \'mapstyle\'><h2>"+pin_data[1]+"</h2><div id=\'mapbox\'><a href=\"javascript:details_page(\'"+pin_data[0]+"\')\">view details</a></span></div>"
					});
					//creates an infowindow 'key' in the marker.
					marker.infowindow = infowindow;
					//finally call the explicit infowindow object
					marker.addListener('click', function() {
						// hideAllInfoWindows(map);
						return this.infowindow.open(map, this);
					});
					markers.push(marker);
					++i;
				});
				google.maps.event.addListener(map, 'click', function() {
				    if (infowindow) {
						infowindow.close();
				    }
				});
			}
			function hideAllInfoWindows(map) {
				markers.forEach(function(marker) {
					marker.infowindow.close(map, marker);
			  });
			}
			function size_map() {
				initMap(lat,lon,zoomin);
				$('#map-page').height( window.innerHeight - 81 +  'px');
			}
			$("div[data-role=page]").bind("pagebeforeshow", function (e, data) {
			  $.mobile.silentScroll(0);
			  $.mobile.changePage.defaults.transition = 'slide'; // reset default here
			})
