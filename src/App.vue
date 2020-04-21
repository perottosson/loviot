<template>
  <div id="app">

    <br> Select sensor: <br>
    <select @change="entity($event)">
      <option disabled value>Please select one</option>
      <option :value="[NO2B43F.entity, NO2B43F.no2, NO2B43F.lat, NO2B43F.lon, NO2B43F.time]">NO2B43F</option>
      <option :value="[BME280.entity, BME280.temp, BME280.lat, BME280.lon, BME280.time]">BME280</option>
      <option :value="[PMS5003.entity, PMS5003.pm10, PMS5003.lat, PMS5003.lon, PMS5003.time]">PMS5003</option>
      <option :value="[SDS011.entity, SDS011.pm2_5, SDS011.lat, SDS011.lon, SDS011.time]">SDS011</option>
    </select>

    <Airdata :endPoints="endPoint" />
    <Heatmap />
  </div>
</template>


<script>
import Airdata from "./components/Airdata";
import Heatmap from "./components/Heatmap"

export default {
  name: "App",
  components: {
    Airdata, 
    Heatmap
  },

  data() {
    return {
      NO2B43F: {
        entity: "NO2B43F:94d359a386ef4e9599246af00eb66116-02",
        no2: 5,
        lat: 3,
        lon: 4,
        time: 12
      },
      BME280: {
        entity: "BME280:a7ff9bf591af4de282fbaf54e8781e13-04",
        temp: 9,
        lat: 3,
        lon: 4, 
        time: 11
      },
      PMS5003: {
        entity: "PMS5003:94d359a386ef4e9599246af00eb66116-03",
        pm10: 7, 
        lat: 5,
        lon: 6,
        time: 15
      },
      SDS011: {
        entity: "SDS011:12397",
        pm2_5: 4,
        lat: 1,
        lon: 2,
        time: 10
      },
      endPoint: ["NO2B43F:94d359a386ef4e9599246af00eb66116-02", 5, 3, 4, 12],

    };
  },
  methods: {
    entity(e) {
      let convertToArray = e.target.value.split(",");
      this.endPoint = convertToArray;
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
