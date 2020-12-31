import React from "react"
import { Typography, Row, Col } from "antd"
import { useStaticQuery, graphql } from "gatsby"


const { Title, Paragraph } = Typography

const AboutPage = () => {
  const data = useStaticQuery(graphql`
    query MyQuery {
      file(relativePath: {eq: "hanzi.json"}) {
        publicURL
        name
      }
    }
  `)

  return (
    <div className="site-layout-background" style={{ padding: 24, textAlign: "center" }}>
      <Row style={{ paddingBottom: 25 }}>
        <Col lg={{ span: 12, offset: 6 }} md={{ span: 20, offset: 2 }} xs={{ span: 24 }}>
          <Typography>
            <Title level={5}>
              About us
            </Title>
            <Paragraph style={{ textAlign: "justify" }}>
              Learn Chinese Characters is a free and open-source website. The data comes from various sources, more precisely <a href="https://github.com/chanind/hanzi-writer-data" target="_blank" rel="noreferrer">Hanzi Writer Data</a>, <a href="https://github.com/skishore/makemeahanzi" target="_blank" rel="noreferrer">Make me a Hanzi</a>, <a href="http://shtooka.net/" target="_blank" rel="noreferrer">Shtooka</a>, <a href="https://pycantonese.org/" target="_blank" rel="noreferrer">PyCantonese</a>. The data can be found under the JSON format <a href={data.file.publicURL} target="_blank" rel="noreferrer">here</a>. Learn Chinese Characters makes no guarantee concerning the exact accuracy of the chinese characters definition, pinyin, stroke order or any other information.
            </Paragraph>
            <Paragraph style={{ textAlign: "justify" }}>
              You can find the repository on <a href="https://codeberg.org/joristruong" target="_blank" rel="noreferrer">Codeberg</a> or on <a href="https://github.com/JorisTruong" target="_blank" rel="noreferrer">Github</a>. This website has been developed in React with the Ant Design library.
            </Paragraph>
          </Typography>
        </Col>
      </Row>
    </div>
  )
}

export default AboutPage
