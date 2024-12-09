import { SafeAreaView, Text, ScrollView, Button, StyleSheet } from 'react-native';
import { useState } from 'react';
import FlatCards from "../components/FlatCards";
import LinkButtons from "../components/LinkButtons";
import tw from 'tailwind-react-native-classnames';
// import LinearGradient from 'react-native-linear-gradient';



export default function HomeScreen() {

    const [accelerometer, setAccelerometer ] = useState({
        x: 0,
        y: 0,
        z:0
    });
    const [lightsensor, setLightsensor] = useState(0);
    const [weather, setWeather] = useState({ 
        temp: 0, weather: "default"
    });
    const [gyroscope, setGyroscope ] = useState({
        x: 0,
        y: 0,
        z:0
    });

    const [message, setMessage] = useState("")
    const [mood, setMood] = useState("")
    const [genre, setGenre] = useState("")

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.appName}>MoodifAI</Text>
      <ScrollView>
        <FlatCards 
        accelerometer={accelerometer} 
        setAccelerometer={setAccelerometer}
        lightsensor = {lightsensor}
        setLightsensor = {setLightsensor}
        weather = {weather}
        setWeather = {setWeather}
        gyroscope={gyroscope}
        setGyroscope={setGyroscope}
        message = {message}
        setMessage = {setMessage}
        mood = {mood}
        setMood = {setMood}
        genre = {genre}
        setGenre= {setGenre}
        />


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: {
      backgroundColor: '#f8fafc', // Light background color
      flex: 1,
    },
    appName: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#f1697a', // Darker text for contrast    1f2937
      textAlign: 'center',
      paddingVertical: 16,
      fontFamily: 'Arial', // Add your preferred font family
      textShadowColor: '#d1d5db', // Light shadow for text
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    flatCards: {
      margin: 8,
      padding: 16,
      backgroundColor: '#ffffff', // White card background
      borderRadius: 8,
      shadowColor: '#000', // Shadow color
      shadowOffset: { width: 0, height: 2 }, // Offset for shadow
      shadowOpacity: 0.1, // Shadow opacity
      shadowRadius: 4, // Shadow blur radius
      elevation: 2, // For Android shadow
    },
  });