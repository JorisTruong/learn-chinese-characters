import React, { useState, useRef, useEffect } from "react"
import Helmet from "react-helmet"
import { Layout, Menu, Button, Input, Slider, InputNumber, Modal, AutoComplete, Collapse, Tooltip, Row, Col } from "antd"
import { HomeOutlined, HighlightOutlined, RocketOutlined, TableOutlined, FlagOutlined } from "@ant-design/icons"
import { AutoSizer, Collection } from "react-virtualized"

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

const { Header, Content, Footer, Sider } = Layout
const { Search } = Input
const { Panel } = Collapse;

var hanzi = null

const IndexPage = () => {  
  const divRef = useRef()
  useEffect(() => {
    if (hanzi == null) {
      hanzi = HanziWriter.create(divRef.current, '學', {
        width: 200,
        height: 200,
        padding: 5,
        showOutline: true,
        delayBetweenStrokes: 1000,
        strokeAnimationSpeed: 1
      })
    }
  })

  const [leftCollapsed, setLeftCollapse] = useState(window.innerWidth < window.innerHeight ? true : false)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [currentHanzi, setCurrentHanzi] = useState({"character": "\u5b66", "details": {"definition": "learning, knowledge, science; to study, to go to school; -ology", "pinyin": ["xu\u00e9"]}})

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
      var normalizedPinyin = input.pinyin.map(element => element.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      if (normalizedPinyin.find(element => element.startsWith(query.toLowerCase()))) {
        return input
      } else {
        return null
      }
    }
  }

  const searchResult = (query) => {
    var hanziQuery = jsonQuery(['characters[*character=?]', query], {data: hanziDataQuery})
    var pinyinQuery = jsonQuery(['characters[*details][*:pinyinSearch(?)]', query], {data: hanziDataQueryPinyinSort, locals: helpers})
    var result = hanziQuery.key.concat(pinyinQuery.key)
    if (hanziQuery.key.length == 1) {
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

  const setHanzi = (value, obj) => {
    if (obj != null) {
      hanzi.setCharacter(value)
      setCurrentHanzi(obj)
    } else {
      if (value !== '') {
        var hanziQuery = jsonQuery(['characters[*character=?]', value], {data: hanziDataQuery})
        if (hanziQuery.key.length == 1) {
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

  const report = () => (
    <Tooltip title="Make a suggestion">
      <Button type="ghost" shape="circle" icon={<FlagOutlined />} onClick={event => {
        event.stopPropagation()
        console.log(currentHanzi)
      }} />
    </Tooltip>
  );

  return (
    <div>
      <Helmet title="Learn Chinese Characters">

      </Helmet>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible collapsed={leftCollapsed} onCollapse={() => setLeftCollapse(!leftCollapsed)}
          collapsedWidth={window.innerWidth < window.innerHeight && leftCollapsed ? "0" : Sider.defaultProps}
          zeroWidthTriggerStyle={{position: "fixed", left: 0, right: "auto", bottom: 0, top: "auto"}}
          style={{
            overflow: "auto",
            height: "calc(100vh - 48px)",
            position: "fixed",
            left: 0,
            zIndex: 999
          }}
        >
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1" icon={<HomeOutlined />}>Home</Menu.Item>
            <Menu.Item key="2" icon={<HighlightOutlined />}>Text Quiz</Menu.Item>
            <Menu.Item key="3" icon={<RocketOutlined />}>Stroke Racer</Menu.Item>
            <Menu.Item key="4" icon={<TableOutlined />}>Generate Word Sheet</Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background">
            <div style={{ textAlign: 'center' }}>
              Learn Chinese Characters
            </div>
          </Header>
          <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
            <div className="site-layout-background" style={{ padding: 24, textAlign: "center" }}>
              <AutoComplete
                dropdownMatchSelectWidth={window.innerWidth < window.innerHeight ? "75vw" : "20vw"}
                style={{
                  width: window.innerWidth < window.innerHeight ? "75vw" : "20vw",
                }}
                options={suggestions}
                onSearch={handleSearch}
                onSelect={(value) => setHanzi(value)}
              >
                <Search placeholder="Search a Chinese Character" enterButton={"OK"} style={{ width: window.innerWidth < window.innerHeight ? "75vw" : "20vw" }} onSearch={(value) => setHanzi(value, null)} />
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
              <div style={{ padding: 30 }}>
                <Row align="middle">
                  <Col lg={{ span: 6, offset: 9 }} md={{ span: 12, offset: 6 }} xs={{ span: 24 }}>
                    <Collapse
                      defaultActiveKey={[]}
                    >
                      {
                        Object.keys(currentHanzi.details).map((detail) => {
                          return(
                            <Panel header={detail} key={detail} extra={report(currentHanzi)}>
                              <div style={{ textAlign: 'start' }}>
                                {currentHanzi.details[detail]}
                              </div>
                            </Panel>
                          )
                        })
                      }
                    </Collapse>
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
          </Content>
          <Footer>
            <div style={{ textAlign: "center", padding: 15 }} >
              Joris Truong
            </div>
            <Row>
              <Col lg={{ span: 1, offset: 10 }} md={{ span: 2, offset: 8 }} xs={{ span: 4, offset: 4 }}>
                <div style={{ display: 'flex', width: "100%", justifyContent: "center", alignItems: "center" }}>
                  <a href="mailto:joris.truong@protonmail.com">
                    <img src={require("../images/protonmail.svg")} height="32px" width="32px" alt="protonmail"/>
                  </a>
                </div>
              </Col>
              <Col lg={1} md={2} xs={4}>
                <div style={{ display: 'flex', width: "100%", justifyContent: "center", alignItems: "center" }}>
                  <a href="https://codeberg.org/joristruong" target="_blank" rel="noreferrer">
                    <img src={require("../images/codeberg.svg")} height="32px" width="32px" alt="codeberg"/>
                  </a>
                </div>
              </Col>
              <Col lg={1} md={2} xs={4}>
                <div style={{ display: 'flex', width: "100%", justifyContent: "center", alignItems: "center" }}>
                  <a href="https://github.com/JorisTruong" target="_blank" rel="noreferrer">
                    <img src={require("../images/github.svg")} height="32px" width="32px" alt="github"/>
                  </a>
                </div>
              </Col>
              <Col lg={1} md={2} xs={4}>
                <div style={{ display: 'flex', width: "100%", justifyContent: "center", alignItems: "center" }}>
                  <a href="https://www.linkedin.com/in/joris-truong-35a383131/" target="_blank" rel="noreferrer">
                    <img src={require("../images/linkedin.svg")} height="32px" width="32px" alt="linkedin"/>
                  </a>
                </div>
              </Col>
            </Row>
            <div style={{ textAlign: "center", padding: 15, fontSize: 10 }} >
              <i>Contact icons by <a href="https://github.com/aegis-icons/aegis-icons" target="_blank" rel="noreferrer">Aegis</a></i>
            </div>
          </Footer>
        </Layout>
      </Layout>,
    </div>
  )
}

export default IndexPage
