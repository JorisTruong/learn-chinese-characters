import React from "react"
import loadable from '@loadable/component'

import Skeleton from "../components/skeleton.js"


const GenerateOptions = loadable(() => import("../components/generateOptions.js"))

const GeneratePage = () => {  
  return (
    <Skeleton index={"5"}>
      <GenerateOptions />
    </Skeleton>
  )
}

export default GeneratePage
