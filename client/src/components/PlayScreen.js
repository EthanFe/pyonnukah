import React, { useRef } from 'react';
import './PlayScreen.css';
import bunnyImage from '../images/bunny.png';
import bunnyJump from '../images/bunny_jump.png';
import menorahImage from '../images/menorah.png';
import candlesImage from '../images/candles_on_menorah.png';
import candleFlamesImage from '../images/candles_on_menorah_flames.png';
import candleFlameImage from '../images/single_candle_flame.png';
import singleCandle from '../images/single_candle_with_flame.png';

import background1 from '../images/background_1.jpg';
import background2 from '../images/background_2.jpg';
import background3 from '../images/background_3.jpg';
import background4 from '../images/background_4.jpg';
import background5 from '../images/background_5.jpg';
import background6 from '../images/background_6.jpg';
import background7 from '../images/background_7.jpg';
import background8 from '../images/background_8.jpg';
import Controls from './Controls';
import { UP, LEFT, RIGHT } from '../consts';

const backgroundImagesForLevels = [
  background1,
  background2,
  background3,
  background4,
  background5,
  background6,
  background7,
  background8
]

const totalScreenDimensions = {x: 487.5, y: 325}

const rangeOfPositionForObject = (objectDimensions) => ({
  x: totalScreenDimensions.x - objectDimensions.width,
  y: totalScreenDimensions.y - objectDimensions.height
})

const styles = {
  image: ({x, y}, dimensions, rotation = 0) => {
    const rangeOfPositionForImages = rangeOfPositionForObject(dimensions)
    return {
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      position: "absolute",
      top: rangeOfPositionForImages.y - (y / 1000) * rangeOfPositionForImages.y,
      left: (x / 1000) * rangeOfPositionForImages.x,
      transform: `rotate(${rotation}deg)`,
    }
  },
}

const PlayScreen = ({gameState, keyPressed, keyReleased}) => {
  const playAreaStyle = {
    width: `${totalScreenDimensions.x}px`,
    height: `${totalScreenDimensions.y}px`,
    borderRadius: "7px",
    position: "relative",
    backgroundImage: `url(${backgroundImagesForLevels[gameState.candlesOnLevel - 1]}`,
    backgroundSize: `${totalScreenDimensions.x}px`
  }

  const bunnies = Object.values(gameState.players).map(player => player.bunny)

  const keysHeld = useRef({})
  const updateKeysHeld = (newKeysHeld) => {
    if (!keysHeld.current[UP] && newKeysHeld[UP]) { keyPressed(UP) }
    if (keysHeld.current[UP] && !newKeysHeld[UP]) { keyReleased(UP) }
    if (!keysHeld.current[LEFT] && newKeysHeld[LEFT]) { keyPressed(LEFT) }
    if (keysHeld.current[LEFT] && !newKeysHeld[LEFT]) { keyReleased(LEFT) }
    if (!keysHeld.current[RIGHT] && newKeysHeld[RIGHT]) { keyPressed(RIGHT) }
    if (keysHeld.current[RIGHT] && !newKeysHeld[RIGHT]) { keyReleased(RIGHT) }
    keysHeld.current = newKeysHeld
  }

  return (
    <div className="wrapper-thing" tabIndex={0} onKeyDown={({key}) => keyPressed(key)} onKeyUp={({key}) => keyReleased(key)}>
      <div className="inner-wrapper-thing">
        <div style={playAreaStyle}>
          <Menorah position={{x: 500, y: 0}} displayShamus={gameState.shamusOnMenorah} candles={gameState.candlesOnLevel} litCandles={gameState.litCandles}/>
          <Bunnies bunnies={bunnies}/>
          <PyonPairCircles pyonPairs={gameState.activePyonPairs.map(pyonPair => ({id: pyonPair.id, originTime: pyonPair.originTime, bunnies: pyonPair.playerIds.map(playerId => gameState.players[playerId].bunny)}))}/>
          <Controls setKeysHeld={updateKeysHeld}/>
        </div>
      </div>
    </div>
  )
}

const PyonPairCircles = ({pyonPairs}) => {
  return (
    <>
      {pyonPairs.map(pyonPair => {
        const midPoint = {x: (pyonPair.bunnies[0].position.x + pyonPair.bunnies[1].position.x) / 2,
                          y: (pyonPair.bunnies[0].position.y + pyonPair.bunnies[1].position.y) / 2}
        return <PyonPairCircle key={pyonPair.id} position={midPoint} originTime={pyonPair.originTime}/>
      })}
    </>
  )
}

const PyonPairCircle = ({position, originTime}) => {
  const {x, y} = position

  const age = Date.now() - originTime
  const size = (age <= 400) ? (50 * (age / 400)) : (100 * ((age - 400) / 1600) + 50)

  const rangeOfPosition = rangeOfPositionForObject({width: size, height: size})

  return (
    <span
      style={{
        position: "absolute",
        left: (x / 1000) * rangeOfPosition.x,
        top: rangeOfPosition.y - (y / 1000) * rangeOfPosition.y,
      }}
      className={"pyon-pair-circle"}
    />
  )
}

const Bunnies = ({bunnies}) => {
  return (
    bunnies.map((bunny, index) => <Bunny key={index} bunny={bunny}/> )
  )
}

