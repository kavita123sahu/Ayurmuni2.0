import { Actions } from "../types/Types";


const initialState = {
    isAddedToCart: false,
    isRemovedFromCart: false
};


const CartAddedReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case Actions.IS_ADDED_TO_CART:
            return {
                ...state,
                isAddedToCart: action.payload,
            };
        case Actions.IS_REMOVED_FROM_CART:
            return {
                ...state,
                isAddedToCart: action.payload,
            };
        default: {
            return state;
        }
    }
}

export default CartAddedReducer
