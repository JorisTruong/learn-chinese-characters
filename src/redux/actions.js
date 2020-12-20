import { UPDATE_CORRECT_STROKES, UPDATE_MISTAKE_STROKES, UPDATE_CORRECT_CHAR, UPDATE_PRECISION } from "./actionTypes.js"

export const updateCorrectStrokes = correctStrokes => {
  return {
    type: UPDATE_CORRECT_STROKES,
    payload: correctStrokes
  }
}

export const updateMistakeStrokes = mistakeStrokes => {
  return {
    type: UPDATE_MISTAKE_STROKES,
    payload: mistakeStrokes
  }
}

export const updateCorrectChar = correctChar => {
  return {
    type: UPDATE_CORRECT_CHAR,
    payload: correctChar
  }
}

export const updatePrecision = precision => {
  return {
    type : UPDATE_PRECISION,
    payload: precision
  }
}