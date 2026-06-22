// import {
//     createAgoraRtcEngine
// } from 'react-native-agora';
// import { BaseUrl } from '../config/Key';

// const engine =
//     createAgoraRtcEngine();

// export default engine;


// export const fetchAgoraToken = async (
//     consultationId: string,
//     authToken: string,
// ) => {
//     console.log("consultationIdconsultationId", consultationId, authToken)
//     try {
//         const response = await fetch(
//             `${BaseUrl.base_url}`,
//             {
//                 method: "POST",
//                 headers: {
//                     Authorization: `Bearer ${authToken}`,
//                     "Content-Type": "application/json",
//                 },

//             },
//         );

//         console.log("responseresponsevideocall", response)
//         const data = await response.json();

//         return {
//             success: response.ok,
//             data,
//         };
//     } catch (error: any) {
//         console.log(
//             "fetchAgoraToken Error:",
//             error,
//         );

//         return {
//             success: false,
//             message: error?.message,
//         };
//     }
// };

// export const markEnded = async (
//     consultationId: string,
//     authToken: string,
// ) => {
//     try {
//         const response = await fetch(
//             `${BaseUrl.base_url}doctors/appointments/${consultationId}/call/end/`,
//             {
//                 method: "POST",
//                 headers: {
//                     Authorization: `Bearer ${authToken}`,
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({}),
//             },
//         );
//         console.log("markEndresponse", response)

//         const data = await response.json();

//         return {
//             success: response.ok,
//             data,
//         };
//     } catch (error: any) {
//         console.log(
//             "markEnded Error:",
//             error,
//         );

//         return {
//             success: false,
//             message: error?.message,
//         };
//     }
// };


