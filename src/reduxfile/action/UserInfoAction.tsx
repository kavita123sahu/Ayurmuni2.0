import { Actions } from "../types/Types"

export const setUserInfo = (payload: any) => {
    return {
        type: Actions.SET_USER_INFO,
        payload: payload
    }
}