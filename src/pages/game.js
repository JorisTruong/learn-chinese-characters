import React from "react"

import Skeleton from "../components/skeleton.js"
import RandomCharacterGame from "../components/randomCharacterGame.js"

const Game = () => {  
  return (
    <Skeleton index={"3"}>
      <RandomCharacterGame />
    </Skeleton>
  )
}

export default Game
