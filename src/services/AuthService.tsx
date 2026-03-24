import { Utils } from "../common/Utils";
import { ApiResponse, BaseUrl, Method } from "../config/Key";


export const send_otp = async (data: Object) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            console.log('urllsendotp', BaseUrl.base_url + 'user/send-otp/', fetchParameter);
            let serverResponse = await fetch(BaseUrl.base_url + 'user/send-otp/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const verify_otp_login = async (data: Object) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            console.log('urllsendotp', BaseUrl.base_url + 'user/unified-login/', fetchParameter);
            let serverResponse = await fetch(BaseUrl.base_url + 'user/unified-login/v2/', fetchParameter);
            console.log('LoginResponse:', serverResponse);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const customer_login = async (data: Object) => {
    return new Promise(async (resolve, reject) => {
        try {

            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            // console.log('urllsendotp', BaseUrl.base_url + 'user/unified-login/');
            let serverResponse = await fetch(BaseUrl.base_url + 'user/customerlogin/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const onBoarding = async (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {

            let fetchParameter = {
                method: Method.POST,
                body: data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    // "Authorization": `Bearer ${token}`,
                },
            };

            let serverResponse = await fetch(BaseUrl.base_url + 'customers/customer/', fetchParameter);
            console.log('OnboardingResponse:', serverResponse);
            resolve(serverResponse);
        } catch (error) {
            console.log('Fetch error', error);
            reject(error);
        }
    });
};

export const verify_otp = async (data: Object) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            console.log('urllsendotp', BaseUrl.base_url + 'user/register/');
            let serverResponse = await fetch(BaseUrl.base_url + 'user/register/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}



export const forgot_password = async (data: Object) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.urlV3 + 'auth/reset-password', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const sendOtp = async (data: Object) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.urlV3 + 'auth/forgot-password', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}
export const logout = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let access_token = Utils.getData('ACCESS_TOKEN');
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'access_token': 'Bearer ' + access_token
                },
            }
            let serverResponse = await fetch(BaseUrl.url + 'auth/logout', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}