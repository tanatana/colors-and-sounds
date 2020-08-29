import Head from 'next/head'
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
    // create web audio api context
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    console.log(audioCtx)
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

    // iOS 11
    document.documentElement.addEventListener('touchstart', (e) => {
      console.log('document touchstat stopPropagation')
      if (e.touches && e.touches.length > 1) {
        e.preventDefault()
        e.stopPropagation()
      }
    }, {passive: false})
  }, []);

  function pointerMoveEventHandlerWithThrottole(e, msec) {
    e.preventDefault()
    e.stopPropagation()
    if (timerId !== 0 || !pointerIsDown) {
        return
    }

    const tid = setTimeout(() => {
        setTimerId(0)
    }, msec)
    setTimerId(tid)
    let clientX = e.clientX
    let clientY = e.clientY

    if (clientX === undefined && e.targetTouches[0] !== undefined) {
        clientX = e.targetTouches[0].clientX
        clientY = e.targetTouches[0].clientY
    }
    playOscillator(clientX, clientY, e.target.clientWidth, e.target.clientHeight)
  }

  function playOscillator(clientX, clientY, clientWidth, clientHeight) {
    const color = {h: clientX/clientWidth*150+15, s: (50 - (clientY/clientHeight)*50)+50, l:55}
    setColor(color)
    if (gainNode !== null) {
        gainNode.gain.value = (1 - (clientY/clientHeight))*0.15
    }
    if (oscillator !== null) {
        oscillator.frequency.value = 240 + (clientX/clientWidth)*400; // value in hertz
    }
  }

  function pointerDownEventHandler(e) {
    console.log('down')
    e.preventDefault()
    e.stopPropagation()

    setPointerIsDown(true)
    if (oscillator !== null) {
        if (!oscillatorStarted) {
            oscillator.start()
            setOscillatorStarted(true)
        }

        let clientX = e.clientX
        let clientY = e.clientY
            if (clientX === undefined && e.targetTouches[0] !== undefined) {
            clientX = e.targetTouches[0].clientX
            clientY = e.targetTouches[0].clientY
        }
        console.log('play')
        playOscillator(clientX, clientY, e.target.clientWidth, e.target.clientHeight)
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
      onTouchMove={e => pointerMoveEventHandlerWithThrottole(e, 32)}>
        <Head>
          <title>Swipe to play</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"></meta>
          <meta name="apple-mobile-web-app-capable" content="yes"></meta>
          <meta name="apple-mobile-web-app-status-bar-style" content="black"></meta>
        </Head>
        <style jsx global>{`
          body {
            background-color: hsl(${color.h}, ${color.s}%, ${color.l}%);
          }
        `}</style>
      </div>
   )
}