const Bunny = ({bunny}) => {
  const {position, carryingCandle, lastMovedDirection} = bunny
  const bunnyDimensions = {width: 64 * totalScreenDimensions.x / 900, height: 64 * totalScreenDimensions.x / 900}
  const image = position.y > 0 ? bunnyJump : bunnyImage
  const className = lastMovedDirection === 1 ? "bunny" : "bunny left-facing"
  const bunnyStyle = styles.image(position, bunnyDimensions)
  bunnyStyle.transform = ""
  return (
    <>
      {carryingCandle &&
      <img
        style={{
          ...styles.image({x: 0, y: position.y + 15}, {width: 24, height: 72}, 25),
          left: (position.x / 1000) * (totalScreenDimensions.x - bunnyDimensions.width) + 50
        }}
        src={singleCandle}
        alt=""
      />}
      <img
        style={bunnyStyle}
        src={image}
        alt=""
        className={className}
      />
    </>
  )
}

const Menorah = ({position, displayShamus, candles, litCandles}) => {
  const dimensions = {width: 524 * totalScreenDimensions.x / 900, height: 400 * totalScreenDimensions.y / 600}

  return (
    <>
      <Shamus display={displayShamus} position={position} dimensions={dimensions}/>
      <Candles position={position} dimensions={dimensions} candles={candles} litCandles={litCandles}/>
      <img
        style={styles.image(position, dimensions)}
        src={menorahImage}
        alt=""
      />
    </>
  )
}

const Shamus = ({position, dimensions, display}) => {
  if (!display) { return null }
  return (
    <>
      <img
        style={{...styles.image(position, dimensions), clipPath: "inset(0px 38% 0px 38%)"}}
        src={candlesImage}
        alt=""
      />
      <img
        style={{...styles.image({x: 500, y: 545}, {width: 70  * totalScreenDimensions.x / 900, height: 91 * totalScreenDimensions.x / 900})}}
        src={candleFlameImage}
        alt=""
      />
    </>
  )
}

const Candles = ({position, dimensions, candles, litCandles}) => {
  litCandles = {0: true}
  const cutoffValues = [
    {left: 38, right: 100},
    {left: 38, right: 89.5},
    {left: 38, right: 81.5},
    {left: 38, right: 73.5},
    {left: 38, right: 62},
    {left: 27.5, right: 62},
    {left: 19.5, right: 62},
    {left: 11.5, right: 62},
    {left: 0, right: 62}
  ]

  const flamePositionOffsets = [
    {x: ((totalScreenDimensions.x - 208 * totalScreenDimensions.x / 900) / totalScreenDimensions.x) * 1000, y: ((totalScreenDimensions.y - 305 * totalScreenDimensions.x / 900) / totalScreenDimensions.y) * 1000},
    {x: ((totalScreenDimensions.x - 251 * totalScreenDimensions.x / 900) / totalScreenDimensions.x) * 1000, y: ((totalScreenDimensions.y - 305 * totalScreenDimensions.x / 900) / totalScreenDimensions.y) * 1000},
    {x: ((totalScreenDimensions.x - 298 * totalScreenDimensions.x / 900) / totalScreenDimensions.x) * 1000, y: ((totalScreenDimensions.y - 305 * totalScreenDimensions.x / 900) / totalScreenDimensions.y) * 1000},
    {x: ((totalScreenDimensions.x - 344 * totalScreenDimensions.x / 900) / totalScreenDimensions.x) * 1000, y: ((totalScreenDimensions.y - 305 * totalScreenDimensions.x / 900) / totalScreenDimensions.y) * 1000},
    {x: ((totalScreenDimensions.x - 555 * totalScreenDimensions.x / 900) / totalScreenDimensions.x) * 1000, y: ((totalScreenDimensions.y - 305 * totalScreenDimensions.x / 900) / totalScreenDimensions.y) * 1000},
    {x: ((totalScreenDimensions.x - 600 * totalScreenDimensions.x / 900) / totalScreenDimensions.x) * 1000, y: ((totalScreenDimensions.y - 305 * totalScreenDimensions.x / 900) / totalScreenDimensions.y) * 1000},
    {x: ((totalScreenDimensions.x - 648 * totalScreenDimensions.x / 900) / totalScreenDimensions.x) * 1000, y: ((totalScreenDimensions.y - 305 * totalScreenDimensions.x / 900) / totalScreenDimensions.y) * 1000},
    {x: ((totalScreenDimensions.x - 692 * totalScreenDimensions.x / 900) / totalScreenDimensions.x) * 1000, y: ((totalScreenDimensions.y - 305 * totalScreenDimensions.x / 900) / totalScreenDimensions.y) * 1000},
  ]

  const candleFlames = Object.keys(litCandles).filter(index => litCandles[index]).map(index =>
    <img
      style={styles.image({x: flamePositionOffsets[index].x, y: flamePositionOffsets[index].y}, {width: 70 * totalScreenDimensions.x / 900, height: 91 * totalScreenDimensions.x / 900})}
      src={candleFlameImage}
      alt=""
      key={index}
    />
  )
  const cutoff = cutoffValues[candles]
  const clipPathValue = `polygon(${cutoff.left}% 100%, ${cutoff.left}% 0%, 38% 0%, 38% 100%, ${cutoff.right}% 100%, ${cutoff.right}% 0%, 100% 0%, 100% 100%)`
  return (
    <span style={{position: "relative"}}>
      <img
        style={{...styles.image(position, dimensions), clipPath: clipPathValue}}
        src={candlesImage}
        alt=""
      />
      <>
        {candleFlames}
      </>
      {/* <img
        style={{...styles.image(position, dimensions), clipPath: clipPathValue}}
        src={candleFlamesImage}
        alt=""
      /> */}
    </span>
  )
}

export default PlayScreen;