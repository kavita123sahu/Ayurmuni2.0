import { Actions } from "../types/Types"


const setInternetStatus = (payload:any) => {
    return {
        type: Actions.INTERNET_CONNECTION,
        payload: payload
    }
}

export { setInternetStatus }