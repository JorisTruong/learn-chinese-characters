import React from "react"

import Skeleton from "../components/skeleton.js"
import GenerateOptions from "../components/generateOptions.js"

const GeneratePage = () => {  
  return (
    <Skeleton index={"5"}>
      <GenerateOptions />
    </Skeleton>
  )
}

export default GeneratePage
