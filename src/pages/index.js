import React, { useState, useRef, useEffect } from "react"
import Helmet from "react-helmet"
import { Layout, Menu, Button, Input, Slider, InputNumber, Row, Col } from "antd"


const HanziWriter = require("hanzi-writer");

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;
const { Search } = Input;

const strokes = require("../resources/hanzi.json");

const pronunciations = {
  "Mandarin": {},
  "Cantonese": {}
}

var hanzi = null;

const IndexPage = () => {  
  const divRef = useRef();
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

  const [leftCollapsed, setLeftCollapse] = useState(window.innerWidth < window.innerHeight ? true : false);
  const [rightCollapsed, setRightCollapse] = useState(window.innerWidth < window.innerHeight ? true : false);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  const toggleLeftCollapse = () => {
    if (window.innerWidth < window.innerHeight && !rightCollapsed) {
      setRightCollapse(true);
    }
    setLeftCollapse(!leftCollapsed);
  }

  const toggleRightCollapse = () => {
    if (window.innerWidth < window.innerHeight && !leftCollapsed) {
      setLeftCollapse(true);
    }
    setRightCollapse(!rightCollapsed);
  }

  const setSpeedLevel = (value) => {
    setAnimationSpeed(value);
    if (value === 1) {
      hanzi._options.delayBetweenStrokes = 1000;
      hanzi._options.strokeAnimationSpeed = 1;
    }
    if (value === 2) {
      hanzi._options.delayBetweenStrokes = 500;
      hanzi._options.strokeAnimationSpeed = 2;
    }
    if (value === 3) {
      hanzi._options.delayBetweenStrokes = 250;
      hanzi._options.strokeAnimationSpeed = 3;
    }
    if (value === 4) {
      hanzi._options.delayBetweenStrokes = 100;
      hanzi._options.strokeAnimationSpeed = 4;
    }
    if (value === 5) {
      hanzi._options.delayBetweenStrokes = 1;
      hanzi._options.strokeAnimationSpeed = 5;
    }
  }

  const setHanzi = (value) => {
    if (value !== '') {
      hanzi.setCharacter(value);
    }
  }

  return (
    <div>
      <Helmet title="Learn Chinese Characters">

      </Helmet>
      <Layout>
        <Sider
          collapsible collapsed={leftCollapsed} onCollapse={toggleLeftCollapse}
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
          <Menu theme="dark" mode="inline" defaultSelectedKeys={[]}>
            {
              strokes.map((item) => {
                return(
                  <SubMenu key={item["name"]} title={item["name"] + " strokes"}>
                    {
                      item["characters"].map((c) => {
                        return(
                          <Menu.Item key={c["character"]} onClick={() => setHanzi(c["character"])}>
                            {c["character"]}
                          </Menu.Item>
                        )
                      })
                    }
                  </SubMenu>
                )
              })
            }
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0, textAlign: "center" }}>
            Learn Chinese Characters
          </Header>
          <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
            <div className="site-layout-background" style={{ padding: 24, textAlign: "center" }}>
              <Search placeholder="Input Chinese Character" enterButton={"OK"} style={{ width: window.innerWidth < window.innerHeight ? "75vw" : "20vw" }} onSearch={(value) => setHanzi(value)} />
              <div style={{ padding: 50}} >
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
          <Footer style={{ textAlign: "center" }}>Joris Truong</Footer>
        </Layout>
        <Sider
          collapsible collapsed={rightCollapsed} onCollapse={toggleRightCollapse}
          collapsedWidth={window.innerWidth < window.innerHeight && rightCollapsed ? "0" : Sider.defaultProps}
          zeroWidthTriggerStyle={{position: "fixed", right: 0, left: "auto", bottom: 0, top: "auto"}}
          reverseArrow
          style={{
            overflow: "auto",
            height: "calc(100vh - 48px)",
            position: "fixed",
            right: 0,
            zIndex: 999
          }}
        >
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
            {
              Object.keys(pronunciations).map((key, value) => {
                return(
                  <SubMenu key={key} title={key}>
                  </SubMenu>
                )
              })
            }
          </Menu>
        </Sider>
      </Layout>,
    </div>
  )
}

export default IndexPage
