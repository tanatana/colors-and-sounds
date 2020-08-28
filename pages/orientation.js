import HEAD from 'next/head'
import { useState, useEffect } from 'react';
import styles from '../styles/Controller.module.css'

export default function Pad({x, y}) {
  const [pos, setPos] = useState({x, y});
  const [color, setColor] = useState({h: 50, l: 50, s:70});
  const [gainNode, setGainNode] = useState(null);
  const [oscillator, setOscillator] = useState(null);
  const [oscillatorStarted, setOscillatorStarted] = useState(false);
  const [pointerIsDown, setPointerIsDown] = useState(false);
  const [timerId, setTimerId] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    console.log('init')
    // add device orientation event listner
    window.addEventListener("deviceorientation", handleOrientation, true);

    // create web audio api context
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // create Oscillator node
    var oscillator = audioCtx.createOscillator();

    // create Gain node
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.1
    oscillator.connect(gainNode)

    oscillator.type = 'square';
    oscillator.frequency.value = 440; // value in hertz
    oscillator.connect(gainNode).connect(audioCtx.destination);
    (() => {
        setGainNode(gainNode)
        setOscillator(oscillator)
    })()
  }, []);

  function handleOrientation(e) {
    e.preventDefault()
    e.stopPropagation()
    if (timerId !== 0 || !pointerIsDown) {
        return
    }

    const tid = setTimeout(() => {
        setTimerId(0)
    }, msec)
    setTimerId(tid)

    console.log(e)
    const color = {h: e.alpha/2.5, s: e.beta/2, l:70}
    setColor(color)

    if (gainNode !== null) {
        gainNode.gain.value = Math.abs(e.alpha)/360*0.15
    }
    if (oscillator !== null) {
        oscillator.frequency.value = 440 + (e.beta); // value in hertz
    }
    console.log(e)
  }

  function pointerMoveEventHandlerWithThrottole(e, msec) {
    let clientX = e.clientX
    let clientY = e.clientY
    console.log(e.targetTouches)
    if (clientX === undefined && e.targetTouches[0] !== undefined) {
        clientX = e.targetTouches[0].clientX
        clientY = e.targetTouches[0].clientY
    }

    const color = {h: clientX/e.target.clientWidth*100*(Math.PI/2.5), s: (50 - (clientY/e.target.clientHeight)*50)+50, l:70}
    setColor(color)
    if (gainNode !== null) {
        gainNode.gain.value = (1 - (clientY/e.target.clientHeight))*0.15
    }
    if (oscillator !== null) {
        oscillator.frequency.value = 240 + (clientX/e.target.clientWidth)*400; // value in hertz
    }
  }

  function pointerDownEventHandler(e) {
    setPointerIsDown(true)
    if (oscillator !== null && !oscillatorStarted) {
        oscillator.start()
        setOscillatorStarted(true)
    }
  }

  function pointerUpEventHndler(e) {
    setPointerIsDown(false)
    if (gainNode !== null) {
        gainNode.gain.value = 0
    }
  }

  return (
    <div
      className={styles.controller}
      style={{backgroundColor: `hsl(${color.h}, ${color.s}%, ${color.l}%)`}}
      onMouseDown={e => pointerDownEventHandler(e)}
      onTouchStart={e => pointerDownEventHandler(e)}
      onMouseUp={e => pointerUpEventHndler(e)}
      onTouchEnd={e => pointerUpEventHndler(e)}
      onMouseMove={e => pointerMoveEventHandlerWithThrottole(e, 16)}
      onTouchMove={e => pointerMoveEventHandlerWithThrottole(e, 32)}> </div>
  )
}