import { createStore, combineReducers } from "redux"
import updateRandomCharacterGame from "./reducers.js"

export default createStore(combineReducers({ updateRandomCharacterGame }));