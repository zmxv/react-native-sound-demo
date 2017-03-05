import React, {Component} from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

import RNFetchBlob from "react-native-fetch-blob";
const Sound = require('react-native-sound');

const mp3Url = 'http://www.stephaniequinn.com/Music/Allegro%20from%20Duet%20in%20C%20Major.mp3';
const localMp3Path = RNFetchBlob.fs.dirs.DocumentDir + '/downloaded.mp3';

const Button = ({title, onPress}) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={styles.button}>{title}</Text>
  </TouchableOpacity>
);

const Header = ({children}) => (<Text style={styles.header}>{children}</Text>);

const Feature = ({title, onPress, description, buttonLabel = "PLAY"}) => (
  <View style={styles.feature}>
    <Header>{title}</Header>
    <Button title={buttonLabel} onPress={onPress}/>
  </View>);

const requireAudio = require('./advertising.mp3');

class MainView extends Component {

  constructor(props) {
    super(props);

    Sound.setCategory('Ambient'); // true = mixWithOthers

    this.playSoundBundle = () => {
      const s = new Sound('advertising.mp3', Sound.MAIN_BUNDLE, (e) => {
        if (e) {
          console.log('error', e);
          this.setState({error: error.message});
        } else {
          s.setSpeed(1);
          console.log('duration', s.getDuration());
          s.play(() => s.release()); // Release when it's done so we're not using up resources
        }
      });
    };

    this.playSoundLooped = () => {
      if (this.state.loopingSound) {
        return;
      }
      const s = new Sound('advertising.mp3', Sound.MAIN_BUNDLE, (e) => {
        if (e) {
          console.log('error', e);
          this.setState({error: error.message});
        }
        s.setNumberOfLoops(-1);
        s.play();
      });
      this.setState({loopingSound: s});
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
      const s = new Sound(requireAudio, (e) => {
        if (e) {
          console.log('error', e);
          this.setState({error: error.message});
          return;
        }

        s.play(() => s.release());
      });
    };

    this.downloadSound = () => {
      RNFetchBlob
        .config({path: localMp3Path})
        .fetch('GET', mp3Url)
        .progress({interval: 250}, (received, total) => {
          console.log('progress', received / total);
          this.setState({downloadProgress: Math.floor((received * 100) / total)});
        })
        .then((res) => {
          this.setState({downloadProgress: undefined, downloadedFileExists: true});
          console.log('The file saved to ', res.path());
          this.setState({error: undefined});
        })
        .catch(e => {
          this.setState({downloadProgress: undefined});
          console.warn(`download failed with ${e.message}`);
          this.setState({error: e.message});
        });
    };

    this.downloadSoundDelete = () => {
      RNFetchBlob.fs.unlink(localMp3Path)
        .then(() => this.setState({downloadedFileExists: false}))
        .catch(e => this.setState({error: e.message}));
    };

    this.playDownloaded = () => {
      const s = new Sound(localMp3Path, '', error => {
        if (error) {
          this.setState({
            error: error.message,
            downloadedSound: undefined,
          });
          return;
        }
        this.setState({downloadedSound: s});
        s.play(() => s.release());
      });
    };

    this.stopDownloaded = () => {
      if (this.state.downloadedSound) {
        this.state.downloadedSound.stop()
          .release();
        this.setState({downloadedSound: undefined});
      }
    };

    this.state = {
      error: undefined,
      loopingSound: undefined,
      downloadedFileExists: false,
      downloadProgress: undefined,
      downloadedSound: undefined,
    };
  }

  componentDidMount() {
    // Do we have the downloaded file downloaded earlier?
    RNFetchBlob.fs.exists(localMp3Path)
      .then(exists => this.setState({downloadedFileExists: exists}));
  }

  renderiOSOnlyFeatures() {
    return [
      <Feature key="require" title="Audio via 'require' statement" onPress={this.playSoundFromRequire}/>,
    ]
  }

  renderDownload() {
    const downloadButtonLabel = this.state.downloadProgress === undefined
      ? 'GO'
      : Number(this.state.downloadProgress) + "%";

    if (!this.state.downloadedFileExists) {
      return <Feature title="Download" buttonLabel={downloadButtonLabel} onPress={this.downloadSound}/>;
    } else {
      const del = <Feature
        key="rm"
        title="Downloaded File"
        buttonLabel={'Delete'}
        onPress={this.downloadSoundDelete}
      />;
      if (!this.state.downloadedSound) {
        return [<Feature key="df" title="Downloaded file" buttonLabel={'PLAY'} onPress={this.playDownloaded}/>, del];
      } else {
        return [<Feature key="df" title="Downloaded file" buttonLabel={'STOP'} onPress={this.stopDownloaded}/>, del];
      }
    }
  }

  render() {

    return <View style={styles.container}>
      {
        this.state.error
          ? <Text>{this.state.error}</Text>
          : undefined
      }
      <Feature title="Main bundle audio" onPress={this.playSoundBundle}/>
      {this.state.loopingSound
        ? <Feature title="Main bundle audio (looped)" buttonLabel={'STOP'} onPress={this.stopSoundLooped}/>
        : <Feature title="Main bundle audio (looped)" buttonLabel={'PLAY'} onPress={this.playSoundLooped}/>
      }
      { this.renderDownload() }
      { Platform.OS === 'ios' ? this.renderiOSOnlyFeatures() : null }
    </View>
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
