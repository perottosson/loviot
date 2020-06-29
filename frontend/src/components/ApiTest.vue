<template>
  <div>

  <h1>Gunnar testar</h1>
  <pre>{{(response.toString())}}</pre>
  </div>
</template>

<script>

const corsAnywherePrefix = 'https://cors-anywhere.tiigbg.se/';

import axios from 'axios';
export default {
  name: 'ApiTest',
  data () {
    return {
      response: ''
    }
  },
  mounted(){
    // this.getDataFetch();
    this.getDataAxios();
  },
  methods: {
    async getDataAxios(){
      const url = corsAnywherePrefix + 'http://62.88.149.35:8068/v2/entities/AirQualityObserved:0001';
      let response = await axios({
        methods: 'get', 
        url: url,
        headers: {
          "Accept": "*/*",
          "X-Auth-Token":"c44c7dc0a5e625b5b5ae002ee600bd9d8af1346c",
          "Fiware-service":"loviot",
          "Fiware-servicepath":"/airquality/reference",
          // "X-Requested-With":"XMLHttpRequest"
        }
      })
      console.log(response);
      this.response = response;
    },
    async getDataFetch () {
      let response = await fetch('http://62.88.149.35:8068/v2/entities/AirQualityObserved:0001', {
        headers: {
        //   // "Accept": "*/*",
        //   // "Connection": "keep-alive",
          // "X-Auth-Token":"c44c7dc0a5e625b5b5ae002ee600bd9d8af1346c",
          "fiware-service":"loviot",
        //   "Fiware-servicepath":"/airquality/reference",
        //   // "X-Requested-With":"XMLHttpRequest"
        }
      });
      
      console.log(response);
      this.response = response;
    }
  }
};
</script>

<style scoped lang="scss">
</style>