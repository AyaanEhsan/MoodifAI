import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, Alert, Button, StyleSheet } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { Audio } from 'expo-av'; // Import Audio for microphone
import { Accelerometer, LightSensor, Gyroscope } from 'expo-sensors';
import * as Location from 'expo-location';
import axios from 'axios';


function FlatCards({
    accelerometer,
        setAccelerometer,
        lightsensor,
        setLightsensor,
        weather,
        setWeather,
        gyroscope,
        setGyroscope,
        message,
        setMessage,
        mood,
        setMood,
        genre,
        setGenre
}) {
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [lightData, setLightData] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const [noiseLevel, setNoiseLevel] = useState(0);

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPEN_WEATHER_MAP = process.env.OPEN_WEATHER_MAP;

  let lightSubscription = null;

  const [sound, setSound] = useState(null);
  // Map genres to audio URLs
  const genreMusicMap = {
    'Lo-fi Chill': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    "EDM": 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    "Pop": 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'Indie Folk': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'Instrumental Cinematic': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  };
  
//   Function used to pause for specific milli seconds - Return promise cna be used with Async and Await 
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Handle Sensor 1 (Accelerometer) - 5 Seconds

const handleSensor1Press = async () => {
  // Set accelerometer update interval
  Accelerometer.setUpdateInterval(500);

    // Initialize a variable to store the latest data
  let latestData = { x: 0, y: 0, z: 0 };

  // Subscribe to accelerometer updates
  const subscription = await Accelerometer.addListener(({ x, y, z }) => {
    latestData = { x, y, z };
  });

  console.log("Before waited for 5000");

  // Wait for 5000ms (5 seconds)
  await wait(5000);

  console.log("After Waited for 5000");
  

  // Remove the subscription and process data
  subscription?.remove();

  let xAccel = latestData.x.toFixed(2);
  let yAccel = latestData.y.toFixed(2);
  let zAccel = latestData.z.toFixed(2);

  setAccelerometer({ x: xAccel, y: yAccel, z: zAccel });
  console.log(xAccel, yAccel, zAccel);
  
};

  // Handle Sensor 2 (Light Sensor) - 1 Seconds
  const handleSensor2Press = async () => {

    let entireLux;
    LightSensor.setUpdateInterval(500);
    lightSubscription = await LightSensor.addListener(({ illuminance }) => {
      entireLux = illuminance;
    });

    await wait(1000);
    lightSubscription?.remove();
    let lux = entireLux.toFixed(2);
    setLightsensor(lux)

  };

  // Handle Sensor 3 (Weather)
  const handleSensor3Press = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to fetch weather data.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

    //   const apiKey = 'bd8fddf7f7b23aa9faec95c716e4c7ad'; // Replace with your OpenWeatherMap API key
      const apiKey = OPEN_WEATHER_MAP; // Replace with your OpenWeatherMap API key
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
      );
      const data = await response.json();

      if (data && data.main && data.main.temp) {
        let temp = data.main.temp;
        let tempDesc = data.weather[0].description;
        setWeather({ temp: temp, weather:tempDesc });

      } else {
        Alert.alert('Error', 'Unable to fetch temperature data. Please try again later.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch weather data. Please try again.');
    }
  };

  // Handle Sensor 4 (Gyroscope)
  const handleSensor4Press = async () => {

    let gyroData = { x: 0, y: 0, z: 0 };

    Gyroscope.setUpdateInterval(500);
    const subscription = await Gyroscope.addListener(({ x, y, z }) => {
        gyroData = { x, y, z };
    });

    await wait(5000)
      subscription?.remove();
      let xGyro = gyroData.x.toFixed(2);
      let yGyro = gyroData.y.toFixed(2);
      let zGyro = gyroData.z.toFixed(2);
      setGyroscope({ x: xGyro, y: yGyro, z: zGyro })

  };

  async function getAllSensors() {
    await handleSensor1Press();
    await handleSensor2Press();
    await handleSensor3Press();
    await handleSensor4Press();
  } 


  useEffect(() => {
    let condolidateMessage= `
            
        The environment's sensor readings are as follows:
        Accelerometer: x: ${accelerometer.x}, y: ${accelerometer.y}, z: ${accelerometer.z}.
        Light luminosity: ${lightsensor} lx.
        Gyroscope: x: ${gyroscope.x}, y: ${gyroscope.y}, z: ${gyroscope.z}.
        Based on these sensor readings, predict the mood of the room and environment 
        for the person who owns this mobile device. Give equal weight to all sensors. 
        Strictly Give one word answer: Calm or Energetic or Happy or Gloomy or Tense.

    `;
        setMessage(condolidateMessage);
        },[accelerometer,
            lightsensor,
            weather,
            gyroscope]
    );

    async function predictMood() {
        
        console.log(message);
        console.log("In Predict Mood");



        const data = {
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant."
                },
                {
                    role: "user",
                    content: message
                }
            ]
        };

        
