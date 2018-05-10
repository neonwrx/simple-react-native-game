import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  Image,
  ImageBackground,
  PanResponder,
  Button,
} from 'react-native';

import Enemy from './src/components/Enemy';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        if (gesture.dx > 0) {
          this.movePlayer('right')
        } else if (gesture.dx < 0) {
          this.movePlayer('left')
        }
      },
      onPanResponderRelease: () => {}
    });
    this.state = {
      movePlayerVal: new Animated.Value(40),
      playerSide: 'left',
      points: 0,

      moveEnemyval: new Animated.Value(0),
      enemyStartPosX: 0,
      enemySide: 'left',
      enemySpeed: 3000,

      gameOver: false,
      showLastScreen: false,
      panResponder,
    };

  }

  showLastScreen() {
    if (this.state.showLastScreen) {
      return (
        <View style={styles.showLastScreen}>
          <View style={styles.dialogScreen}>
            <Text style={{fontSize: 18}}>Вы проиграли!</Text>
            <Button
              onPress={this.gameOver.bind(this)}
              title="Начать сначала"
            />
          </View>
        </View>
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <ImageBackground source={require('./src/img/bg.png')} style={styles.container}  {...this.state.panResponder.panHandlers}>

        <View style={{ flex: 1, alignItems: 'center', marginTop: 80 }}>
          <View style={styles.points}>
            <Text style={{ fontWeight: 'bold', fontSize: 40 }}>{this.state.points}</Text>
          </View>
        </View>

        { this.showLastScreen() }

        <Animated.Image
          source={require('./src/img/car.png')}
          style={{
            height: 80,
            width: 130,
            position: 'absolute',
            zIndex: 1,
            bottom: 50,
            resizeMode: 'stretch',
            transform: [
              { translateX: this.state.movePlayerVal }
            ]
          }}
        ></Animated.Image>
        <Enemy  enemyImg={require('./src/img/enemy.png')}
                enemyStartPosX={this.state.enemyStartPosX}
                moveEnemyval={this.state.moveEnemyval} />
        <View style={styles.controls}>
          <Text style={styles.left} onPress={ () => this.movePlayer('left')}>{'<'}</Text>
          <Text style={styles.right} onPress={ () => this.movePlayer('right')}>{'>'}</Text>
        </View>
      </ImageBackground>
    );
  }

  movePlayer(direction) {
    if (direction == 'right') {
      this.setState({ playerSide: 'right' });

      Animated.spring(
        this.state.movePlayerVal,
        {
          toValue: Dimensions.get('window').width - 160,
          tension: 120,
        }
      ).start();
    } else if (direction == 'left') {
      this.setState({ playerSide: 'left' });

      Animated.spring(
        this.state.movePlayerVal,
        {
          toValue: 40,
          tension: 120,
        }
      ).start();
    }
  }

  componentDidMount() {
    this.animateEnemy();
  }

  animateEnemy() {
    this.state.moveEnemyval.setValue(-100);
    var windowH = Dimensions.get('window').height;
    var r = Math.floor(Math.random() * 2) + 1;

    if (r == 2) {
      r = 40;
      this.setState({enemySide: 'left'});
    } else {
      r = Dimensions.get('window').width - 160;
      this.setState({enemySide: 'right'});
    }
    this.setState({enemyStartPosX: r});

    var refreshIntervalId = setInterval( () => {
      if (this.state.moveEnemyval._value > windowH - 280
          && this.state.moveEnemyval._value < windowH - 180
          && this.state.playerSide == this.state.enemySide) {
            clearInterval(refreshIntervalId);
            this.setState({ gameOver: true, showLastScreen: true });
            // this.gameOver();
          }
    }, 50);

    setInterval( () => {
      this.setState({enemySpeed: this.state.enemySpeed - 50});
    }, 20000);

    Animated.timing(
      this.state.moveEnemyval,
      {
        toValue: Dimensions.get('window').height,
        duration: this.state.enemySpeed,
      }
    ).start(event => {
      if (event.finished && this.state.gameOver == false) {
        clearInterval(refreshIntervalId);
        this.setState({points: ++this.state.points});
        this.animateEnemy();
      }
    });
  }

  gameOver() {
    this.setState({gameOver: false, points: 0, enemySpeed: 2200, showLastScreen: false});
    this.animateEnemy();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  points: {
    width: 80,
    height: 80,
    backgroundColor: '#fefefe',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 5
  },
  right: {
    flex: 1,
    color: '#fff',
    margin: 0,
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'left',
    marginLeft: 100
  },
  left: {
    flex: 1,
    color: '#fff',
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  showLastScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  dialogScreen: {
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 5,
    width: 260,
    height: 120,
    paddingTop: 10,
    paddingBottom: 10,
  }
});
