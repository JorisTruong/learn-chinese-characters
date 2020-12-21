import React, { useState, useRef, useEffect } from "react"
import { Typography, Button, Input, Row, Col } from "antd"
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons"


const HanziWriter = require("hanzi-writer")

const { TextArea } = Input
const { Title, Paragraph } = Typography

var hanzi = null
var _textPosition = null
var _strokeNumber = null

const InputText = () => {  
  const divRef = useRef()
  useEffect(() => {
    if (hanzi == null) {
      hanzi = new HanziWriter(divRef.current, {
        width: 200,
        height: 200,
        padding: 5,
        showOutline: true,
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
  const [savedInput, setSavedInput] = useState('')
  const [textPosition, setTextPosition] = useState(null)

  const writerOptions = {
    onCorrectStroke: function(strokeData) {
      _strokeNumber = _strokeNumber + 1
    },
    onComplete: function(summaryData) {
      _strokeNumber = 0
    }
  }

  const updateInput = () => {
    if (inputString !== '') {
      setSavedInput(inputString)
      hanzi.setCharacter(inputString[0])
      setTextPosition(0)
      _textPosition = 0
      _strokeNumber = 0
      hanzi.quiz(writerOptions)
    }
  }

  const goPrevious = () => {
    setTextPosition(textPosition-1)
    _textPosition = _textPosition-1
    _strokeNumber = 0
    hanzi.setCharacter(savedInput[_textPosition])
    hanzi.quiz(writerOptions)
  }

  const goNext = () => {
    setTextPosition(textPosition+1)
    _textPosition = _textPosition+1
    _strokeNumber = 0
    hanzi.setCharacter(savedInput[_textPosition])
    hanzi.quiz(writerOptions)
  }

  return (
    <div className="site-layout-background" style={{ padding: 24, textAlign: "center" }}>
      <Row style={{ paddingBottom: 50 }}>
        <Col lg={{ span: 12, offset: 6 }} md={{ span: 20, offset: 2 }} xs={{ span: 24 }}>
          <Typography>
            <Title level={5}>
              Text input quiz
            </Title>
            <Paragraph style={{ textAlign: "justify" }}>
              The text input quiz allows you to focus on learning the stroke order of Chinese characters. Type your own text and quiz yourself word by word. You can re-quiz yourself on a word, go to the previous word or to the next word of your text.
            </Paragraph>
          </Typography>
        </Col>
      </Row>
      <TextArea placeholder="Type your text" style={{ width: window.innerWidth < window.innerHeight ? "75vw" : "50vw" }} rows={4} value={inputString} onChange={(value) => setInputString(value.target.value)}/>
      <div style={{ padding: 10 }}>
        <Row gutter={16}>
          <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Button type="primary" onClick={updateInput} style={{ width: "100%" }}>Update Text</Button>
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
      </div>
      <div style={{ padding: 10 }}>
        <Row gutter={16} style={{ padding: 15 }}>
          {textPosition > 0 ?
            <Col lg={{ span: 2, offset: 9 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
              <Button type="primary" onClick={goPrevious} style={{ width: "100%" }}><ArrowLeftOutlined/> Previous</Button>
            </Col> :
          null}
          <Col lg={{ span: 2, offset: textPosition <= 0 ? 11 : 0 }} md={{ span: 12 }} xs={{ span: 20 }}>
            <Button type="primary" onClick={() => {_strokeNumber = 0; hanzi.quiz()}} style={{ width: "100%" }}>Quiz</Button>
          </Col>
          {textPosition != null && textPosition < savedInput.length - 1 ?
            <Col lg={{ span: 2 }} md={{ span: 12 }} xs={{ span: 20 }}>
              <Button type="primary" onClick={goNext} style={{ width: "100%" }}>Next <ArrowRightOutlined/></Button>
            </Col> :
          null}
        </Row>
        <Row gutter={16} style={{ padding: 15 }}>
          <Col lg={{ span: 2, offset: 11 }} md={{ span: 12 }} xs={{ span: 20 }}>
            <Button type="primary" onClick={() => hanzi.highlightStroke(_strokeNumber)} style={{ width: "100%" }}>Show Hint</Button>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default InputText