console.log("Before Open AI APi call");

        let response = await axios.post('https://api.openai.com/v1/chat/completions', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }})


        let predictedMood = await response.data.choices[0].message.content;
        setMood(predictedMood)
        console.log("After Open AI APi call");
        console.log(predictedMood);

                
        
    }

    async function predictGenre() {
        
        
        console.log(`Mood: ${mood} - Weathe condition ${weather.weather} ${weather.temp}`);
        console.log("In Predict Genre");



        const data = {
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant."
                },
                {
                    role: "user",
                    content: `Perdict the genre user might want to listen where their mood is ${mood},
                    weather temp is ${weather.temp} and weather condition is ${weather.weather}. Strictly give
                    one word answer: Lo-fi Chill or EDM or Pop or Indie Folk or Instrumental Cinematic`
                }
            ]
        };

        

        let response = await axios.post('https://api.openai.com/v1/chat/completions', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }})


        let predictedGenre = await response.data.choices[0].message.content;
        setGenre(predictedGenre)
        console.log("After Predict genre call");
        console.log(predictedGenre);
        
    }

    async function playGenre() {
        if (!genre) {
            alert('Please detect the genre first.');
            return;
          }
      
          let musicUrl = genreMusicMap[genre];
          console.log(musicUrl);
          
          if (!musicUrl) {
            alert(`No music available for the genre: ${genre}`);
            return;
          }

          try {
            // Stop any currently playing sound
            if (sound) {
              await sound.unloadAsync();
              setSound(null);
            }
      
            // Load and play the new sound
            const { sound: newSound } = await Audio.Sound.createAsync({ uri: musicUrl });
            setSound(newSound);
            await newSound.playAsync();
          } catch (error) {
            console.error('Error playing music:', error);
            alert('Could not play the music. Please try again.');
          }

    }

    async function stopMusic() {
        // Stop any currently playing sound
        if (sound) {
            await sound.unloadAsync();
            setSound(null);
        }
    }

  return (
    <View style={tw`flex-1 p-2`}>
      <ScrollView>
        {/* Sensor 1 */}
        {/* <TouchableOpacity
          style={tw`flex-row items-center bg-gray-800 rounded-lg m-4 mb-0 mt-0 shadow-lg p-4`}
          onPress={handleSensor1Press}
        > */}
          <TouchableOpacity style={styles.touchableOpacity} onPress={handleSensor1Press}>
          <Image source={{ uri: 'https://fastly.picsum.photos/id/942/200/200.jpg?hmac=Gh7W-H3ZGmweB9STLwQvq-IHkxrVyawHVTKYxy-u9mA' }} style={styles.image}/>

                <View style={styles.view}>

                    <Text style={styles.textMain}>Accelerometer</Text>

                        { (accelerometer.x !==0 || accelerometer.z !==0 || accelerometer.y !==0) && (
                        <View>
                            <Text style={styles.textSub}>X: {accelerometer.x}</Text>
                            <Text style={styles.textSub}>Y: {accelerometer.y}</Text>
                            <Text style={styles.textSub}>Z: {accelerometer.z}</Text>
                        </View>
                    )}
                    
                </View>

        </TouchableOpacity>

        {/* Sensor 2 */}
        <TouchableOpacity style={styles.touchableOpacity} onPress={handleSensor2Press} >
          <Image source={{ uri: 'https://fastly.picsum.photos/id/1031/200/200.jpg?hmac=E9kagTB6aHlVO8qmJYAQYYGJP3IvPT_v0N3ju0Rc4Gw' }} style={styles.image} />

                <View style={styles.view}>

                <Text style={styles.textMain}>Light sensor</Text>
                    { (lightsensor !==0 ) && (
                        <View>
                            <Text style={styles.textSub}>{lightsensor} lx</Text>
                        </View>
                    )}
                </View>

        </TouchableOpacity>

        {/* Sensor 3 */}
        <TouchableOpacity
          style={styles.touchableOpacity}
          onPress={handleSensor3Press}
        >
            <Image
                source={{ uri: 'https://fastly.picsum.photos/id/983/200/200.jpg?hmac=dWGIQKhPUTlF4pkeYDou10SJkQTJDRGf4usmJS38cNY' }}
                style={styles.image}
            />

            <View style={styles.view}>

                <Text style={styles.textMain}>Weather</Text>
                    { (weather.temp !==0 || weather.weather !== "default" ) && (
                        <View>
                            <Text style={styles.textSub}>Temperature: {weather.temp}°C </Text>
                            <Text style={styles.textSub}>Condition: {weather.weather} </Text>
                        </View>
                    )}
                </View>
        </TouchableOpacity>

        {/* Sensor 4 */}
        <TouchableOpacity
          style={styles.touchableOpacity}
          onPress={handleSensor4Press}
        >
          <Image
            source={{ uri: 'https://fastly.picsum.photos/id/677/200/200.jpg?hmac=x54KZ3q80hA0Sc36RV2FUoDZdE3R31oaC988MA1YE2s' }}
            style={styles.image}
          />

          <View style={styles.view}>

                <Text style={styles.textMain}>Gyroscope</Text>
                    { (gyroscope.x !==0 || gyroscope.y !== 0 || gyroscope.z !== 0) && (
                        <View>
                            <Text style={styles.textSub}>X: {gyroscope.x} </Text>
                            <Text style={styles.textSub}>X: {gyroscope.y} </Text>
                            <Text style={styles.textSub}>X: {gyroscope.z} </Text>

                        </View>
                    )}
                </View>



        </TouchableOpacity>


        {/* <View style={styles.moodContainer}>
            <Text style={styles.moodText}>Mood: {mood}</Text>
            <Text style={styles.genreText}>Genre: {genre}</Text>
        </View> */}


<View style={styles.moodContainer}>
  {mood ? (
    <Text style={styles.moodText}>Mood: {mood}</Text>
  ) : (
    <Text style={styles.moodText}>Mood</Text>
  )}
  {genre ? (
    <Text style={styles.genreText}>Genre: {genre}</Text>
  ) : (
    <Text style={styles.genreText}>Genre</Text>
  )}
</View>

        <View> 


        </View>


        <View style={styles.sensorButtonContainer}>
            {/* First Row */}

                <TouchableOpacity style={styles.sensorButton} onPress={getAllSensors}>
                <Text style={styles.sensorButtonText}>Give readings</Text>
                </TouchableOpacity>


            {/* Second Row */}

                <TouchableOpacity style={styles.sensorButton} onPress={predictMood}>
                    <Text style={styles.sensorButtonText}>Predict Mood</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sensorButton} onPress={predictGenre}>
                <Text style={styles.sensorButtonText}>Predict Genre</Text>
                </TouchableOpacity>


            {/* Third Row */}

                <TouchableOpacity style={styles.sensorButton} onPress={playGenre}>
                    <Text style={styles.sensorButtonText}>Play Song</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sensorButton} onPress={stopMusic}>
                <   Text style={styles.sensorButtonText}>Stop</Text>
                </TouchableOpacity>

            </View>


        


      </ScrollView>

    </View>
  );
}


