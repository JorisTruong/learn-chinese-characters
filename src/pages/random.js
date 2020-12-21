import React from "react"

import Skeleton from "../components/skeleton.js"
import RandomGame from "../components/randomCharacterGame.js"

const RandomCharacterGame = () => {  
  return (
    <Skeleton index={"3"}>
      <RandomGame />
    </Skeleton>
  )
}

export default RandomCharacterGame
