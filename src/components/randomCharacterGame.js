import React, { useState, useRef, useEffect } from "react"
import { Typography, Statistic, Card, Button, Input, Row, Col } from "antd"
import { connect } from "react-redux"

import { updateCorrectStrokes, updateMistakeStrokes, updateCorrectChar, updatePrecision } from "../redux/actions.js"


const HanziWriter = require("hanzi-writer")

const hanziData = require("../resources/hanzi.json")

const { TextArea } = Input
const { Countdown } = Statistic
const { Title, Paragraph } = Typography

var hanzi = null
var _totalCorrectStrokes = 0
var _totalMistakesStrokes = 0
var _totalCorrectChar = 0
var _precision = 0

const RandomGame = (props) => {
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
          console.log('Oh No! Something went wrong :(')
        }
      })
    }
    return function cleanup() {
      hanzi = null
    }
  }, [])

  const [inputString, setInputString] = useState('')
  const [deadline, setDeadline] = useState(Date.now())
  const [finished, setFinished] = useState(true)
  const [ready, setReady] = useState(null)

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  const setQuiz = () => {
    if (inputString.length === 0) {
      hanzi.setCharacter(hanziData[getRandomInt(0, 9574)].character)
    } else {
      hanzi.setCharacter(inputString[getRandomInt(0, inputString.length)])
    }
    hanzi.quiz({
      onMistake: function(strokeData) {
        _totalMistakesStrokes = _totalMistakesStrokes + 1
        props.updateMistakeStrokes(_totalMistakesStrokes)
        _precision = 100 * _totalCorrectStrokes / (_totalCorrectStrokes + _totalMistakesStrokes)
        props.updatePrecision(_precision)
      },
      onCorrectStroke: function(strokeData) {
        _totalCorrectStrokes = _totalCorrectStrokes + 1
        props.updateCorrectStrokes(_totalCorrectStrokes)
        _precision = 100 * _totalCorrectStrokes / (_totalCorrectStrokes + _totalMistakesStrokes)
        props.updatePrecision(_precision)
      },
      onComplete: function(summaryData) {
        setTimeout(() => {
          _totalCorrectChar = _totalCorrectChar + 1
          props.updateCorrectChar(_totalCorrectChar)
          setQuiz()
        }, 100)
      }
    })
  }

  return (
    <div className="site-layout-background" style={{ padding: 24, textAlign: "center" }}>
      <Row style={{ paddingBottom: 50 }}>
        <Col lg={{ span: 12, offset: 6 }} md={{ span: 20, offset: 2 }} xs={{ span: 24 }}>
          <Typography>
            <Title level={5}>
              Random Character Game
            </Title>
            <Paragraph strong>
              How many characters will you correctly write in 60 seconds? The random character game tests your limits!
            </Paragraph>
            <Paragraph style={{ textAlign: "justify" }}>
              During 60 seconds, random characters will appear on the writing box. Write down the correct strokes by order to earn points and test your precision. You can also input your own characters, and the game will select random characters based on your input. If there is no input, the game will choose between all available characters. Challenge yourself, measure your quickness and challenge your friends!
            </Paragraph>
          </Typography>
        </Col>
      </Row>
      <TextArea placeholder="List of characters with no separator" style={{ width: window.innerWidth < window.innerHeight ? "75vw" : "50vw" }} rows={4} value={inputString} onChange={(value) => setInputString(value.target.value)}/>
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
        {ready ? <Countdown format="s" value={ready} valueStyle={{ zIndex: 2, top: "50vh", left: "50vw", color: "#cf1322", fontWeight: "bold", fontSize: 32 }} onFinish={() => {setReady(false); setDeadline(Date.now() + 1000 * 60); setFinished(false); setQuiz();}}/> : null}
      </div>
      <div style={{ padding: 10 }}>
        <Row gutter={16}>
          <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }} style={{ paddingBottom: 15 }}>
            <Countdown title="60-second timer" value={deadline} format="mm:ss:SSS" onFinish={() => {hanzi.cancelQuiz(); setFinished(true)}}/>
          </Col>
          <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Button type="primary" disabled={!finished} onClick={() => {props.updateCorrectStrokes(0); props.updateMistakeStrokes(0); setReady(Date.now() + 1000 * 4)}} style={{ width: "100%" }}>Ready</Button>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col lg={{ span: 4, offset: 8 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }} style={{ paddingTop: 25 }}>
            <Card>
              <Statistic
                title="Correct strokes"
                value={props.correctStrokes}
                precision={0}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col lg={{ span: 4, offset: 0 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }} style={{ paddingTop: 25 }}>
            <Card>
              <Statistic
                title="Mistake strokes"
                value={props.mistakeStrokes}
                precision={0}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col lg={{ span: 4, offset: 8 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }} style={{ paddingTop: 25 }}>
            <Card>
              <Statistic
                title="Correct characters"
                value={props.correctChar}
                precision={0}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col lg={{ span: 4, offset: 0 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }} style={{ paddingTop: 25 }}>
            <Card>
              <Statistic
                title="Precision"
                value={_precision}
                precision={2}
                suffix={"%"}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

function mapStateToProps(state) {
  const correctStrokes = state.updateRandomCharacterGame.correctStrokes
  const mistakeStrokes = state.updateRandomCharacterGame.mistakeStrokes
  const correctChar = state.updateRandomCharacterGame.correctChar
  const precision = state.updateRandomCharacterGame.precision
  return { correctStrokes, mistakeStrokes, correctChar, precision }
}

export default connect(mapStateToProps, { updateCorrectStrokes, updateMistakeStrokes, updateCorrectChar, updatePrecision })(RandomGame)
