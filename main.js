import React, {Component} from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  ScrollView,
  InteractionManager,
} from 'react-native';

const Sound = require('react-native-sound');

const Button = ({title, onPress}) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={styles.button}>{title}</Text>
  </TouchableOpacity>
);

const Header = ({children}) => (<Text style={styles.header}>{children}</Text>);

const Feature = ({title, onPress, description, buttonLabel = "PLAY"}) => (
  <View style={styles.feature}>
    <Header>{title}</Header>
    <Button title={buttonLabel} onPress={() => InteractionManager.runAfterInteractions(onPress)}/>
  </View>);

const requireAudio = require('./advertising.mp3');

const remoteAudio = `https://languagezenstorage.blob.core.windows.net/media0/xgcUXjHhP8.mp3`;
const noop = () => {
};

/**
 * @param uri - of sound to play
 * @param basePath - e.g. Sound.MAIN_BUNDLE or '' for URLs
 * @param onReady - callback to run when sound is ready to go, and before we call play. You're passed the react-native-sound instance. Useful for setting up loops etc
 * @returns {Promise} that resolves when the sound has been played, or rejects with an error
 */
function playAudio(uri, basePath = '', onReady = noop) {
  return new Promise((res, rej) => {
    const s = new Sound(uri, basePath, (e) => {
      if (e) {
        handleError(e);
        rej(e);
        return;
      }
      onReady(s);
      s.play(() => {
        res();
        s.release();
      }); // Release when it's done so we're not using up resources
    })
  });
}

function handleError(e) {
  Alert.alert(`Error: ${e.message} code: ${e.code}`);
  console.log('error', e);
}

class MainView extends Component {

  constructor(props) {
    super(props);

    Sound.setCategory('Ambient', true); // true = mixWithOthers


    this.playSoundBundle = () => {
      playAudio('advertising.mp3', Sound.MAIN_BUNDLE)
        .catch(e => console.log(e))
    };

    this.playSoundBundleNotFound = () => {
      playAudio('this_file_does_not_exist.mp3', Sound.MAIN_BUNDLE)
        .catch(e => console.log(e))
    };

    this.playSoundLooped = () => {
      if (this.state.loopingSound) {
        return;
      }
      playAudio('advertising.mp3', Sound.MAIN_BUNDLE, (s) => {
        s.setNumberOfLoops(-1);
        this.setState({loopingSound: s});
      })
        .catch(e => console.log(e));
    };

    this.stopSoundLooped = () => {
      if (!this.state.loopingSound) {
        return;
      }

      this.state.loopingSound
        .stop()
        .release();
      this.setState({loopingSound: null});
    };

    this.playSoundFromRequire = () => {
      playAudio(requireAudio)
        .catch(e => console.log(e))
    };

    this.playSoundUrl = () => {
      if (this.state.preparing) {
        return;
      }
      this.setState({preparing: true});
      playAudio(remoteAudio, '', s => this.setState({preparing: false}))
        .catch(e => console.log(e))
    };

    this.state = {
      loopingSound: undefined,
      preparing: false,
    };
  }


  render() {
    return <ScrollView style={{flex: 1}}>
      <View style={styles.container}>
        <Feature title="Main bundle audio" onPress={this.playSoundBundle}/>
        {this.state.preparing
          ? <Feature title="Audio at remote URL" buttonLabel="Preparing..."/>
          : <Feature title="Audio at remote URL" onPress={this.playSoundUrl}/>
        }
        <Feature title="Non-existent bundle audio" onPress={this.playSoundBundleNotFound}/>
        <Feature key="require" title="Audio via 'require' statement" onPress={this.playSoundFromRequire}/>
        {this.state.loopingSound
          ? <Feature title="Main bundle audio (looped)" buttonLabel="STOP" onPress={this.stopSoundLooped}/>
          : <Feature title="Main bundle audio (looped)" buttonLabel="PLAY" onPress={this.playSoundLooped}/>
        }
      </View>
    </ScrollView>
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
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  feature: {
    padding: 20,
    alignSelf: 'stretch',
  }
});

export default MainView;
