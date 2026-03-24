import { Actions } from "../types/Types";

const initialState = {
    dark_mode: '',
};

const darkmode_reducer = (state = initialState, action: any) => {
    switch (action.type) {
        case Actions.DARK_MODE:
            return {
                ...state,
                dark_mode: action.payload,
            };
        default: {
            return state;
        }
    }
}

export default darkmode_reducer