const styles = StyleSheet.create({
    sensorButtonContainer: {
        padding: 20,
        backgroundColor: '#ffffff', // White for visibility
        borderRadius: 12,
        margin: 16,
        shadowColor: '#e01440', // Subtle shadow
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 9, // For Android
      },
      sensorButton: {
        backgroundColor: '#ed3a51', // Light gray for buttons
        borderRadius: 8,
        paddingVertical: 12,
        marginBottom: 12, // Space between buttons
        alignItems: 'center',
        shadowColor: 'black', // Subtle shadow for buttons
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 2,
      },
      sensorButtonText: {
        color: 'white', // Darker text for contrast
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Arial', // Consistent font
      },
      moodContainer: {
        padding: 20,
        backgroundColor: '#ffffff', // White for visibility
        borderRadius: 12,
        margin: 16,
        shadowColor: '#e01440', // Subtle shadow
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 9, // For Android
      },
      moodText: {
        color: '#ed3a51', // Darker color for emphasis
        fontSize: 20,
        fontWeight: '900',
        fontFamily: 'Arial', // Consistent font
        marginBottom: 10,
        textAlign: 'center',
        textShadowColor: '#d1d5db', // Light text shadow
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
      genreText: {
        color: '#ed3a51', // Subtle gray
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Arial',
        textAlign: 'center',
      },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light background
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Arial', // Consistent font
    color: '#1f2937', // Dark text for title
    textShadowColor: '#d1d5db',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  touchableOpacity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White background for visibility
    borderRadius: 10,
    margin: 16,
    marginBottom: 4,
    marginTop: 0,
    shadowColor: '#e0142f', // Shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
    padding: 12,
  },
  image: {
    height: 64,
    width: 64,
    borderRadius: 10,
  },
  view: {
    marginLeft: 24,
  },
  textMain: {
    color: '#1f2937', // Darker text
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  textSub: {
    color: '#6b7280', // Subtle gray
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Arial',
    marginLeft: 8,
  },
});


export default FlatCards;