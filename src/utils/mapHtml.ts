import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_PLACES_API_KEY,
} from '../config/Key';
import { Coordinates } from '../services/locationService';

const MAP_KEY = GOOGLE_PLACES_API_KEY || GOOGLE_MAPS_API_KEY;

export const buildMapHtml = (center: Coordinates) => `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .pin-wrap {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -100%);
      pointer-events: none; z-index: 2;
    }
    .pin-dot {
      width: 16px; height: 16px; background: #0D614E;
      border: 3px solid #fff; border-radius: 50%;
      margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .pin-stem {
      width: 2px; height: 20px; background: #0D614E;
      margin: 0 auto;
    }
    .map-error {
      display:none;position:absolute;inset:0;align-items:center;justify-content:center;
      background:#F8FAFC;color:#64748B;font:14px sans-serif;text-align:center;padding:20px;z-index:5;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="mapError" class="map-error">Map failed to load. Check Maps JavaScript API + billing.</div>
  <div class="pin-wrap"><div class="pin-dot"></div><div class="pin-stem"></div></div>
  <script>
    let map, idleTimer;
    const startLat = ${center.latitude};
    const startLng = ${center.longitude};

    function postLocation(lat, lng) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lng }));
      }
    }

    function onMapIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        const c = map.getCenter();
        postLocation(c.lat(), c.lng());
      }, 350);
    }

    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: startLat, lng: startLng },
        zoom: 17,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
      });
      map.addListener('idle', onMapIdle);
      postLocation(startLat, startLng);
    }

    window.gm_authFailure = function() {
      document.getElementById('mapError').style.display = 'flex';
    };

    window.moveMapTo = function(lat, lng) {
      if (!map) return;
      map.panTo({ lat, lng });
    };
  </script>
  <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=${MAP_KEY}&callback=initMap"
    onerror="document.getElementById('mapError').style.display='flex'">
  </script>
</body>
</html>`;
