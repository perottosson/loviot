<template>
  <div>
    <div class="basic">
      <l-map :zoom="zoom" :center="center">
        <l-tile-layer :url="url"></l-tile-layer>
        <div v-if="wait">
          <div v-for="(marker, markerindex) in markers" :key="marker.markers">
            <div v-if="sensorValue[markerindex] != null">
              <l-marker :lat-lng="marker.latlng" :icon="marker.pulseIcon">
                <!-- <l-marker :lat-lng="marker.latlng"> -->

                <div v-if="displayValueProp">
                  <l-tooltip :options="tooltipOptions">{{sensorValue[markerindex]}}</l-tooltip>
                </div>
                <div v-else></div>
              </l-marker>
            </div>
          </div>
        </div>
      </l-map>
    </div>
  </div>
</template>

<script>
import { eventBus } from "../main";
import { LMap, LTileLayer, LMarker, LTooltip } from "vue2-leaflet";
import * as d3 from "d3";

import { Icon } from "leaflet";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

import "../assets/pulse/L.Icon.Pulse.min.css";
import "../assets/pulse/L.Icon.Pulse.min.js";

import L from "leaflet";

export default {
  name: "Map",
  props: {
    displayValueProp: {
      type: Boolean,
    },
  },
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LTooltip,
  },

  data() {
    return {
      tooltipOptions: {
        permanent: true,
        direction: "top",
        opacity: 1,
        interactive: true,
        // turn interactive on will cause bugs below
      },
      tooltipOptionsOff: {
        permanent: true,
        direction: "top",
        opacity: 1,
        interactive: true,
        // turn interactive on will cause bugs below
      },
      url: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
      zoom: 13.4,
      displayTheValues: false,
      center: [57.7045, 11.97035],
      airdata: [],
      attributeName: "",
      sensorValue: [],
      timestamp: [],
      circles: [],
      markers: [],
      wait: false,
      colorScaleNO2: d3
        .scaleLinear()
        .domain([0, 40, 90])
        .range(["#00FF00", "#FFFF00", "#FF0000"]), // green, yellow, red
      colorScalePM25: d3
        .scaleLinear()
        .domain([0, 25, 49])
        .range(["#00FF00", "#FFFF00", "#FF0000"]), // green, yellow, red
    };
  },
  created() {
    eventBus.$on("passAirdata", (airData) => {
      this.airData = airData;
      this.attributeName = airData[0];
      this.timestamp = airData[1];
      this.sensorValue = airData[2];
      this.latlngs = [[57.70871, 11.97035, 1]];
      // reset circles
      this.circles.splice(0);

      this.wait = airData[5];

      // fill markers
      for (let i = 0; i < this.airData[1].length; i++) {
        try {
          if (i == 0) {
            this.markers.splice(0);
          }
          let colorString =
            this.colorScaleNO2(this.airData[2][i]).slice(0, 3) +
            "a" +
            this.colorScaleNO2(this.airData[2][i]).slice(
              3,
              this.colorScaleNO2(this.airData[2][i]).length - 1
            ) +
            ", 0.7)";
          console.log("attrivute bname", this.attributeName);

          if (this.attributeName == "NO2") {
            colorString =
              this.colorScaleNO2(this.airData[2][i]).slice(0, 3) +
              "a" +
              this.colorScaleNO2(this.airData[2][i]).slice(
                3,
                this.colorScaleNO2(this.airData[2][i]).length - 1
              ) +
              ", 0.7)";
          } else if (this.attributeName == "PM2_5") {
            colorString =
              this.colorScalePM25(this.airData[2][i]).slice(0, 3) +
              "a" +
              this.colorScalePM25(this.airData[2][i]).slice(
                3,
                this.colorScalePM25(this.airData[2][i]).length - 1
              ) +
              ", 0.7)";
            console.log("attrivute bname", this.attributeName);
          }

          this.markers.push({
            latlng: [this.airData[3][i], this.airData[4][i]],
            pulseIcon: L.icon.pulse({
              iconSize: [18, 18],
              color: colorString,
            }),
          });
        } catch (err) {
          console.log("UNDEFINED");
        }
      }
    });
  },

  methods: {
    update() {},
    displayValues() {
      this.displayTheValues = this.displayValueProp;
    },
  },
};
</script>

<style>
.basic {
  width: 100%;
  height: 100%;
  top: 0;
  position: absolute;
  z-index: -10;
}
.leaflet-tooltip {
  border: none !important;
  padding-top: 0px !important;
  padding-left: 5px !important;
  padding-right: 5px !important;
  padding-bottom: 0px !important;
  background-color: rgba(0, 0, 0, 0.7) !important;
  color: white !important;
  font-size: 14px !important;
}
.leaflet-tooltip:before {
  border: none !important;
}
.leaflet-tooltip-right {
  margin-left: 20px !important;
}
.leaflet-tooltip-left {
  margin-left: -20px !important;
}
.noDisplay {
  background-color: rgba(255, 9, 9, 0.7) !important;
}
</style>