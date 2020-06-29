<template>
  <div>
    <div class="basic">
      <l-map :zoom="zoom" :center="center">
        <l-tile-layer :url="url"></l-tile-layer>
        <div v-if="wait">
          <div v-for="(marker, markerindex) in markers" :key="marker.markers">
            <div v-if="sensorValue[markerindex] != null">
              {{sensorValue}}
              <l-marker :lat-lng="marker.latlng" :icon="marker.pulseIcon"></l-marker>
            </div>
          </div>
        </div>
      </l-map>
    </div>
  </div>
</template>

<script>
import { eventBus } from "../main";
import { LMap, LTileLayer, LMarker } from "vue2-leaflet";
import * as d3 from "d3";

import { Icon } from "leaflet";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

import "../assets/pulse/L.Icon.Pulse.min.css";
import "../assets/pulse/L.Icon.Pulse.min.js";

import L from "leaflet";

export default {
  name: "Map",
  components: {
    LMap,
    LTileLayer,
    LMarker
  },

  data() {
    return {
      url: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
      zoom: 13.4,
      center: [57.7045, 11.97035],
      airdata: [],
      attributeName: "",
      sensorValue: [],
      timestamp: [],
      circles: [],
      markers: [],
      wait: false,
      colorScale: d3
        .scaleLinear()
        .domain([0, 40, 90])
        .range(["#00FF00", "#FFFF00", "#FF0000"]) // green, yellow, red
    };
  },
  created() {
    eventBus.$on("passAirdata", airData => {
      this.airData = airData;
      this.attributeName = airData[0];
      this.timestamp = airData[1];
      this.sensorValue = airData[2];
      this.latlngs = [[57.70871, 11.97035, 1]];
      // reset circles
      this.circles.splice(0)

      this.wait = airData[5];

      // fill markers
      for (let i = 0; i < this.airData[1].length; i++) {
        try {
          if (i == 0) {
            this.markers.splice(0)
          }
          let colorString =
            this.colorScale(this.airData[2][i]).slice(0, 3) +
            "a" +
            this.colorScale(this.airData[2][i]).slice(
              3,
              this.colorScale(this.airData[2][i]).length - 1
            ) +
            ", 0.7)";

          this.markers.push({
            latlng: [this.airData[3][i], this.airData[4][i]],
            pulseIcon: L.icon.pulse({
              iconSize: [18, 18],
              color: colorString
            })
          });
        } catch (err) {
          console.log("UNDEFINED");
        }
      }
    });
  },
  methods: {
    update() {}
  }
};
</script>

<style>
.basic {
  padding-top: 10px;
  padding-bottom: 30px;

  width: 100%;
  height: 400px;
}
#top {
  z-index: 1000;
  position: relative;
}
</style>