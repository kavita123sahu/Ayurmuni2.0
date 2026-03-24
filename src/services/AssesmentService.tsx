import { use } from "react";
import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";

export const GetQuestionOptions = async () => {

    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + `healthcare/ayurveda/questions/`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const AssesmentSubmit = async (data: Object) => {
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
            console.log(BaseUrl.base_url + `healthcare/ayurveda/answers/submit/`, fetchParameter)
            let serverResponse = await fetch(BaseUrl.base_url + `healthcare/ayurveda/answers/submit/`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const GetAssessmentPercentage = async () => {
    return new Promise(async (resolve, reject) => {

        try {
            const customer_id = await Utils.getData('_CUSTOMER_ID');
            const user = await Utils.getData('_USER_INFO');
            const id = customer_id || user?.id;

            console.log("customeriddddddddddddddd", id , customer_id, user.id)

            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + `healthcare/ayurveda/profile/${id}/`, fetchParameter);
            // let response = await serverResponse.json();
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}