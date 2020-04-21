<template>
  <div>
    <br />
    {{ message }}
    <div>
      <div>attributeName: {{attributeName}}</div>
      <div>Time: {{timestamp}} </div>
      <div>sensorValues: {{sensorValue}}</div>
      <div>lat: {{latitude}}</div>
      <div>lon: {{longitude}}</div>
    </div>
  </div>
</template>

<script>
import { eventBus } from "../main";

export default {
  name: "Heatmap",
  data() {
    return {
      message: "My heatmap:",
      airdata: [],
      attributeName: "",
      sensorValue: "",
      latitude: "",
      longitude: "", 
      timestamp: ""
    };
  },
  
  created() {
    eventBus.$on("passAirdata", airData => {
      this.airData = airData;
      this.attributeName = airData[0];
      this.sensorValue = airData[1];
      this.latitude = airData[2];
      this.longitude = airData[3];
      this.timestamp = airData[4];
    });
  }
};
</script>