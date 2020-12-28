import React from "react"

import Skeleton from "../components/skeleton.js"
import RaceGame from "../components/raceGame.js"

const Race = () => {  
  return (
    <Skeleton index={"4"}>
      <RaceGame />
    </Skeleton>
  )
}

export default Race
