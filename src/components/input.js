import React, { useState, useRef, useEffect } from "react"
import { Typography, Button, Input, Select, Row, Col } from "antd"
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons"


const HanziWriter = require("hanzi-writer")

const textsData = require("../resources/texts.json")

const { TextArea } = Input
const { Title, Paragraph } = Typography
const { Option } = Select

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

  const [inputString, setInputString] = useState("")
  const [filteredInputString, setFilteredInputString] = useState("")
  const [savedInput, setSavedInput] = useState("")
  const [textPosition, setTextPosition] = useState(null)
  const [hskLevel, setHSKLevel] = useState(1)
  const [writingSystem, setWritingSystem] = useState("traditional")

  const writerOptions = {
    onCorrectStroke: function(strokeData) {
      _strokeNumber = _strokeNumber + 1
    },
    onComplete: function(summaryData) {
      _strokeNumber = 0
    }
  }

  const updateInput = () => {
    if (filteredInputString !== "") {
      setSavedInput(filteredInputString)
      hanzi.setCharacter(filteredInputString[0])
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
              Text input quiz
            </Title>
            <Paragraph style={{ textAlign: "justify" }}>
              The text input quiz allows you to focus on learning the stroke order of Chinese characters. Type your own text and quiz yourself word by word. You can re-quiz yourself on a word, go to the previous word or to the next word of your text.
            </Paragraph>
          </Typography>
        </Col>
      </Row>
      <Row>
        <Col lg={{ span: 12, offset: 6 }} md={{ span: 18, offset: 3 }} xs={{ span: 24 }}>
          <TextArea placeholder="Type your text" style={{ width: "100%" }} rows={4} value={inputString} onChange={(value) => {setInputString(value.target.value); setFilteredInputString(value.target.value.split("").filter(char => /\p{Script=Han}/u.test(char)).join(""))}}/>
        </Col>
      </Row>
      <div style={{ padding: 10, paddingTop: 25, paddingBottom: 45 }}>
        <Row gutter={16}>
          <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Button type="primary" onClick={updateInput} style={{ width: "100%" }}>Update Text</Button>
          </Col>
        </Row>
      </div>
      <div style={{ padding: 10 }}>
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
      </div>
      <div style={{ padding: 10 }}>
        <Row gutter={[16, 16]} style={{ padding: 15 }}>
          {textPosition > 0 ?
            <Col lg={{ span: 2, offset: 9 }} md={{ span: 12, offset: 6 }} xs={{ span: 24 }}>
              <Button type="primary" onClick={goPrevious} style={{ width: "100%" }}><ArrowLeftOutlined/> Previous</Button>
            </Col> :
          null}
          <Col lg={{ span: 2, offset: textPosition <= 0 ? 11 : 0 }} md={{ span: 12, offset: 6 }} xs={{ span: 24 }}>
            <Button type="primary" onClick={() => {_strokeNumber = 0; hanzi.quiz()}} style={{ width: "100%" }}>Quiz</Button>
          </Col>
          {textPosition != null && textPosition < savedInput.length - 1 ?
            <Col lg={{ span: 2, offset: 0 }} md={{ span: 12, offset: 6 }} xs={{ span: 24 }}>
              <Button type="primary" onClick={goNext} style={{ width: "100%" }}>Next <ArrowRightOutlined/></Button>
            </Col> :
          null}
        </Row>
        <Row gutter={16} style={{ padding: 15 }}>
          <Col lg={{ span: 2, offset: 11 }} md={{ span: 12, offset: 6 }} xs={{ span: 24 }}>
            <Button type="primary" onClick={() => hanzi.highlightStroke(_strokeNumber)} style={{ width: "100%" }}>Show Hint</Button>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default InputText
