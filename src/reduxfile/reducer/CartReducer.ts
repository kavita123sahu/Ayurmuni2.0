import { Utils } from "../../common/Utils";
import { Actions } from "../types/Types";

const initialState = {
    cart_items: [],
};

const cart_info_reducer = (state = initialState, action: any) => {
    switch (action.type) {
        case Actions.ADD_TO_CART:
            const updatedCartAdd = state.cart_items.some((item: any) => item.id === action.payload.id)
                ? state.cart_items.map((item: any) =>
                    item.id === action.payload.id ? action.payload : item
                )
                : [...state.cart_items, action.payload];

            Utils.storeData('cart_items', JSON.stringify(updatedCartAdd));

            return {
                ...state,
                cart_items: updatedCartAdd,
            };

        case Actions.REMOVE_FROM_CART:
            const updatedCartRemove = state.cart_items.filter((item: any) => item.id !== action.payload.id);

            Utils.storeData('cart_items', JSON.stringify(updatedCartRemove));

            return {
                ...state,
                cart_items: updatedCartRemove,
            };

        default:
            return state;
    }
};

export default cart_info_reducer;
