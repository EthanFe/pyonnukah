import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import './TransitionWrapper.css';

const TransitionWrapper = ({diffData, children, scale, transitionTime, transitionType}) => {

  const transitionClassNames = {
    "slideRight": "slide-right",
    "fade": "fade",
    "fadeOutOnly": "fade-out-only"
  }
  
  const [cachedRenderContent, setCachedRenderContent] = useState(null)
  const [currentData, setCurrentData] = useState(null)
  const [transitionState, setTransitionState] = useState("active")

  useEffect(() => {
    if (currentData !== diffData) {
      setCurrentData(diffData)
      setTransitionState("inactive")
      setTimeout(() => {
        setCachedRenderContent(children)
        setTransitionState("active")
      }, transitionTime * 1000 / 2)
    } else if (transitionState === "active") {
      setCachedRenderContent(children)
    }
  })

  return (
    <div style={{transform: `scale(${scale})`}}>
      <div
        className={"transition-wrapper " + transitionClassNames[transitionType] + " " + transitionState}
        style={{animationDuration: `${transitionTime / 2}s`}}>
          {cachedRenderContent}
      </div>
    </div>
  );

}

export default TransitionWrapper