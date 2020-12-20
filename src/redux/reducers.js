import { UPDATE_CORRECT_STROKES, UPDATE_MISTAKE_STROKES, UPDATE_CORRECT_CHAR, UPDATE_PRECISION } from "./actionTypes.js"

const initialState = {
  correctStrokes: 0,
  mistakeStrokes : 0,
  correctChar: 0,
  precision: 0
}

export default function updateRandomCharacterGame(state = initialState, action) {
  switch (action.type) {
    case UPDATE_CORRECT_STROKES: {
      return {
        ...state,
        correctStrokes: action.payload
      }
    }
    case UPDATE_MISTAKE_STROKES: {
      return {
        ...state,
        mistakeStrokes: action.payload
      }
    }
    case UPDATE_CORRECT_CHAR: {
      return {
        ...state,
        correctChar: action.payload
      }
    }
    case UPDATE_PRECISION: {
      return {
        ...state,
        precision: action.payload
      }
    }
    default:
      return state
  }
}