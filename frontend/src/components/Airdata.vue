
<template>
  <div>
    <div>
      <br />
    </div>
    <div id="sensor-container">
      <div v-if="wait">
        <div v-if="debugToggle">
          <div v-for="(sensors, sensorindex) in sensorValue" :key="sensors.sensor">
            <span v-if="airdata[2][sensorindex] !=null">
              <b>Sensor{{sensorindex+1}}:</b>
              {{ airdata[0] }}
              <span
                v-for="sensorData in airdata.length-1"
                :key="sensorData"
              >
                <span id="col_value">
                <b>{{title[sensorData-1]}}</b>
                {{ airdata[sensorData][sensorindex] }}
              </span>
            </span>
            </span>

            <span v-if="airdata[2][sensorindex] ==null">
              <span id="col_no_value">
              <b>Sensor{{sensorindex+1}}:</b>
              {{ airdata[0] }}
              <span
                v-for="sensorData in airdata.length-1"
                :key="sensorData"
              >
                <b>{{title[sensorData-1]}}</b>
                {{ airdata[sensorData][sensorindex] }}
              </span>
            </span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <br />
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3000");

export default {
  name: "Airdata",
  props: {
    sensorData: {
      type: Array,
    },
    playToggle: {
      type: Boolean,
    },
    debugToggle: {
      type: Boolean,
    },
    nextVal: {
      type: Boolean,
    },
    prevVal: {
      type: Boolean,
    },
    newInc: {
      type: Number,
    },
  },

  data: function () {
    return {
      sensorType: "",
      fromDate: "",
      latitude: [],
      longitude: [],
      sensorValue: [],
      attributeName: "",
      airdata: [],
      inc: 0,
      sensVal: "",
      latVal: "",
      lonVal: "",
      timeVal: "",
      timestamp: [],
      updatedSensorVal: [],
      updatedTimeVal: [],
      updatedLonVal: [],
      updatedLatVal: [],
      backwardTimeVal: "",
      sensors: [],
      updatedSensors: [],
      title: ["time: ", "value: ", "lat: ", "lon: "],
      wait: false,
      prevnext: 0,
      next: 0,
      prev: 0,
      encoderVal: 0,
      forward: false,
      backward: false,

      // gameLoop
      limit: 100,
      now: 0,
      then: 0,
      interval: 1000 / 1, // set fps
      delta: 0,
      incAmount: 1,

      headers: {
        "Fiware-service": "loviot",
        "Fiware-servicepath": "/air/gbg",
        "X-Auth-Token": "c44c7dc0a5e625b5b5ae002ee600bd9d8af1346c",
        "X-Requested-With": "XMLHttpRequest",
      },
    };
  },

  created() {
    socket.on("encoder", (val) => {
      this.encoderVal = val;
    });
  },

  methods: {
    getData(entity) {
      (this.wait = false),
        // reset sensorlist
        (this.sensors.length = 0);
      this.encoderVal = 0;

      // const corsUrlPrefix = "https://cors-anywhere.herokuapp.com/"
      const corsUrlPrefix = "https://cors-anywhere.tiigbg.se/";
      const orionUrl = "http://62.88.149.35:8068/v2/entities/";

      // set sensorurls
      entity[0].forEach((el) => {
        this.sensors.push(el);
      });
      // set sensor
      this.sensorType = entity[6].sensor;

      // set headers
      this.headers = {
        "Fiware-service": "loviot",
        "Fiware-servicepath": entity[5].servicePath,
        "X-Auth-Token": "c44c7dc0a5e625b5b5ae002ee600bd9d8af1346c",
        "X-Requested-With": "XMLHttpRequest",
      };

      // set correct sensvalue, lat and long
      this.sensVal = parseInt(entity[1].val);
      this.latVal = parseInt(entity[2].lat);
      this.lonVal = parseInt(entity[3].lon);
      this.timeVal = parseInt(entity[4].time);

      let promises = [];

      this.sensors.forEach((e) => {
        promises.push(
          axios
            .get(
              corsUrlPrefix +
                orionUrl +
                e.sensorUrl +
                "?fromDate=" +
                entity[7].fromDate +
                "&limit=" +
                this.limit,
              { headers: this.headers }
            )
            .catch((err) => {
              console.log(
                "noddata",
                err,
                "Url:",
                corsUrlPrefix +
                  orionUrl +
                  e.sensorUrl +
                  "?fromDate=" +
                  entity[7].fromDate +
                  "&limit=" +
                  this.limit,
                "Headers: ",
                this.headers
              );
            })
        );
      console.log(corsUrlPrefix +
                orionUrl +
                e.sensorUrl +
                "?fromDate=" +
                entity[7].fromDate +
                "&limit=" +
                this.limit,
              { headers: this.headers })});
      axios
        .all(promises)
        .then(
          axios.spread((...args) => {
            this.updatedSensors = args;
            this.wait = true;
            // reset array
            this.sensorValue.splice(0);
            this.latitude.splice(0);
            this.longitude.splice(0);
            this.timestamp.splice(0);

            // check what sensor
            if (this.sensorType == "AirqualityObserved") {
              this.updatedSensors.forEach((el) => {
                try {
                  this.sensorValue.push(
                    el.data.data.attributes[this.sensVal].values
                  );
                  this.latitude.push(
                    el.data.data.attributes[this.latVal].values
                  );
                  this.longitude.push(
                    el.data.data.attributes[this.lonVal].values
                  );
                  this.timestamp.push(el.data.data.index);
                } catch (err) {
                  console.log(
                    "UNDEFINED sensor, some sensors seems to be down"
                  );
                }
              });

              this.attributeName = this.updatedSensors[0].data.data.attributes[
                this.sensVal
              ].attrName;
            } else if (this.sensorType == "NO2B43F") {
              this.updatedSensors.forEach((el) => {
                try {
                  this.sensorValue.push(
                    el.data.data.attributes[this.sensVal].values
                  );
                  this.latitude.push(
                    el.data.data.attributes[this.latVal].values
                  );
                  this.longitude.push(
                    el.data.data.attributes[this.lonVal].values
                  );
                  this.timestamp.push(
                    el.data.data.attributes[this.timeVal].values
                  );
                } catch (err) {
                  console.log(
                    "UNDEFINED sensor, some sensors seems to be down"
                  );
                }
              });

              this.attributeName = this.updatedSensors[0].data.data.attributes[
                this.sensVal
              ].attrName;
            } else if (this.sensorType == "SDS011") {
              this.updatedSensors.forEach((el) => {
                try {
                  this.sensorValue.push(
                    el.data.data.attributes[this.sensVal].values
                  );

                  this.latitude.push(
                    el.data.data.attributes[this.latVal].values
                  );
                  this.longitude.push(
                    el.data.data.attributes[this.lonVal].values
                  );
                  this.timestamp.push(
                    el.data.data.attributes[this.timeVal].values
                  );
                } catch (err) {
                  console.log(
                    "UNDEFINED sensor, some sensors seems to be down"
                  );
                }
              });

              this.attributeName = this.updatedSensors[0].data.data.attributes[
                this.sensVal
              ].attrName;
            }
          })
        )
        .catch((errors) => {
          console.log("ERROR_airdata.vue", errors);
        });
    },



    stepforward() {
      this.inc += 1;
    },

    stepbackward() {
      if (this.inc > 0) this.inc -= 1;
    },

    loop() {
      requestAnimationFrame(this.loop);
      this.now = Date.now();
      this.delta = this.now - this.then;

      if (this.delta > this.interval) {
        this.then = this.now - (this.delta % this.interval);

        // listen for playerchanges
        this.playToggle ? (this.incAmount = 1) : (this.incAmount = 0);
        // reset array
        this.updatedSensorVal.splice(0);
        this.updatedTimeVal.splice(0);
        this.updatedLatVal.splice(0);
        this.updatedLonVal.splice(0);

        if (this.sensorType == "AirqualityObserved") {
          try {
            this.sensorValue.forEach((el) => {
              this.updatedSensorVal.push(el[this.inc]);
            });
            this.timestamp.forEach((el) => {
              this.updatedTimeVal.push(
                // el[this.inc].replace("T", " ").replace(".000", "")
                el[this.inc]
              );
            });
            this.longitude.forEach((el) => {
              this.updatedLonVal.push(el[this.inc].coordinates[1]);
            });
            this.latitude.forEach((el) => {
              this.updatedLatVal.push(el[this.inc].coordinates[0]);
            });
          } catch (err) {
            console.log("no data yet for the loop ...");
          }
        } else if (this.sensorType == "NO2B43F") {
          try {
            this.sensorValue.forEach((el) => {
              this.updatedSensorVal.push(el[this.inc]);
            });
            this.timestamp.forEach((el) => {
              this.updatedTimeVal.push(el[this.inc]);
            });
            this.longitude.forEach((el) => {
              this.updatedLonVal.push(el[this.inc]);
            });
            this.latitude.forEach((el) => {
              this.updatedLatVal.push(el[this.inc]);
            });
          } catch (err) {
            console.log("no data yet for the loop ...");
          }
        } else if (this.sensorType == "SDS011") {
          try {
            this.sensorValue.forEach((el) => {
              this.updatedSensorVal.push(el[this.inc]);
            });
            this.timestamp.forEach((el) => {
              this.updatedTimeVal.push(
                // el[this.inc].replace("T", " ").replace(".000", "")
                el[this.inc]
              );
            });
            this.longitude.forEach((el) => {
              this.updatedLonVal.push(el[this.inc]);
            });
            this.latitude.forEach((el) => {
              this.updatedLatVal.push(el[this.inc]);
            });
          } catch (err) {
            console.log("no data yet for the loop ...");
          }
        }
        // this.inc = this.inc -

        this.inc += this.incAmount;
        this.sendToMap();
      }
      this.inc += Math.floor(this.encoderVal);

      // set update and forward time to false
      this.forward = false;

      // console.log("INC", this.inc);
      if (this.inc < 0) {
        this.inc = 0;
      }
      if (this.inc > this.limit) {
        this.forward = true;
        this.inc = this.limit;
      }
    },

    sendToMap() {
      this.airdata = [
        this.attributeName,
        this.updatedTimeVal,
        this.updatedSensorVal,
        this.updatedLatVal,
        this.updatedLonVal,
        this.wait,
      ];

      eventBus.$emit("passAirdata", this.airdata);
    },
  },

  watch: {
    timestamp(val) {
      this.$emit("timeStampList", val);
    },
    inc(val) {
      this.$emit("changeIncVal", val);
    },
    updatedTimeVal(val) {
      //console.log("UPDATEIMTEVAL BACK", this.backward)
      this.$emit("changeTimeVal", val, this.forward);
    },

    sensorData: {
      deep: true,
      immediate: true,
      handler(newValue) {
        try {
          this.getData(newValue);
          this.loop();
          this.then = Date.now();

          this.inc = 0;
        } catch (err) {
          console.log("no data yet ...");
        }
      },
    },
    newInc: {
      deep: true,
      immediate: true,
      handler(newValue) {
        try {
          this.inc = newValue;
        } catch (err) {
          console.log("no data yet ...");
        }
      },
    },
  },
};
</script>

<style scoped>
#sensor-container {
  z-index: 0;
  background-color: rgba(255, 255, 255, 0.7);
}
#col_no_value {
  color: brown;
}
#col_value {
  color: black;
}
</style>