import { UP, DOWN, LEFT, RIGHT } from '../consts.js'
const { useState } = require("react")

const Controls = ({setKeysHeld}) => {
  const [pressed, setPressed] = useState(false)
  const [touchStartLocation, setTouchStartLocation] = useState({x: -1, y: -1})
  const [touchDragVector, setTouchDragVector] = useState({x: 0, y: 0})

  // const jumping = 
  // const movingLeft = touchDragVector.x < -30
  // const movingRight = touchDragVector.x > 30

  const touchStarted = (touch) => {
    setTouchStartLocation({x: touch.clientX, y: touch.clientY})
  }
  const touchEnded = () => {
    setTouchStartLocation({x: -1, y: -1})
    setTouchDragVector({x: 0, y: 0})
  }
  const touchMoved = (touch) => {
    const touchDragVector = {
      x: touch.clientX - touchStartLocation.x,
      y: touch.clientY - touchStartLocation.y
    }
    setTouchDragVector(touchDragVector)
    const keysHeld = {}
    keysHeld[UP] = touchDragVector.y < -30
    keysHeld[LEFT] = touchDragVector.x < -30
    keysHeld[RIGHT] = touchDragVector.x > 30
    setKeysHeld(keysHeld)
  }

  const displayOffset = {...touchDragVector}
  console.log(displayOffset)
  if (displayOffset.x > 30) { displayOffset.x = 30 }
  if (displayOffset.x < -30) { displayOffset.x = -30 }
  if (displayOffset.y < -30) { displayOffset.y = -30 }
  if (displayOffset.y > 0) { displayOffset.y = 0 }

  const styles = {
    wrapper: {
      position: "relative",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "flex-end",
      height: "100%",
      marginRight: "-75px",
    },
    button: {
      backgroundColor: "white",
      width: "35px",
      height: "35px",
      borderRadius: "100%",
      minHeight: "1px",
      border: "1px solid gray",
      transform: `translateX(${displayOffset.x}px) translateY(${displayOffset.y}px)`,
    }
  }

  return (
    <span style={styles.wrapper}>
      <div
        onTouchStart={(event) => {
          {/* event.preventDefault() */}
          setPressed(true)
          touchStarted(event.touches[0])
        }}
        onTouchMove={(event) => {
          {/* event.preventDefault() */}
          touchMoved(event.touches[0])
        }}
        onTouchEnd={(event) => {
          {/* event.preventDefault() */}
          setPressed(false)
          touchEnded()
        }}
        style={styles.button}>
      </div>
    </span>
  )
}

export default Controls;