import React, { useState } from "react"
import Helmet from "react-helmet"
import { Layout, Menu, Icon } from "antd"

import one from "../images/1.svg"
import two from "../images/2.svg"
import three from "../images/3.svg"
import four from "../images/4.svg"
import five from "../images/5.svg"
import six from "../images/6.svg"
import seven from "../images/7.svg"

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

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
  const [leftCollapsed, setLeftCollapse] = useState(false);
  const [rightCollapsed, setRightCollapse] = useState(false);

  return (
    <div>
      <Helmet title="Learn Chinese Characters">

      </Helmet>
      <Layout>
        <Sider
          collapsible collapsed={leftCollapsed} onCollapse={() => setLeftCollapse(!leftCollapsed)}
          style={{
            height: '100vh',
            left: 0,
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
          <Header className="site-layout-background" style={{ padding: 0, textAlign: 'center' }}>
            Learn Chinese Characters
          </Header>
          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div className="site-layout-background" style={{ padding: 24, textAlign: 'center' }}>
              content
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Joris Truong</Footer>
        </Layout>
        <Sider
          collapsible collapsed={rightCollapsed} onCollapse={() => setRightCollapse(!rightCollapsed)}
          reverseArrow
          style={{
            height: '100vh',
            left: 0,
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
