import React, { useState, useRef, useEffect } from "react"
import { Statistic, Card, Button, Input, Row, Col } from "antd"


const HanziWriter = require("hanzi-writer")

const hanziData = require("../resources/hanzi.json")

const { TextArea } = Input;
const { Countdown } = Statistic;

var hanzi = null
var _correctAnswers = 0
var _totalMistakes = 0

const Race = () => {
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
  })

  const [inputString, setInputString] = useState('')
  const [deadline, setDeadline] = useState(Date.now())
  const [finished, setFinished] = useState(true)

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
      onComplete: function(summaryData) {
        setTimeout(() => {
          _correctAnswers = _correctAnswers + 1
          _totalMistakes = _totalMistakes + summaryData.totalMistakes
          setQuiz()
        }, 100)
      }
    })
  }

  return (
    <div className="site-layout-background" style={{ padding: 24, textAlign: "center" }}>
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
      </div>
      <div style={{ padding: 10 }}>
        <Row gutter={16}>
          <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }} style={{ paddingBottom: 15 }}>
            <Countdown title="60-second timer" value={deadline} format="mm:ss:SSS" onFinish={() => {hanzi.cancelQuiz(); setFinished(true);}}/>
          </Col>
          <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Button type="primary" disabled={!finished} onClick={() => {_correctAnswers = 0; _totalMistakes = 0; setDeadline(Date.now() + 1000 * 60); setFinished(false); setQuiz();}} style={{ width: "100%" }}>Ready</Button>
          </Col>
        </Row>
        {finished ? 
          <Row gutter={16}>
            <Col lg={{ span: 4, offset: 8 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }} style={{ paddingTop: 25 }}>
              <Card>
                <Statistic
                  title="Correct answers"
                  value={_correctAnswers}
                  precision={0}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col lg={{ span: 4, offset: 0 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }} style={{ paddingTop: 25 }}>
              <Card>
                <Statistic
                  title="Mistakes"
                  value={_totalMistakes}
                  precision={0}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row> :
        null}
      </div>
    </div>
  )
}

export default Race
