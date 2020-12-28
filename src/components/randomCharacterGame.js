import React, { useState, useRef, useEffect } from "react"
import { Typography, Statistic, Card, Button, Input, AutoComplete, Modal, Tag, Row, Col } from "antd"
import { connect } from "react-redux"
import { AutoSizer, Collection } from "react-virtualized"

import { updateCorrectStrokes, updateMistakeStrokes, updateCorrectChar, updatePrecision } from "../redux/actions.js"


const HanziWriter = require("hanzi-writer")
const jsonQuery = require('json-query')

const hanziData = require("../resources/hanzi.json")
const hanziDataQuery = { "characters": hanziData }
const hanziDataQueryPinyinSort = { "characters": hanziData.sort(function(a, b) {
  var pinyinA = a.details.pinyin[0]
  var pinyinB = b.details.pinyin[0]
  if (pinyinA == null || pinyinB == null) {
    return 0
  } else {
    var normalizedPinyinA = pinyinA.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    var normalizedPinyinB = pinyinB.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return (normalizedPinyinA < normalizedPinyinB) ? -1 : (normalizedPinyinA > normalizedPinyinB) ? 1 : 0
  }
}) }

const { Search } = Input
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

  const [inputString, setInputString] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [searchValue, setSearchValue] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deadline, setDeadline] = useState(Date.now())
  const [finished, setFinished] = useState(true)
  const [ready, setReady] = useState(null)

  const handleSearch = (value) => {
    setSuggestions(value ? searchResult(value) : [])
  }

  const helpers = {
    pinyinSearch: function(input, query) {
      var normalizedPinyin = input.pinyin.map(element => element.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      if (normalizedPinyin.find(element => element.startsWith(query.toLowerCase()))) {
        return input
      } else {
        return null
      }
    }
  }

  const searchResult = (query) => {
    var hanziQuery = jsonQuery(["characters[*character=?]", query], {data: hanziDataQuery})
    var pinyinQuery = jsonQuery(["characters[*details][*:pinyinSearch(?)]", query], {data: hanziDataQueryPinyinSort, locals: helpers})
    var result = hanziQuery.key.concat(pinyinQuery.key)
    if (hanziQuery.key.length === 1) {
      var definition = hanziData[hanziQuery.key[0]].details.definition
      var writingSystemQuery = jsonQuery(["characters[*details][*definition=?]", definition], {data: hanziDataQuery})
      result = Array.from(new Set(result.concat(writingSystemQuery.key)))
    }
    if (result == null) {
      return null
    } else {
      return result
        .map((item) => {
          const category = `${hanziData[item].character}`;
          return {
            value: category,
            label: (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  {hanziData[item].character}
                </span>
                <span>
                  {hanziData[item].details.pinyin}
                </span>
              </div>
            )
          }
        })
      }
  }

  const cellRenderer = ({ index, key, style }) => {
    style.fontSize = 20
    style.borderRadius = "10px"
    style.display = "flex"
    style.justifyContent = "center"
    style.alignItems = "center"
    var c = hanziData[index].character
    return (
      <Button key={key} style={style} type={inputString.includes(c) ? "primary" : "ghost"} onClick={() => {
        if (inputString.includes(c)) {
          setInputString(inputString.replace(c, ''))
        } else {
          setInputString(inputString.concat(c))
        }
      }}>
        {hanziData[index].character}
      </Button>
    );
  }
  
  const cellSizeAndPositionGetter = ({ index }) => {
    if (window.innerWidth > window.innerHeight) {
      return {
        height: window.innerHeight * 0.08,
        width: window.innerWidth * 0.08,
        x: (window.innerWidth * 0.1 - 6) * (index % 8),
        y: window.innerHeight * 0.1 * Math.floor(index / 8)
      }
    } else {
      return {
        height: window.innerHeight * 0.1,
        width: window.innerWidth * 0.1,
        x: (window.innerWidth * 0.13 - 6) * (index % 6),
        y: window.innerHeight * 0.13 * Math.floor(index / 6)
      }
    }
  }
  
  const getRandomInt = (min, max) => {
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
      <Row style={{ paddingBottom: 25 }}>
        <Col lg={{ span: 12, offset: 6 }} md={{ span: 20, offset: 2 }} xs={{ span: 24 }}>
          <Typography>
            <Title level={5}>
              Random Character Game
            </Title>
            <Paragraph strong>
              How many characters will you correctly write in 60 seconds? The random character game tests your limits!
            </Paragraph>
            <Paragraph style={{ textAlign: "justify" }}>
              During 60 seconds, random characters will appear on the writing box. Write down the correct strokes by order to earn points and test your precision. You can also search and select your own characters, and the game will pick random characters based on your selection. If there is no selected character, the game will choose between all available characters. Challenge yourself, measure your quickness and challenge your friends!
            </Paragraph>
          </Typography>
        </Col>
      </Row>
      <AutoComplete
        dropdownMatchSelectWidth={window.innerWidth < window.innerHeight ? "75vw" : "20vw"}
        style={{
            width: window.innerWidth < window.innerHeight ? "75vw" : "20vw",
        }}
        options={suggestions}
        onSearch={handleSearch}
        value={searchValue}
        onChange={(value) => setSearchValue(value)}
        onSelect={(value) => {setSearchValue(""); setInputString(inputString.concat(value))}}
      >
        <Search placeholder="Search a Chinese Character" enterButton={"OK"} style={{ width: window.innerWidth < window.innerHeight ? "75vw" : "20vw" }} />
      </AutoComplete>
      <Row gutter={16} style={{ padding: 15 }}>
        <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>Browse all characters</Button>
        </Col>
      </Row>
      <Modal title="All Chinese characters" visible={isModalVisible} footer={null} onCancel={() => setIsModalVisible(false)} width={window.innerWidth * 0.8} bodyStyle={{ height: window.innerHeight * 0.5, overflow: "auto" }}>
        <AutoSizer>
          {({ height, width }) => (
            <Collection
            cellCount={hanziData.length}
            cellRenderer={cellRenderer}
            cellSizeAndPositionGetter={cellSizeAndPositionGetter}
            height={height}
            width={width}
            />
          )}
        </AutoSizer>
      </Modal>
        {
          inputString.split("").map((char, i) => {
            var rowSize = window.innerWidth < 576 ? 4 : window.innerWidth <= 768 ? 6 : 16
            return i%rowSize === 0 ? inputString.split("").slice(i, i+rowSize) : null;
          }).filter(function(e) { return e }).map((row) => {
            return(
              <Row gutter={[16, 8]} key={row}>
                <Col lg={{ span: 16, offset: 4 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
                  {
                    row.map((char) => {
                      return(<Tag key={char} closable onClose={() => setInputString(inputString.replace(char, ''))} style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", fontSize: 20, height: "30px", width: "44px" }}>{char}</Tag>)
                    })
                  }
                </Col>
              </Row>
            )
          })
        }
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
            {
              finished ?
              <div className="ant-statistic">
                <div className="ant-statistic-title">
                  Timer
                </div>
                <div className="ant-statistic-content">
                  <span className="ant-statistic-content-value">00:60:000</span>
                </div>
              </div> :
              <Countdown title="Timer" value={deadline} format="mm:ss:SSS" onFinish={() => {hanzi.cancelQuiz(); setFinished(true)}} />
            }
            
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
