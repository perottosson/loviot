<template>
  <div id="app">
    <Airdata
      @changeIncVal="getIncValue"
      @changeTimeVal="getTimeValue"
      @timeStampList="getTimeStamp"
      :sensorData="sensorData"
      :playToggle="playToggle"
      :nextVal="next"
      :prevVal="prev"
      :newInc="newInc"
      :debugToggle="debugValue"
      ref="airdataChild"
    />
    <Map :displayValueProp="displayValues" ref="mapChild" />

    <span id="to_the_right_debug">
      <label><input type="checkbox" v-model="debugValue" />
      Debug mode</label>
    </span>

    <div id="panelContainer">
      Select what to measure:
      <select @change="entity($event)">
        <option disabled value>Please select one</option>
        <option
          :value="selectairqualityObserved"
        >AirQualityObserved – Stadens referensstationer för NO2</option>
        <option :value="selectNO2B43F">Sensorbox - Projektets mätstationer för NO2 (4 st)</option>
        <option :value="selectSDS011">Luftdatens mätstationer för PM 2.5</option>
      </select>
      <span id="date">Select startdate:</span>
      <flat-pickr v-model="initDate" :config="config" @on-change="changeTime"></flat-pickr>
      <button id="prev" @click="$refs.airdataChild.stepbackward()">&lt;</button>
      <button id="date" @click="playButton">{{ play }}</button>
      <button id="next" @click="$refs.airdataChild.stepforward()">&gt;</button>

      <span id="date">Time: {{displayTime}}</span>

      <span id="date">
        <label><input type="checkbox" v-on:change="$refs.mapChild.displayValues()" v-model="displayValues" />
        Display values</label>
      </span>

      <vue-slider
        id="margin-b"
        ref="slider"
        v-model="sliderValue"
        :marks="options.marksIntervall"
        v-bind="options"
        @click.native="getValueWhenClicked($refs.slider.getValue())"
      ></vue-slider>
    </div>
  </div>
</template>


<script>
import Airdata from "./components/Airdata";
import Map from "./components/Map";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import * as d3 from "d3";
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";

