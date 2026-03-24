import { Actions } from "../types/Types";


const initialState = {
    isConnected: true
};

const internetReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case Actions.INTERNET_CONNECTION:
            return {
                ...state,
                isConnected: action.payload,
            };
        default: {
            return state;
        }
    }
}


export default internetReducer
