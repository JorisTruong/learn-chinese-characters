import React, { useState, useRef, useEffect } from "react"
import { Typography, Card, Statistic, Button, Input, Progress, Row, Col } from "antd"

import useInterval from "./hooks/useInterval"

const HanziWriter = require("hanzi-writer")
const jsonQuery = require("json-query")

const hanziData = require("../resources/hanzi.json")
const hanziDataQuery = { "characters": hanziData }

const { TextArea } = Input
const { Title, Paragraph } = Typography
const { Countdown } = Statistic

var hanzi = null
var width = null
var height = null
var _textPosition = 0
var _strokeProgress = 0

const RaceGame = () => {  
  const divRef = useRef()
  useEffect(() => {
    width = window.innerWidth
    height = window.innerHeight
    if (hanzi == null) {
      hanzi = new HanziWriter(divRef.current, {
        width: 200,
        height: 200,
        padding: 5,
        showOutline: true,
        showHintAfterMisses: false,
        onLoadCharDataError: function(reason) {
          console.log("Oh No! Something went wrong :(")
        }
      })
    }
    return function cleanup() {
      hanzi = null
    }
  }, [])

  const [isTimerActive, setIsTimerActive] = useState(false)
  const [prevTime, setPrevTime] = useState(null)
  const [timeInMilliseconds, setTimeInMilliseconds] = useState(0)
  const [inputString, setInputString] = useState("")
  const [filteredInputString, setFilteredInputString] = useState("")
  const [totalStrokes, setTotalStrokes] = useState(0)
  const [strokeProgress, setStrokeProgress] = useState(0)
  const [ready, setReady] = useState(null)

  useInterval(
    () => {
      let prev = prevTime ? prevTime : Date.now()
      let diffTime = Date.now() - prev
      let newMilliTime = timeInMilliseconds + diffTime
      setPrevTime(Date.now())
      setTimeInMilliseconds(newMilliTime)
    },
    isTimerActive ? 10 : null
  );

  const updateInput = () => {
    var totalStrokesCount = filteredInputString.split("").map((char) => {
      var hanziQuery = jsonQuery(["characters[*character=?]", char], {data: hanziDataQuery})
      if (hanziQuery.key.length === 1) {
        return hanziData[hanziQuery.key[0]]["stroke_count"]
      } else {
        return 0
      }
    }).reduce((a, b) => a + b, 0)
    setTotalStrokes(totalStrokesCount)
    if (filteredInputString !== "") {
      hanzi.setCharacter(filteredInputString[0])
      _textPosition = 0
    }
  }

  const startTimer = () => {
    setIsTimerActive(true)
    setPrevTime(null)
  }

  const stopTimer = () => {
    setIsTimerActive(false)
    setPrevTime(null)
  }

  const resetTimer = () => {
    stopTimer()
    setTimeout(() => {
      setTimeInMilliseconds(0)
    }, 11)
  }

  const formatTime = () => {
    const getMilliSeconds = `00${(timeInMilliseconds % 1000)}`.slice(-3)
    const getSeconds = `0${Math.floor((timeInMilliseconds / 1000) % 60)}`.slice(-2)
    const getMinutes = `0${Math.floor(timeInMilliseconds / (1000 * 60))}`.slice(-2)

    return `${getMinutes}:${getSeconds}:${getMilliSeconds}`
  }

  const setQuiz = () => {
    hanzi.quiz({
      onCorrectStroke: function(strokeData) {
        _strokeProgress = _strokeProgress + 1
        setStrokeProgress(_strokeProgress)
      },
      onComplete: function(summaryData) {
        _textPosition = _textPosition + 1
        if (_textPosition < filteredInputString.length) {
          setTimeout(() => {
            hanzi.setCharacter(filteredInputString[_textPosition])
            setQuiz()
          }, 100)
        } else {
          stopTimer()
        }
      }
    })
  }

  return (
    <div className="site-layout-background" style={{ padding: 24, textAlign: "center" }}>
      <Row style={{ paddingBottom: 25 }}>
        <Col lg={{ span: 12, offset: 6 }} md={{ span: 20, offset: 2 }} xs={{ span: 24 }}>
          <Typography>
            <Title level={5}>
              Stroke Racer
            </Title>
            <Paragraph style={{ textAlign: "justify" }}>
              In Stroke Racer, you will test your <i>handwriting</i> (digital) speed. You can generate a text and try to finish writing it down as fast as you can. You can also input your own text. Let"s see who is the fastest Chinese character writer!
            </Paragraph>
          </Typography>
        </Col>
      </Row>
      <TextArea placeholder="Text to race" style={{ width: width < height ? "75vw" : "50vw" }} rows={4} value={inputString} onChange={(value) => {setInputString(value.target.value); setFilteredInputString(value.target.value.split("").filter(char => /\p{Script=Han}/u.test(char)).join(""))}}/>
      <div style={{ padding: 10 }}>
        <Row gutter={16}>
          <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Button type="primary" onClick={() => {_strokeProgress = 0; setStrokeProgress(0); updateInput(); resetTimer()}} style={{ width: "100%" }}>Update Text</Button>
          </Col>
        </Row>
      </div>
      <div style={{ padding: 25}} >
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" ref={divRef}>
            <line x1="0" y1="0" x2="200" y2="200" stroke="#DDD" />
            <line x1="200" y1="0" x2="0" y2="200" stroke="#DDD" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="#DDD" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="#DDD" />
            <line x1="0" y1="0" x2="200" y2="0" stroke="#555" />
            <line x1="0" y1="0" x2="0" y2="200" stroke="#555" />
            <line x1="200" y1="200" x2="0" y2="200" stroke="#555" />
            <line x1="200" y1="200" x2="200" y2="0" stroke="#555" />
        </svg>
        {ready ? <Countdown format="s" value={ready} valueStyle={{ zIndex: 2, top: "50vh", left: "50vw", color: "#cf1322", fontWeight: "bold", fontSize: 32 }} onFinish={() => {setReady(false); setQuiz(); startTimer()}}/> : null}
      </div>
      <div style={{ padding: 10 }}>
        <Row gutter={16}>
          <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Progress percent={100 * strokeProgress / totalStrokes} showInfo={false} />
          </Col>
        </Row>
      </div>
      <div style={{ padding: 10 }}>
        <Row gutter={16}>
          <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }} style={{ paddingBottom: 15 }}>
            <div className="ant-statistic">
              <div className="ant-statistic-title">
                Timer
              </div>
              <div className="ant-statistic-content">
                <span className="ant-statistic-content-value">{formatTime()}</span>
              </div>
            </div>
          </Col>
          <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Button type="primary" disabled={isTimerActive} onClick={() => { hanzi.setCharacter(inputString[0]); _textPosition = 0; _strokeProgress = 0; setStrokeProgress(0); setReady(Date.now() + 1000 * 4); resetTimer() }} style={{ width: "100%" }}>Go</Button>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }} style={{ paddingTop: 25 }}>
            <Card>
              <Statistic
                title="Strokes per minute"
                value={timeInMilliseconds === 0 ? 0 : 60 * 1000 * strokeProgress / timeInMilliseconds}
                precision={0}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default RaceGame
