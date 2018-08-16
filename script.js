    function initialize() {
      var defaultCenter = new google.maps.LatLng(52.914669, -1.5400069);
      var defaultZoom = 13;
      var tableId = '1_s6-uXU08BcUETuUwdg7DTBfvXc6CDHFeqNnqlXR';
      var locationColumn = 'location';
      var geocoder = new google.maps.Geocoder();

      var map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: defaultCenter,
        zoom: defaultZoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        gestureHandling: 'greedy'
      });

      var layer = new google.maps.FusionTablesLayer({
        query: {
          select: locationColumn,
          from: tableId
        },
        map: map,
        styleId: 2,
        templateId: 2
      });

      var query = "SELECT 'Task Name', 'Reward' FROM " +
        '1mlP-EhLtoaiGR24ChXSgdYbO2h7ZapUjMADXmcPc';
      var encodedQuery = encodeURIComponent(query);

      // Construct the URL
      var url = ['https://www.googleapis.com/fusiontables/v1/query'];
      url.push('?sql=' + encodedQuery);
      url.push('&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ');
      url.push('&callback=?');

      // Send the JSONP request using jQuery
      var dataElement = document.createElement('select');
      dataElement.style = "display:block; margin:auto; width:100%"
      dataElement.id = "taskList";
      var starter = document.createElement('option')
      starter.innerHTML = "All Tasks"
      starter.value = "All";
      dataElement.appendChild(starter);
      $.ajax({
        url: url.join(''),
        dataType: 'jsonp',
        success: function(data) {
          var rows = data['rows'];
          var ftData = document.getElementById('ft-data');
          for (var i in rows) {
            var store = rows[i][0];
            var address = rows[i][1];

            var storeElement = document.createElement('option');
            storeElement.innerHTML = store;

            storeElement.value = store;
            storeElement.className = 'TaskName';

            dataElement.appendChild(storeElement);


            ftData.appendChild(dataElement);
          }
        }
      });


      var zoomToAddress = function() {
        var address = document.getElementById('address').value;
        geocoder.geocode({
          address: address
        }, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            map.setZoom(10);

            // OPTIONAL: run spatial query to find results within bounds.
            var sw = map.getBounds().getSouthWest();
            var ne = map.getBounds().getNorthEast();
            var where = 'ST_INTERSECTS(' + locationColumn +
              ', RECTANGLE(LATLNG' + sw + ', LATLNG' + ne + '))';
            layer.setOptions({
              query: {
                select: locationColumn,
                from: tableId,
                where: where
              }
            });
          } else {
            window.alert('Address could not be geocoded: ' + status);
          }
        });
      };


      function updateMap(layer, tableId, locationColumn) {

        var selectBox = document.getElementById('taskList').value;
        console.log(locationColumn)
        console.log(selectBox)
        if (selectBox != "All") {
          layer.setOptions({
            query: {
              select: locationColumn,
              from: tableId,
              where: "'Research Task'='" + selectBox + "'"
            }
          });
        } else {
          layer.setOptions({
            query: {
              select: locationColumn,
              from: tableId
            }
          });
        }

      }

      google.maps.event.addDomListener(document.getElementById('search'),
        'click', zoomToAddress);
      google.maps.event.addDomListener(window, 'keypress', function(e) {
        if (e.keyCode == 13) {
          zoomToAddress();
        }
      });
      google.maps.event.addDomListener(document.getElementById('reset'),
        'click',
        function() {
          map.setCenter(defaultCenter);
          map.setZoom(defaultZoom);
          layer.setOptions({
            query: {
              select: locationColumn,
              from: tableId
            }
          });
        });
      setTimeout(function() {
        google.maps.event.addDomListener(document.getElementById('taskList'),
          'change',
          function() {
            updateMap(layer, tableId, locationColumn);
          });
      }, 2000)

    }

    google.maps.event.addDomListener(window, 'load', initialize);