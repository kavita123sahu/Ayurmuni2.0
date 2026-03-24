import { Actions } from "../../redux copy/types/Types"

export const setDarkMode = (payload: any) => {
    return {
        type: Actions.DARK_MODE,
        payload: payload
    }
}