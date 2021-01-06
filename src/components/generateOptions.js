import React, { useState } from "react"
import { Card, Input, AutoComplete, Modal, Button, Typography, InputNumber, Select, Row, Col } from "antd"
import { PlusOutlined, MinusOutlined } from "@ant-design/icons"
import { AutoSizer, Collection } from "react-virtualized"

import { generateWordSheet } from "../utils/wordSheetGeneration.js"


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
const { Title, Paragraph } = Typography
const { Option } = Select;

const GenerateOptions = () => {  
  const [suggestions, setSuggestions] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [inputs, setInputs] = useState([""])
  const [fannings, setFannings] = useState([0])
  const [placeholders, setPlaceholders] = useState([0])
  const [direction, setDirection] = useState("lrt")
  const [lines, setLines] = useState([1])
  const [inputIndex, setInputIndex] = useState(0)

  const handleSearch = (value) => {
    let updatedSuggestions = [...suggestions]
    if (value) {
      updatedSuggestions[inputIndex] = searchResult(value)
    } else {
      updatedSuggestions[inputIndex] = []
    }
    setSuggestions(updatedSuggestions)
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

  const cellRenderer = ({ index, key, style }) => {
    style.fontSize = 20
    style.borderRadius = "10px"
    style.display = "flex"
    style.justifyContent = "center"
    style.alignItems = "center"
    return (
      <Button key={key} style={style} onClick={() => {
        setIsModalVisible(false)
        let updatedInputs = [...inputs]
        updatedInputs[inputIndex] = hanziData[index].character
        setInputs(updatedInputs)
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

  return (
    <div className="site-layout-background" style={{ padding: 24 }}>
      <Row style={{ paddingBottom: 25, textAlign: "center" }}>
        <Col lg={{ span: 12, offset: 6 }} md={{ span: 20, offset: 2 }} xs={{ span: 24 }}>
          <Typography>
            <Title level={5}>
              Practice handwriting
            </Title>
            <Paragraph style={{ textAlign: "justify" }}>
              Learning chinese characters stroke order is cool and all... But don"t you ever want to go back to the roots? You can generate word sheet to print for handwriting practice here. The word sheets are customizable: you can choose to get stroke order help, change the writing direction to left-to-right or top-to-bottom, select the number of lines... Whatever your level is, you can generate word sheets that correpond to you! (Do not forget to save the forests.)
            </Paragraph>
          </Typography>
        </Col>
      </Row>
      {
        inputs.map((element, index) => {
          return(
            <Row key={`generate ${index}`} style={{ paddingBottom: 25 }}>
              <Col lg={{ span: 14, offset: 5 }} md={{ span: 18, offset: 3 }} xs={{ span: 24 }}>
                <Card>
                  <Row gutter={[16, 16]}>
                    <Col lg={{ span: 9}} xs={{ span: 24 }}>
                      <Row style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Col span={24} style={{ textAlign: "center" }}>
                          <strong>Character</strong>
                        </Col>
                        <Col span={24}>
                          <AutoComplete
                            dropdownMatchSelectWidth={window.innerWidth < window.innerHeight ? "75vw" : "20vw"}
                            style={{ width: "100%" }}
                            options={suggestions[index]}
                            onSearch={handleSearch}
                            onSelect={(value) => {
                              let updatedInputs = [...inputs]
                              updatedInputs[index] = value
                              setInputs(updatedInputs)
                            }}
                            value={inputs[index]}
                            onFocus={() => setInputIndex(index)}
                            onChange={(value) => {setInputIndex(index); let updatedInputs = [...inputs]; updatedInputs[index] = value; setInputs(updatedInputs)}}
                          >
                            <Search placeholder="Search a Chinese Character" enterButton style={{ width: "100%" }} onSearch={(value) => {setIsModalVisible(true); setInputIndex(index)}} />
                          </AutoComplete>
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
                        </Col>
                      </Row>
                    </Col>
                    <Col lg={{ span: 5}} xs={{ span: 24 }}>
                      <Row style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Col span={24} style={{ textAlign: "center" }}>
                          <strong>Stroke fanning help</strong>
                        </Col>
                        <Col span={24}>
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            value={fannings[index]}
                            onChange={(value) => {
                              let updatedFannings = [...fannings]
                              updatedFannings[index] = value
                              setFannings(updatedFannings)
                            }}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col lg={{ span: 5}} xs={{ span: 24 }}>
                      <Row style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Col span={24} style={{ textAlign: "center" }}>
                          <strong>Character placeholder</strong>
                        </Col>
                        <Col span={24}>
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            value={placeholders[index]}
                            onChange={(value) => {
                              let updatedPlaceholders = [...placeholders]
                              updatedPlaceholders[index] = value
                              setPlaceholders(updatedPlaceholders)
                            }}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col lg={{ span: 5}} xs={{ span: 24 }}>
                      <Row style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Col span={24} style={{ textAlign: "center" }}>
                          <strong>Number of lines</strong>
                        </Col>
                        <Col span={24}>
                          <InputNumber
                            min={1}
                            style={{ width: "100%" }}
                            value={lines[index]}
                            onChange={(value) => {
                              let updatedLines = [...lines]
                              updatedLines[index] = value
                              setLines(updatedLines)
                            }}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          )
        })
      }
      <Row style={{ textAlign: "center" }} gutter={[16, 32]}>
        <Col lg={{span: 2, offset: 10}} md={{span: 2, offset: 10}} xs={{ span: 6, offset: 6}}>
          <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => {
            let updatedInputs = [...inputs]
            updatedInputs[inputs.length] = ""
            setInputs(updatedInputs)
            let updatedFannings = [...fannings]
            updatedFannings[fannings.length] = 0
            setFannings(updatedFannings)
            let updatedPlaceholders = [...placeholders]
            updatedPlaceholders[placeholders.length] = 0
            setPlaceholders(updatedPlaceholders)
            let updatedLines = [...lines]
            updatedLines[lines.length] = 1
            setLines(updatedLines)
          }} />
        </Col>
        <Col lg={{span: 2}} md={{span: 2}} xs={{span: 6}}>
          <Button type="primary" shape="circle" icon={<MinusOutlined />} onClick={() => {
            let updatedInputs = [...inputs]
            updatedInputs.pop()
            setInputs(updatedInputs)
            if (inputIndex > inputs.length - 1) {
              setInputIndex(inputs.length - 1)
            }
            let updatedFannings = [...fannings]
            updatedFannings.pop()
            setFannings(updatedFannings)
            let updatedPlaceholders = [...placeholders]
            updatedPlaceholders.pop()
            setPlaceholders(updatedPlaceholders)
            let updatedLines = [...lines]
            updatedLines.pop()
            setLines(updatedLines)
          }} />
        </Col>
      </Row>
      <Row style={{ textAlign: "center" }} gutter={[16, 16]}>
        <Col lg={{ span: 2, offset: 11 }} md={{ span: 6, offset: 4 }} xs={{ span: 9 }}>
          <Button type="primary" style={{ width: "100%" }} onClick={() => {
            if (inputs.some((element) => element !== "")) {
              generateWordSheet(inputs, fannings, placeholders, lines, direction)
            }
          }}>Generate</Button>
        </Col>
      </Row>
      <Row style={{ textAlign: "center" }} gutter={[16, 16]}>
        <Col lg={{ span: 4, offset: 10 }} xs={{ span: 24 }}>
          <Row style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Col span={24} style={{ textAlign: "center" }}>
              <strong>Direction</strong>
            </Col>
            <Col span={24}>
              <Select
                style={{ width: "100%" }}
                defaultValue="ltr"
                disabled={true} // TOCHANGE
                onChange={(value) => {
                  setDirection(value)
                }}
              >
                <Option value="ltr">Left to right</Option>
                <Option value="ttb">Top to bottom</Option>
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

export default GenerateOptions
