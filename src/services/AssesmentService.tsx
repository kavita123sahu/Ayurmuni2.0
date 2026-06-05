import { use } from "react";
import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";
import { apiClient } from "./APIconfig";

export const GetQuestionOptions = async (data: any) => {

    try {
        const response = await apiClient('customers/questionnaires/questions/list/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response;
    } catch (error) {
        throw error;
    }
}


export const KnowPrakritiSubmit = async (data: Object) => {
    try {
        const response = await apiClient('customers/initiate_onboarding/', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        return response;
    } catch (error) {
        throw error;
    }
}


export const QuestionnaireSubmit = async (data: Object) => {
    try {
        const response = await apiClient('customers/questionnaires/responses/', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        return response;
    } catch (error) {
        throw error;
    }
}



export const AssesmentYesSubmit = async (data: Object) => {
    try {
        const response = await apiClient('customers/answer_prakriti/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response;
    } catch (error) {
        throw error;
    }
}


export const SkipAssesment = async (data: Object) => {
    try {
        const response = await apiClient('customers/initiate_onboarding/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response;
    } catch (error) {
        throw error;
    }
}




