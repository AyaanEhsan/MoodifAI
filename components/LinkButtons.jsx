
import { View, TouchableOpacity, Text, Linking } from 'react-native';
import tw from 'tailwind-react-native-classnames';

const LinkButtons = ({ url }) => {
  function handlePress() {
    Linking.openURL(url);
  }

  return (
    <View style={tw`flex-row justify-center items-center my-4`}>
      <TouchableOpacity style={tw`bg-yellow-500 px-4 py-2 rounded-lg shadow m-2`} onPress={handlePress}>
        <Text style={tw`text-gray-900 text-lg font-bold`}>Predict Mood</Text>
      </TouchableOpacity>
      <TouchableOpacity style={tw`bg-yellow-500 px-4 py-2 rounded-lg shadow m-2`} onPress={handlePress}>
        <Text style={tw`text-gray-900 text-lg font-bold`}>Find Song</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LinkButtons;