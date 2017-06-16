import React, {Component} from 'react';

import {StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert} from 'react-native';
const Sound = require('react-native-sound');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 30,
    padding: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(240,240,240,1)',
  },
  button: {
    fontSize: 20,
    backgroundColor: 'rgba(220,220,220,1)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(80,80,80,0.5)',
    overflow: 'hidden',
    padding: 7,
  },
  header: {
    textAlign: 'left',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  feature: {
    flexDirection: 'row',
    padding: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgb(180,180,180)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(230,230,230)',
  },
});

const Button = ({title, onPress}) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={styles.button}>{title}</Text>
  </TouchableOpacity>
);

const Header = ({children, style}) => <Text style={[styles.header, style]}>{children}</Text>;

const Feature = ({title, onPress, description, buttonLabel = 'PLAY', win, fail}) => (
  <View style={styles.feature}>
    <Header style={{flex: 1}}>{title}</Header>
    {win ? <Text>{'\u2713'}</Text> : null}
    {fail ? <Text>{'\u274C'}</Text> : null}
    <Button title={buttonLabel} onPress={onPress} />
  </View>
);

const audioTests = [
  {
    title: 'mp3 in bundle',
    url: 'advertising.mp3',
    basePath: Sound.MAIN_BUNDLE,
  },
  {
    title: 'mp3 in bundle (looped)',
    url: 'advertising.mp3',
    basePath: Sound.MAIN_BUNDLE,
    onPrepared: (sound, component) => {
      sound.setNumberOfLoops(-1);
      component.setState({tests: {...component.state.tests, ['mp3 in bundle (looped)']: true}});
      component.setState({loopingSound: sound});
    },
  },
  {
    title: 'mp3 via require()',
    url: require('./advertising.mp3'),
  },
  {
    title: 'mp3 remote download',
    url: 'https://raw.githubusercontent.com/zmxv/react-native-sound-demo/master/advertising.mp3',
  },
  {
    title: 'aac remote download',
    url: 'https://raw.githubusercontent.com/zmxv/react-native-sound-demo/master/pew2.mp3',
  },
  {
    title: 'aac via require()',
    url: require('./pew2.aac'),
  },
];

/**
 * Generic play function for majority of tests
 */
function playSound(testInfo, component) {
  const sound = new Sound(testInfo.url, testInfo.basePath || '', e => {
    if (e) {
      Alert.alert('error', e.message);
      component.setState({tests: {...component.state.tests, [testInfo.title]: false}});
    } else {
      // Run optional pre-play callback
      testInfo.onPrepared && testInfo.onPrepared(sound, component);
      sound.play(() => {
        // Success counts as getting to the end
        component.setState({tests: {...component.state.tests, [testInfo.title]: true}});
        // Release when it's done so we're not using up resources
        sound.release();
      });
    }
  });
}

class MainView extends Component {
  constructor(props) {
    super(props);

    Sound.setCategory('Playback', true); // true = mixWithOthers

    // Special case for stopping
    this.stopSoundLooped = () => {
      if (!this.state.loopingSound) {
        return;
      }

      this.state.loopingSound.stop().release();
      this.setState({loopingSound: null, tests: {...this.state.tests, ['mp3 in bundle (looped)']: true}});
    };

    this.state = {
      loopingSound: undefined,
      tests: {},
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <Header style={styles.title}>react-native-sound-demo</Header>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
          {audioTests.map(testInfo => {
            const win = this.state.tests[testInfo.title] === true;
            const fail = this.state.tests[testInfo.title] === false;
            return (
              <Feature
                win={win}
                fail={fail}
                key={testInfo.title}
                title={testInfo.title}
                onPress={() => {
                  return playSound(testInfo, this);
                }}
              />
            );
          })}
          <Feature title="mp3 in bundle (looped)" buttonLabel={'STOP'} onPress={this.stopSoundLooped} />
        </ScrollView>
      </View>
    );
  }
}

export default MainView;
