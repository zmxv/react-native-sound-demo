import React, {Component} from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
const Sound = require('react-native-sound');

class MainView extends Component {
  render() {
    return <View style={styles.container}>
      <TouchableOpacity onPress={this.playSound}>
        <Text style={styles.button}>play</Text>
      </TouchableOpacity>
    </View>;
  }

  playSound() {
    const s = new Sound('advertising.mp3', Sound.MAIN_BUNDLE, (e) => {
      if (e) {
        console.log('error', e);
      } else {
        s.setSpeed(0.5);
        console.log('duration', s.getDuration());
        s.play();
      }
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    fontSize: 20,
    backgroundColor: 'silver',
    padding: 5,
  },
});

export default MainView;
