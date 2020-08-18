/* Encoder Library - Basic Example
   http://www.pjrc.com/teensy/td_libs_Encoder.html

   This example code is in the public domain.
*/

#include <Encoder.h>

Encoder encoder(2, 3);

void setup() {
  Serial.begin(9600);
  Serial.println("Basic Encoder Test:");
}

long oldPosition  = -999;

void loop() {
  long newPosition = encoder.read();

  if (newPosition != oldPosition) {
    oldPosition = newPosition;
    //Serial.println(newPosition);
    Serial.println(map(newPosition, 1, 10000, 0, 10));
  } else {
    // reset when no movement
    encoder.write(0);
    //Serial.println(newPosition);
    Serial.println(map(newPosition, 1, 10000, 0, 10));
  }
}
