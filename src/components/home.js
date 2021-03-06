import React, { useState, useRef, useEffect } from "react"
import { Typography, Button, Input, Slider, InputNumber, Modal, AutoComplete, Collapse, Tooltip, Row, Col } from "antd"
import { FlagOutlined, SoundFilled } from "@ant-design/icons"
import { AutoSizer, Collection } from "react-virtualized"

const HanziWriter = require("hanzi-writer")
const jsonQuery = require("json-query")

const hanziData = require("../resources/hanzi.json")
const hanziDataQuery = { "characters": hanziData }
const hanziDataQueryPinyinSort = { "characters": hanziData.sort(function(a, b) {
  var pinyinA = a.details.pinyin.value[0]
  var pinyinB = b.details.pinyin.value[0]
  if (pinyinA == null || pinyinB == null) {
    return 0
  } else {
    var normalizedPinyinA = pinyinA.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    var normalizedPinyinB = pinyinB.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return (normalizedPinyinA < normalizedPinyinB) ? -1 : (normalizedPinyinA > normalizedPinyinB) ? 1 : 0
  }
}) }

const { Search } = Input
const { Panel } = Collapse
const { Paragraph, Text } = Typography

var hanzi = null
var width = null
var height = null

const Home = () => {
  useEffect(() => {
    width = window.innerWidth
    height = window.innerHeight
  })

  const divRef = useRef()
  useEffect(() => {
    if (hanzi == null) {
      hanzi = HanziWriter.create(divRef.current, "學", {
        width: 200,
        height: 200,
        padding: 5,
        showOutline: true,
        delayBetweenStrokes: 1000,
        strokeAnimationSpeed: 1
      })
    }
    return function cleanup() {
      hanzi = null
    }
  }, [])

  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [currentHanzi, setCurrentHanzi] = useState({"character": "學", "stroke_count": 16, "details": {"definition": {"value": "learning, knowledge, science; to study, to go to school; -ology", "source": "Make me a Hanzi"}, "pinyin": {"value": ["xu\u00e9"], "source": "Make me a Hanzi", "audio": "http://packs.shtooka.net/cmn-caen-tan/ogg/cmn-e0256f02.ogg", "audio_source": "Shtooka", "audio_source_url": "http://shtooka.net"}, "jyutping": {"value": "hok6", "source": "PyCantonese"}}})
  const [isReportModalVisible, setIsReportModalVisible] = useState(false)
  const [reportDetails, setReportDetails] = useState({"character": "", "detail": ""})

  const setSpeedLevel = (value) => {
    setAnimationSpeed(value)
    if (value === 1) {
      hanzi._options.delayBetweenStrokes = 1000
      hanzi._options.strokeAnimationSpeed = 1
    }
    if (value === 2) {
      hanzi._options.delayBetweenStrokes = 500
      hanzi._options.strokeAnimationSpeed = 2
    }
    if (value === 3) {
      hanzi._options.delayBetweenStrokes = 250
      hanzi._options.strokeAnimationSpeed = 3
    }
    if (value === 4) {
      hanzi._options.delayBetweenStrokes = 100
      hanzi._options.strokeAnimationSpeed = 4
    }
    if (value === 5) {
      hanzi._options.delayBetweenStrokes = 1
      hanzi._options.strokeAnimationSpeed = 5
    }
  }

  const handleSearch = (value) => {
    setSuggestions(value ? searchResult(value) : [])
  }

  const helpers = {
    pinyinSearch: function(input, query) {
      var normalizedPinyin = input.value.map(element => element.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      if (normalizedPinyin.find(element => element.startsWith(query.toLowerCase()))) {
        return input
      } else {
        return null
      }
    }
  }

  const searchResult = (query) => {
    var hanziQuery = jsonQuery(["characters[*character=?]", query], {data: hanziDataQuery})
    var pinyinQuery = jsonQuery(["characters[*details][*pinyin][*:pinyinSearch(?)]", query], {data: hanziDataQueryPinyinSort, locals: helpers})
    var result = hanziQuery.key.concat(pinyinQuery.key)
    if (hanziQuery.key.length === 1) {
      var definition = hanziData[hanziQuery.key[0]].details.definition.value
      var writingSystemQuery = jsonQuery(["characters[*details][*definition][*value=?]", definition], {data: hanziDataQuery})
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
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  {hanziData[item].character}
                </span>
                <span>
                  {hanziData[item].details.pinyin.value}
                </span>
              </div>
            )
          }
        })
      }
  }

  const setHanzi = (value, obj) => {
    if (obj != null) {
      hanzi.setCharacter(value)
      setCurrentHanzi(obj)
    } else {
      if (value !== "") {
        var hanziQuery = jsonQuery(["characters[*character=?]", value], {data: hanziDataQuery})
        if (hanziQuery.key.length === 1) {
          var foundHanzi = hanziData[hanziQuery.key[0]]
          hanzi.setCharacter(foundHanzi.character)
          setCurrentHanzi(foundHanzi)
        }
      }
    }
  }

  const cellRenderer = ({ index, key, style }) => {
    style.fontSize = 20
    style.borderRadius = "10px"
    style.display = "flex"
    style.justifyContent = "center"
    style.alignItems = "center"
    return (
      <Button key={key} style={style} onClick={() => {setIsModalVisible(false); setHanzi(hanziData[index].character, hanziData[index])}}>
        {hanziData[index].character}
      </Button>
    );
  }
  
  const cellSizeAndPositionGetter = ({ index }) => {
    if (width > height) {
      return {
        height: height * 0.08,
        width: width * 0.08,
        x: (width * 0.1 - 6) * (index % 8),
        y: height * 0.1 * Math.floor(index / 8)
      }
    } else {
      return {
        height: height * 0.1,
        width: width * 0.1,
        x: (width * 0.13 - 6) * (index % 6),
        y: height * 0.13 * Math.floor(index / 6)
      }
    }
  }

  const report = (currentHanzi, detail) => (
    <Tooltip title="Make a suggestion">
      <Button type="ghost" shape="circle" icon={<FlagOutlined />} onClick={event => {
        event.stopPropagation()
        setIsReportModalVisible(true)
        setReportDetails({"character": currentHanzi.character, "detail": detail[0].toUpperCase() + detail.slice(1)})
      }} />
    </Tooltip>
  );

  return (
    <div className="site-layout-background" style={{ padding: 24, textAlign: "center" }}>
      <Row style={{ paddingBottom: 25 }}>
        <Col lg={{ span: 12, offset: 6 }} md={{ span: 20, offset: 2 }} xs={{ span: 24 }}>
          <Typography>
            <Paragraph>
              Welcome to <Text strong>Learn Chinese Characters</Text>!
            </Paragraph>
            <Paragraph style={{ textAlign: "justify" }}>
              The goal of this website is to learn about how to write Chinese characters based on stroke order. You can choose traditional or simplified characters, get information on their definition, their pinyin pronunciation, and more! This website is meant to be collaborative and not Mandarin only. Feel free to submit pronunciations on your own Chinese dialect, so that people can learn more about your dialect!
            </Paragraph>
            <Paragraph style={{ textAlign: "justify" }}>
              Search a Chinese character by typing it directly, or using pinyin. You can also browse all available Chinese characters in our data. See how to write them and you can even quiz yourself.
            </Paragraph>
          </Typography>
        </Col>
      </Row>
      <Row gutter={16} style={{ padding: 15 }}>
        <Col lg={{ span: 8, offset: 8 }} md={{ span: 12, offset: 6 }} xs={{ span: 24 }}>
          <AutoComplete
            dropdownMatchSelectWidth={"100%"}
            style={{ width: "100%" }}
            options={suggestions}
            onSearch={handleSearch}
            onSelect={(value) => setHanzi(value)}
          >
            <Search placeholder="Search a Chinese Character" enterButton={"OK"} style={{ width: "100%" }} onSearch={(value) => setHanzi(value, null)} />
          </AutoComplete>
        </Col>
      </Row>
      <Row gutter={16} style={{ padding: 15 }}>
        <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>Browse all characters</Button>
        </Col>
      </Row>
      <Modal title="All Chinese characters" visible={isModalVisible} footer={null} onCancel={() => setIsModalVisible(false)} width={width * 0.8} bodyStyle={{ height: height * 0.5, overflow: "auto" }}>
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
      <div style={{ padding: 25}}>
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
      <div style={{ padding: 30 }}>
        <Row align="middle">
          <Col lg={{ span: 6, offset: 9 }} md={{ span: 12, offset: 6 }} xs={{ span: 24 }}>
            <Collapse
              defaultActiveKey={[]}
            >
              {
                Object.keys(currentHanzi.details).map((detail) => {
                  return(
                    <Panel header={detail[0].toUpperCase() + detail.slice(1)} key={detail} extra={report(currentHanzi, detail)}>
                      <Row style={{ display: "flex", justifyContent: "start", alignItems: "center", textAlign: "start" }}>
                        <Col>
                          {currentHanzi.details[detail]["value"]}
                        </Col>
                        {currentHanzi.details[detail].hasOwnProperty("audio") && currentHanzi.details[detail]["audio"] !== "" ?
                          <Col offset={2} span={18}>
                            <Row>
                              <Col>
                                <SoundFilled onClick={() => new Audio(currentHanzi.details[detail]["audio"]).play()} style={{ color: "#1890ff" }} />
                              </Col>
                              <Col offset={1}>
                                (source: <a href={currentHanzi.details[detail]["audio_source_url"]} target="_blank" rel="noreferrer">{currentHanzi.details[detail]["audio_source"]}</a>)
                              </Col>
                            </Row>
                          </Col>
                        : null}
                      </Row>
                    </Panel>
                  )
                })
              }
            </Collapse>
              <Modal title={`Make a suggestion - ${reportDetails["detail"]} of ${reportDetails["character"]}`} visible={isReportModalVisible} footer={null} onCancel={() => setIsReportModalVisible(false)}>
                <Row style={{ paddingBottom: 30 }}>
                  <Col span={24}>
                    <i>To make a suggestion about a definition or even an audio file for the pronunciation of your Chinese dialect, you can send me an email, or use Codeberg/Github issues if you are familiar with them. Note that currently, these suggestions will only be stored so that modifications can be make in the future. The current state of this website does not allow open contributions yet. For the tech-savvy, this is because this website is currently front-end only.</i>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <Row style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                      <Col span={24}>
                        <a href={`mailto:joris.truong@protonmail.com?subject=[Suggestion] ${reportDetails["character"]} - ${reportDetails["detail"]}`}>
                          <img src={require("../images/protonmail.svg")} height="32px" width="32px" alt="protonmail"/>
                        </a>
                      </Col>
                      <Col span={24}>
                        Send an email
                      </Col>
                    </Row>
                  </Col>
                  <Col span={8}>
                    <Row style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                      <Col span={24}>
                        <a href={`https://github.com/JorisTruong/learn-chinese-characters/issues/new?assignees=&labels=suggestion&template=suggestion.md&title=%5BSUGGESTION%5D+${reportDetails["character"]}+-+${reportDetails["detail"]}`} target="_blank" rel="noreferrer">
                          <img src={require("../images/github.svg")} height="32px" width="32px" alt="github"/>
                        </a>
                      </Col>
                      <Col span={24}>
                        Create a Github issue (with account)
                      </Col>
                    </Row>
                  </Col>
                  <Col span={8}>
                    <Row style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                      <Col span={24}>
                        <a href={`https://gitreports.com/issue/JorisTruong/learn-chinese-characters?issue_title=[SUGGESTION] ${reportDetails["character"]} - ${reportDetails["detail"]}&details=Describe your suggestion here`} target="_blank" rel="noreferrer">
                          <img src={require("../images/github.svg")} height="32px" width="32px" alt="github" style={{ opacity: 0.5 }}/>
                        </a>
                      </Col>
                      <Col span={24}>
                        Create a Github issue (without account)
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Modal>
          </Col>
        </Row>
      </div>
      <div style={{ padding: 10 }}>
        <Row gutter={16} align="middle">
          <Col lg={{ span: 2, offset: 9 }} md={{ span: 6, offset: 4 }} xs={{ span: 9 }}>
            <Button type="primary" onClick={() => hanzi.animateCharacter()} style={{ width: "100%" }}>Animate</Button>
          </Col>
          <Col lg={{ span: 3 }} md={{ span: 6}} xs={{ span: 10 }}>
            <Slider
                min={0}
                max={5}
                value={animationSpeed}
                onChange={(value) => value === 0 ? setSpeedLevel(1) : setSpeedLevel(value)}
            />
            Animation Speed
          </Col>
          <Col lg={{ span: 1 }} md={{ span: 3 }} xs={{ span: 5 }}>
            <InputNumber
                min={1}
                max={5}
                style={{ width: "100%" }}
                value={animationSpeed}
                onChange={(value) => setSpeedLevel(value)}
            />
          </Col>
        </Row>
      </div>
      <div style={{ padding: 10 }}>
        <Row gutter={16}>
          <Col lg={{ span: 4, offset: 10 }} md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Button type="primary" onClick={() => hanzi.quiz()} style={{ width: "100%" }}>Quiz</Button>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Home
