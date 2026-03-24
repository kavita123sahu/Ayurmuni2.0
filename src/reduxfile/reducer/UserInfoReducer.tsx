import { Actions } from "../types/Types";

const initialState = {
    user_info: null,
};

const user_info_reducer = (state = initialState, action: any) => {
    switch (action.type) {
        case Actions.SET_USER_INFO:
            return {
                ...state,
                user_info: action.payload,
            };
        default: {
            return state;
        }
    }
}

export default user_info_reducer
