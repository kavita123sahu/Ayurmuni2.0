

import { combineReducers } from '@reduxjs/toolkit'; // Note: from redux toolkit

import internetReducer from "./InternetReducer";

const rootReducer = combineReducers({
    nointernet: internetReducer,

});

export default rootReducer;