export default {
  name: "App",
  components: {
    Airdata,
    Map,
    flatPickr,
    VueSlider,
  },

  data() {
    return {
      newInc: 0,
      debugValue: false,
      displayValues: false,
      inc: 0,
      loopValue: false,
      // vue slide bar
      sliderValue: 0,
      options: {
        dotSize: 14,
        marksIntervall: (val) => {
          try {
            if (val % 10 === 0 && val < 100 && val > 0) {
              if (this.selected == "SDS011Selection") {
                return {
                  label: `${this.timestampList[1][val]
                    .replace("T", " ")
                    .replace(".000", "")
                    .slice(0, -4)}`,
                };
              } else {
                return {
                  label: `${this.timestampList[0][val]
                    .replace("T", " ")
                    .replace(".000", "")}`,
                };
              }
            } else {
              return { label: `${""}` };
            }
          } catch {
            console.log("waiting for dateticks to load");
          }
        },
        width: "auto",
        height: 4,
        contained: true,
        direction: "ltr",
        data: null,
        min: 0,
        max: 100,
        interval: 1,
        disabled: false,
        clickable: true,
        duration: 0.5,
        adsorb: true,
        lazy: true,
        tooltip: "none",
        tooltipPlacement: "top",
        tooltipFormatter: void 0,
        useKeyboard: true,
        keydownHook: null,
        dragOnClick: true,
        enableCross: true,
        fixed: true,
        minRange: void 0,
        maxRange: void 0,
        order: true,
        marks: [10, 20, 30, 40, 50],
        lastTimestamp: "",
        firstTimestamp: "",
        // dotOptions: void 0,
        dotOptions: {
          style: {
            backgroundColor: "#3c656b",
            border: "2px solid #9cb2bf",
            boxShadow: "0.5px 0.5px 2px 1px rgba(107,107,107,.36)",
          },
        },
        process: true,
        showTooltip: true,
        // dotStyle: void 0,
        // railStyle: void 0,
        // processStyle: void 0,
        // tooltipStyle: void 0,
        // stepStyle: void 4,
        // stepActiveStyle: void 0,
        // labelStyle: void 0,
        // labelActiveStyle: void 0,

        dotStyle: {
          backgroundColor: "black",
        },
        railStyle: {
          backgroundColor: "#9cb2bf",
        },
        processStyle: {
          backgroundColor: "#3c656b",
        },
        tooltipStyle: {
          backgroundColor: "red",
        },
        stepStyle: {
          backgroundColor: "black",
        },
        labelActiveStyle: {
          backgroundColor: "transparent",
        },
        stepActiveStyle: {
          backgroundColor: "transparent",
        },
        labelStyle: {
          backgroundColor: "transparent",
        },
      },
      // flat-pickr TIME
      initDate: "2019-11-30t09:00:00",
      play: "Pause",
      playToggle: true,
      counter: 0,
      prev: false,
      next: false,
      nextTest: false,
      // flat-pickr config
      config: {
        wrap: true,
        altFormat: "Y-m-d H:i",
        minDate: "2019-11-01",
        maxDate: "2020-08-25",
        altInput: true,
        minuteIncrement: 60,
        dateFormat: "Y-m-d",
      },
      timestamp: "Year-month-day Hours-Minutes-Seconds",
      timestampList: [],
      displayTime: "Year-month-day Hours-Minutes-Seconds",
      timeFormatter: d3.timeFormat("%Y-%m-%dt%H:%M:%S"),
      // init selection
      selected: "airqualityObservedSelection",
      selectairqualityObserved: "airqualityObservedSelection",
      selectNO2B43F: "NO2B43FSelection",
      selectSDS011: "SDS011Selection",

      dataAirqualityObserved: [
        [
          {
            sensorUrl: "AirQualityObserved:0001",
          },
          {
            sensorUrl: "AirQualityObserved:0002",
          },
          {
            sensorUrl: "AirQualityObserved:0003",
          },
        ],
        { val: 0 },
        { lat: 5 },
        { lon: 5 },
        { time: 12 },
        { servicePath: "/airquality/reference" },
        { sensor: "AirqualityObserved" },
        { fromDate: this.initDate },
      ],
      dataNO2B43F: [
        [
          {
            sensorUrl: "NO2B43F:b9455f7d07034bcfa44a5be9002187a7-02",
          },
          {
            sensorUrl: "NO2B43F:ead4f525b1fd498db0e33f6b66bc2e01-02",
          },
          {
            sensorUrl: "NO2B43F:94d359a386ef4e9599246af00eb66116-02",
          },
          {
            sensorUrl: "NO2B43F:5efba162-70df-4887-88f2-463c12b8729c-02",
          },
        ],
        { val: 5 },
        { lat: 3 },
        { lon: 4 },
        { time: 12 },
        { servicePath: "/air/gbg" },
        { sensor: "NO2B43F" },
        { fromDate: this.initDate },
      ],
      dataSDS011: [
        [
          {
            sensorUrl: "SDS011:12397",
          },
          {
            sensorUrl: "SDS011:14801",
          },
          {
            sensorUrl: "SDS011:14264",
          },
          {
            sensorUrl: "SDS011:19796",
          },
          {
            sensorUrl: "SDS011:24589",
          },
          {
            sensorUrl: "SDS011:14807",
          },
          {
            sensorUrl: "SDS011:24625",
          },
          {
            sensorUrl: "SDS011:13439",
          },
          {
            sensorUrl: "SDS011:11006",
          },
          {
            sensorUrl: "SDS011:24835",
          },
          {
            sensorUrl: "SDS011:16723",
          },
          {
            sensorUrl: "SDS011:11556",
          },
          {
            sensorUrl: "SDS011:13018",
          },
          {
            sensorUrl: "SDS011:26612",
          },
          {
            sensorUrl: "SDS011:25001",
          },
          {
            sensorUrl: "SDS011:11554",
          },
          {
            sensorUrl: "SDS011:12990",
          },
          {
            sensorUrl: "SDS011:14803",
          },
          {
            sensorUrl: "SDS011:22078",
          },
          {
            sensorUrl: "SDS011:11552",
          },
        ],
        { val: 4 },
        { lat: 1 },
        { lon: 2 },
        { time: 9 },
        { servicePath: "/air/gbg" },
        { sensor: "SDS011" },
        { fromDate: this.initDate },
      ],
      sensorData: [],
    };
  },

  created() {
    this.sensorData = [
      [
        {
          sensorUrl: "AirQualityObserved:0001",
        },
        {
          sensorUrl: "AirQualityObserved:0002",
        },
        {
          sensorUrl: "AirQualityObserved:0003",
        },
      ],
      { val: 0 },
      { lat: 5 },
      { lon: 5 },
      { time: 12 },
      { servicePath: "/airquality/reference" },
      { sensor: "AirqualityObserved" },
      { fromDate: this.initDate },
    ];
    this.fromDate = this.initDate;
  },

  methods: {
    getValueWhenClicked(val) {
      this.newInc = val;
    },
    // message from child
    getIncValue(val) {
      this.sliderValue = val;
    },
    getTimeStamp(val) {
      this.timestampList = JSON.parse(JSON.stringify(val));
      if (this.selected == "airqualityObservedSelection") {
        this.lastTimestamp = this.timestampList[0][99].slice(0, -4);
        this.firstTimestamp = this.timestampList[0][0].slice(0, -4);
        // console.log("FIRSTTIME: ", this.firstTimestamp, "LASTTIME: ", this.lastTimestamp);
      } else if (this.selected == "NO2B43FSelection") {
        this.lastTimestamp = this.timestampList[1][99].replace(" ", "T");
        this.firstTimestamp = this.timestampList[1][0].replace(" ", "T");
      } else if (this.selected == "SDS011Selection") {
        this.lastTimestamp = this.timestampList[2][99].slice(0, -4);
        this.firstTimestamp = this.timestampList[2][0].slice(0, -4);
      }
    },
    getTimeValue(val, forward) {
      // dont use the first value in the array in luftdaten since
      // it is not correct date
      if (this.selected == "SDS011Selection") {
        this.displayTime = val[1];
      } else {
        this.displayTime = val[0];
      }

      this.loopValue = forward;

      // check if you are at the end of the array jump forward in time
      // to lastTimestamp. Make a new request with new timelimit
      if (forward === true) {
        // set speed of dot to 0
        this.options.duration = 0;
        this.jumpForward(this.lastTimestamp);
      } else {
        this.options.duration = 0.5;
      }
    },

    playButton() {
      this.playToggle = !this.playToggle;
      this.play = this.playToggle ? "Pause" : "Play";
    },
    // from datedropdown
    changeTime(selectedDates) {
      // dont run if loop is true
      if (!this.loopValue) {
        this.fromDate = this.timeFormatter(selectedDates[0]);
        this.updateSensorvalues(this.selected);
      }
    },
    // from sensordropdown
    entity(e) {
      this.selected = e.target.value.split(",");
      // remove quotes and turn it to string
      this.selected = JSON.stringify(this.selected[0]).replace(/["']/g, "");
      // console.log(JSON.stringify(this.selected[0]).replace(/["']/g, ""), this.selected, e)
      this.updateSensorvalues(this.selected);
    },

    // from reaching the end of timeline and jump forward with new request
    jumpForward(e) {
      let currentDateObject = new Date(e.substr(0, 10));
      let maxDateObject = new Date(this.config.maxDate);

      // check if reached the maxDate
      if (currentDateObject <= maxDateObject) {
        this.fromDate = e;
      } else {
        this.fromDate = this.config.minDate;
      }

      // set the datepicker date to the last date in the previous timeline
      this.initDate = this.fromDate;

      this.updateSensorvalues(this.selected);
    },

    updateSensorvalues(e) {
      this.selected = e;
      let selection = e;

      if (selection == "airqualityObservedSelection") {
        this.sensorData = this.dataAirqualityObserved;
        this.$set(this.sensorData, 7, { fromDate: this.fromDate });
      }
      if (selection == "NO2B43FSelection") {
        this.sensorData = this.dataNO2B43F;
        this.$set(this.sensorData, 7, { fromDate: this.fromDate });
      }
      if (selection == "SDS011Selection") {
        this.sensorData = this.dataSDS011;
        this.$set(this.sensorData, 7, { fromDate: this.fromDate });
      }
    },
  },
};
</script>

<style >
html,
body {
  overflow: hidden;
  margin: 0px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  /* margin-top: 0px; */
  /* background: #2c3e50; */
  /* height: 100%; */
}

#panelContainer {
  position: absolute;
  bottom: 0px;
  padding-top: 20px;
  width: 100%;
  height: 70px;
  background-color: rgba(255, 255, 255, 0.7);
  /* overflow-y: hidden; */
}
#date {
  margin-left: 5px;
  margin-right: 5px;
}
#prev {
  margin-left: 10px;
}
#next {
  margin-right: 10px;
}
#nextTest {
  margin-right: 10px;
}
#margin-b {
  margin-bottom: 20px;
}
#to_the_right_debug {
  position: absolute;
  right: 10px;
  top: 10px;
  background-color: rgba(255, 255, 255, 0.7);
}
</style>
