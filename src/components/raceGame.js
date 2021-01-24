import React, { useState, useRef, useEffect } from "react"
import { Typography, Card, Statistic, Button, Input, Progress, Select, Row, Col } from "antd"

import useInterval from "./hooks/useInterval"

const HanziWriter = require("hanzi-writer")
const jsonQuery = require("json-query")

const hanziData = require("../resources/hanzi.json")
const hanziDataQuery = { "characters": hanziData }
const textsData = require("../resources/texts.json")

const { TextArea } = Input
const { Title, Paragraph } = Typography
const { Countdown } = Statistic
const { Option } = Select

var hanzi = null
var _textPosition = 0
var _strokeProgress = 0

const RaceGame = () => {  
  const divRef = useRef()
  useEffect(() => {
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
  const [hskLevel, setHSKLevel] = useState(1)
  const [writingSystem, setWritingSystem] = useState("traditional")

  useInterval(
    () => {
      let prev = prevTime ? prevTime : Date.now()
      let diffTime = Date.now() - prev
      let newMilliTime = timeInMilliseconds + diffTime
      setPrevTime(Date.now())
      setTimeInMilliseconds(newMilliTime)
    },
    isTimerActive ? 21 : null
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

  const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  const pickRandomText = () => {
    var texts = textsData[hskLevel-1]["texts"]
    var pickedText = texts[getRandomInt(0, texts.length)]
    setInputString(pickedText[writingSystem])
    setFilteredInputString(pickedText[writingSystem].split("").filter(char => /\p{Script=Han}/u.test(char)).join(""))
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
              In Stroke Racer, you will test your <i>handwriting</i> (digital) speed. You can generate a text and try to finish writing it down as fast as you can. You can also input your own text. Let's see who is the fastest Chinese character writer!
            </Paragraph>
          </Typography>
        </Col>
      </Row>
      <Row>
        <Col lg={{ span: 12, offset: 6 }} md={{ span: 18, offset: 3 }} xs={{ span: 24 }}>
          <TextArea placeholder="Text to race" style={{ width: "100%" }} rows={4} value={inputString} onChange={(value) => {setInputString(value.target.value); setFilteredInputString(value.target.value.split("").filter(char => /\p{Script=Han}/u.test(char)).join(""))}}/>
        </Col>
      </Row>
      <div style={{ padding: 10, paddingTop: 45 }}>
        <Row gutter={[16, 16]}>
          <Col lg={{ span: 4, offset: 6 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Button type="primary" onClick={pickRandomText} style={{ width: "100%" }}>Pick a random text</Button>
          </Col>
          <Col lg={{ span: 4, offset: 0 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Select value={hskLevel} onChange={(value) => setHSKLevel(value)} style={{ width: "100%" }}>
              <Option value={1}>HSK Level 1</Option>
              <Option value={2}>HSK Level 2</Option>
              <Option value={3}>HSK Level 3</Option>
              <Option value={4}>HSK Level 4</Option>
              <Option value={5}>HSK Level 5</Option>
              <Option value={6}>HSK Level 6</Option>
            </Select>
          </Col>
          <Col lg={{ span: 4, offset: 0 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Select value={writingSystem} onChange={(value) => setWritingSystem(value)} style={{ width: "100%" }}>
              <Option value={"traditional"}>Traditional</Option>
              <Option value={"simplified"}>Simplified</Option>
            </Select>
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
            <Progress percent={totalStrokes === 0 ? 0 : parseFloat(100 * strokeProgress / totalStrokes).toFixed(2)} showInfo={true} trailColor={"#DDD"} />
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
            <Button type="primary" disabled={isTimerActive} onClick={() => { hanzi.setCharacter(filteredInputString[0]); _textPosition = 0; _strokeProgress = 0; setStrokeProgress(0); setReady(Date.now() + 1000 * 4); resetTimer() }} style={{ width: "100%" }}>Go</Button>
          </Col>
        </Row>
        <div style={{ padding: 10, paddingTop: 25, paddingBottom: 45 }}>
          <Row gutter={16}>
            <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
              <Button type="primary" onClick={() => {_strokeProgress = 0; setStrokeProgress(0); updateInput(); resetTimer()}} style={{ width: "100%" }}>Reset</Button>
            </Col>
          </Row>
        </div>
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
