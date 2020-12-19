import React from "react"

import Skeleton from "../components/skeleton.js"
import Home from "../components/home.js"

const IndexPage = () => {  
  return (
    <Skeleton index={"1"}>
      <Home />
    </Skeleton>
  )
}

export default IndexPage
