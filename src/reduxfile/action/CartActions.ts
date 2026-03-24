import { Actions } from "../types/Types"


export const add_to_art = (payload: any) => {
    return {
        type: Actions.ADD_TO_CART,
        payload: payload,
    }
}

export const removeFromCart = (itemId: number) => {
    return {
        type: Actions.REMOVE_FROM_CART,
        payload: { id: itemId },
    }
}

export const isAddedToCart = (payload: boolean) => {
    return {
        type: Actions.IS_ADDED_TO_CART,
        payload: payload,
    }
}

export const isRemovedFromCart = (payload: boolean) => {
    return {
        type: Actions.IS_REMOVED_FROM_CART,
        payload: payload,
    }
}