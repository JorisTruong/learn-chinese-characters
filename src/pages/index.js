import React, { useState, useRef, useEffect } from "react"
import Helmet from "react-helmet"
import { Layout, Menu, Button, Input } from "antd"


const HanziWriter = require("hanzi-writer");

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;
const { Search } = Input;

const strokes = {
  "1 - 10 strokes": [],
  "11 - 20 strokes": [],
  "21 - 30 strokes": [],
  "31 - 40 strokes": [],
  "41 - 50 strokes": [],
  "50 - 60 strokes": [],
  "61+ strokes": []
}

const pronunciations = {
  "Mandarin": {},
  "Cantonese": {}
}

const IndexPage = () => {  
  const divRef = useRef();
  var hanzi = null;
  useEffect(() => {
    hanzi = HanziWriter.create(divRef.current, character, {
      width: 200,
      height: 200,
      padding: 5,
      showOutline: true
    })
  })

  const [leftCollapsed, setLeftCollapse] = useState(window.innerWidth < window.innerHeight ? true : false);
  const [rightCollapsed, setRightCollapse] = useState(window.innerWidth < window.innerHeight ? true : false);
  const [character, setCharacter] = useState('學');

  const setHanzi = (value) => {
    hanzi.setCharacter(value)
  }

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
            height: "100vh",
            position: "fixed",
            left: 0
          }}
        >
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
            {
              Object.keys(strokes).map((key, value) => {
                return(
                  <SubMenu key={key} title={key}>
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
              <Button type="primary" onClick={() => hanzi.animateCharacter()}>Animate</Button>
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
            height: "100vh",
            position: "fixed",
            right: 0
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
