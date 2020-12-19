import React, { useState } from "react"
import { Link } from "gatsby"
import Helmet from "react-helmet"
import { Layout, Menu, Row, Col } from "antd"
import { HomeOutlined, HighlightOutlined, FieldTimeOutlined, RocketOutlined, TableOutlined } from "@ant-design/icons"


const { Header, Content, Footer, Sider } = Layout

const Skeleton = (props) => {  

  const [leftCollapsed, setLeftCollapse] = useState(window.innerWidth < window.innerHeight ? true : false)

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
          <Menu theme="dark" mode="inline" defaultSelectedKeys={[props.index]}>
            <Menu.Item key="1" icon={<HomeOutlined />} style={{whiteSpace: 'normal', height: 'auto'}}><Link to="/">Home</Link></Menu.Item>
            <Menu.Item key="2" icon={<HighlightOutlined />} style={{whiteSpace: 'normal', height: 'auto'}}><Link to="/textQuiz">Text Quiz</Link></Menu.Item>
            <Menu.Item key="3" icon={<FieldTimeOutlined />} style={{whiteSpace: 'normal', height: 'auto'}}><Link to="/game">Random Character Game</Link></Menu.Item>
            <Menu.Item key="4" icon={<RocketOutlined />} style={{whiteSpace: 'normal', height: 'auto'}}><Link to="/racer">Stroke Racer</Link></Menu.Item>
            <Menu.Item key="5" icon={<TableOutlined />} style={{whiteSpace: 'normal', height: 'auto'}}><Link to="/generate">Generate Word Sheet</Link></Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background">
            <div style={{ textAlign: 'center' }}>
              Learn Chinese Characters
            </div>
          </Header>
          <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
            {props.children}
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

export default Skeleton
