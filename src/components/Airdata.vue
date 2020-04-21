<template>
  <div>
    <div>
      <br />
    </div>
    <div>{{endPoints[0]}}</div>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "Airdata",
  props: {
    endPoints: {
      type: Array
    }
  },

  data: function() {
    return {
      sensorType: "",
      entityId: "",
      fromDate: "",
      toDate: "",
      latitude: "",
      longitude: "",
      sensorValue: "",
      attributeName: "",
      airdata: [],
      inc: 0,
      sensVal: "",
      latVal: "",
      lonVal: "",
      timeVal: "",
      timestamp: "",
      updatedSensorVal: ""
    };
  },

  methods: {
    getData(entity) {
      // set correct sensvalue, lat and long
      this.sensVal = parseInt(entity[1]);
      this.latVal = parseInt(entity[2]);
      this.lonVal = parseInt(entity[3]);
      this.timeVal = parseInt(entity[4]);
      const url = "http://62.88.149.35:8068/v2/entities/" + entity[0];

      axios
        .get(url, {
          headers: {
            "Fiware-service": "loviot",
            "Fiware-servicepath": "/air/gbg",
            "X-Auth-Token": "c44c7dc0a5e625b5b5ae002ee600bd9d8af1346c"
          }
        })
        .then(res => {
          this.sensorValue = res.data.data.attributes[this.sensVal];
          this.attributeName = res.data.data.attributes[this.sensVal].attrName;
          this.latitude = res.data.data.attributes[this.latVal].values[0];
          this.longitude = res.data.data.attributes[this.lonVal].values[0];
          this.timestamp = res.data.data.attributes[this.timeVal];
        })
        .catch(err => console.log(err));
    },

    loop() {
      requestAnimationFrame(this.loop);
      this.inc += 1;
      try {
        this.updatedSensorVal = this.sensorValue.values[this.inc];
        this.updatedTimeVal = this.timestamp.values[this.inc];
      } catch (err) {
        console.log("no data yet for the loop ...");
      }
      this.toHeatmap();
    },

    toHeatmap() {
      this.airdata = [
        this.attributeName,
        this.updatedSensorVal,
        this.latitude,
        this.longitude,
        this.updatedTimeVal
      ];
      eventBus.$emit("passAirdata", this.airdata);
    }
  },

  watch: {
    endPoints: {
      deep: true,
      immediate: true,
      handler(newValue) {
        try {
          this.getData(newValue);
          this.loop();
          this.inc = 0;
        } catch (err) {
          console.log("no data yet ...");
        }
      }
    }
  }
};
</script>