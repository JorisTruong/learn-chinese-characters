import React from "react"

import Skeleton from "../components/skeleton.js"
import InputText from "../components/input.js"

const IndexPage = () => {  
  return (
    <Skeleton index={"2"}>
      <InputText />
    </Skeleton>
  )
}

export default IndexPage
