var navMap;

/*-- Initialization function --*/
function init() {

  var control = [
    new ol.control.MousePosition({
      target: 'mouse_container',
      // undefinedHTML: '&nbsp;',
      projection: 'EPSG:4326',
      coordinateFormat: function (coordinate) {
        return ol.coordinate.format(coordinate, '{x}, {y}', 4);
      }
    }),
    new ol.control.ScaleLine(),
    new ol.control.Zoom(),
    // new ol.control.ZoomSlider(),   
    new ol.control.ZoomToExtent({ extent: [4210292, 772401, 4218939, 779586] }),
    new ol.control.FullScreen()
  ];

  // navMap.addControl(new ol.control.Zoom());
  // navMap.addControl(new ol.control.ScaleLine());
  // navMap.addControl(new ol.control.MousePosition({
  //   projection: 'EPSG:4326',
  //   coordinateFormat: ol.coordinate.createStringXY(4)
  // })
  // );
  //define map object & link to placeholder div:
  navMap = new ol.Map({
    controls: control,
    target: "map_container",
    attribution: false
  });
  // define layer as tiled map:
  osmLayer = new ol.layer.Tile({
    title: 'OpenStreetMap',
    baseLayer: 'true',
    visible: true,
    // load OSM (a connector predefined in the API) as source:
    source: new ol.source.OSM()
  });
  bingAerial = new ol.layer.Tile({
    title: 'Bing Aerial',
    baseLayer: 'true',
    visible: false,
    preload: Infinity,
    source: new ol.source.BingMaps({
      // We need a key to get the layer from the provider. 
      // Sign in with Bing Maps and you will get your key (for free)
      key: 'Ap5mgiXRshxB7Fnt76VHYWdUn_lNWr5nZ_4Bu49YiyYbo5EfjfnFpT9CXNe_X96w',
      imagerySet: 'AerialWithLabels', // or'Aerial' 'Road', 'AerialWithLabels', etc.
      // use maxZoom 19 to see stretched tiles instead of the Bing Maps
      // "no photos at this zoom level" tiles
      maxZoom: 19
    })
  });

  dtm = new ol.layer.Tile({
    title: 'DTM (5m)',
    visible: true,
    source: new ol.source.TileWMS({
      url: "https://gisedu.itc.utwente.nl/cgi-bin/mapserv.exe?map=d:/iishome/student/s2451573/Photogrammetry-Website/configWMS.map&",
      params: { "LAYERS": "dtm", "TILED": true }
    })
  });
  dsm = new ol.layer.Tile({
    title: 'DSM (5m)',
    visible: true,
    source: new ol.source.TileWMS({
      url: "https://gisedu.itc.utwente.nl/cgi-bin/mapserv.exe?map=d:/iishome/student/s2451573/Photogrammetry-Website/configWMS.map&",
      params: { "LAYERS": "dsm", "TILED": true }
    })
  });


  contour_dtm = new ol.layer.Tile({
    title: 'DTM Contour (15m)',
    visible: true,
    source: new ol.source.TileWMS({
      url: "https://gisedu.itc.utwente.nl/cgi-bin/mapserv.exe?map=d:/iishome/student/s2451573/Photogrammetry-Website/configWMS.map&",
      params: { "LAYERS": "contour_dtm", "TILED": true }
    })
  });

  contour_dsm = new ol.layer.Tile({
    title: 'DSM Contour (15m)',
    visible: true,
    source: new ol.source.TileWMS({
      url: "https://gisedu.itc.utwente.nl/cgi-bin/mapserv.exe?map=d:/iishome/student/s2451573/Photogrammetry-Website/configWMS.map&",
      params: { "LAYERS": "contour_dsm", "TILED": true }
    })
  });

  // dtm.on('precompose', function (evt) {
  //   evt.context.imageSmoothingEnabled = false;
  //   evt.context.webkitImageSmoothingEnabled = false;
  //   evt.context.mozImageSmoothingEnabled = false;
  //   evt.context.msImageSmoothingEnabled = false;
  // });


  var baseLayers = new ol.layer.Group({
    title: 'Base Layers',
    openInLayerSwitcher: true,
    layers: [
      osmLayer,
      bingAerial
    ]
  });

  var DTMLayers = new ol.layer.Group({
    title: 'DTM Layers',
    openInLayerSwitcher: false,
    layers: [
      dtm,
      contour_dtm
    ]
  });

  var DSMLayers = new ol.layer.Group({
    title: 'DSM Layers',
    openInLayerSwitcher: false,
    layers: [
      dsm,
      contour_dsm
    ]
  });

  navMap.addLayer(baseLayers);
  navMap.addLayer(DTMLayers);
  navMap.addLayer(DSMLayers);





  navMap.setView(
    new ol.View({
      center: ol.proj.transform([37.8638, 6.9552], 'EPSG:4326', 'EPSG:3857'),
      zoom: 13.5
    })    //center coords and zoom level:
  );




  // var updateLegend = function (resolution) {
  //   var graphicUrl = dtm.getLegendUrl(resolution);
  //   var img = document.getElementById('legend');
  //   img.src = graphicUrl;
  // };


  var switcher = new ol.control.LayerSwitcher({
    tipLabel: 'Layers',
    useLegendGraphics: true,
    collapsed: false
  });
  navMap.addControl(switcher);

  switcher.on('drawlist', function (e) {
    console.log('Switcher drawlist');

  })
  // navMap.getView().on('change:resolution', function (event) {
  //   var resolution = event.target.getResolution();
  //   updateLegend(resolution);
  // });

  // var layers = new ol.layer.Group({
  //   title: 'All Layers',
  //   layers: [
  //     dtm,
  //     dsm,
  //     contour_dtm,
  //     contour_dsm
  //   ]
  // });


  navMap.on('pointermove', function (evt) {
    // first clear the contents of the results div:
    document.getElementById("queryresultsDiv").innerHTML = "";
    // retrieve map resolution details from the map object
    var viewResolution = navMap.getView().getResolution();
    // now create a url with an OGC GetFeatureInfo request:
    var url = dtm.getSource().getGetFeatureInfoUrl(
      evt.coordinate, viewResolution, 'EPSG:3857',
      {
        'INFO_FORMAT': 'text/plain',  //format to ask info in
        'QUERY_LAYERS': 'dtm,dsm,contour_dtm,contour_dsm'
      } //layers to ask info for
    );
    // an iframe in the div fires the request and retrieves the results:
    document.getElementById("queryresultsDiv").innerHTML =
      '<iframe height="100%" seamless src="' + url + '"></iframe>' ;
  });

}