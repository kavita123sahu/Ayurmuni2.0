// useCallSocket.ts
// Handles ring / accept / reject / end signaling over the existing socket.io-client connection.

import { useEffect, useRef, useCallback, useState } from 'react';
import { Socket } from 'socket.io-client';
import {
    SOCKET_EVENTS,
    CallInvitePayload,
    CallResponsePayload,
    CallEndPayload,
    CallRole,
} from '../hooks/usercallTypes';

type IncomingCall = {
    appointmentId: string;
    channelName: string;
    callerId: string;
    callerName: string;
    callerRole: CallRole;
};

type UseCallSocketParams = {
    socket: Socket | null; // pass your already-connected socket instance
    myUserId: string;
};

export const useCallSocket = ({ socket, myUserId }: UseCallSocketParams) => {
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(
        null,
    );
    const [callEndedReason, setCallEndedReason] = useState<string | null>(
        null,
    );

    // Keep latest myUserId without re-binding listeners every render
    const myUserIdRef = useRef(myUserId);
    myUserIdRef.current = myUserId;

    useEffect(() => {
        if (!socket) return;

        const onInvite = (payload: CallInvitePayload) => {
            // Only react if this invite is meant for me
            if (payload.calleeId !== myUserIdRef.current) return;

            setIncomingCall({
                appointmentId: payload.appointmentId,
                channelName: payload.channelName,
                callerId: payload.callerId,
                callerName: payload.callerName,
                callerRole: payload.callerRole,
            });
        };

        const onEnd = (payload: CallEndPayload) => {
            setCallEndedReason(payload.endedBy);
            setIncomingCall(null);
        };

        socket.on(SOCKET_EVENTS.CALL_INVITE, onInvite);
        socket.on(SOCKET_EVENTS.CALL_END, onEnd);

        return () => {
            socket.off(SOCKET_EVENTS.CALL_INVITE, onInvite);
            socket.off(SOCKET_EVENTS.CALL_END, onEnd);
        };
    }, [socket]);

    /** Caller side: send an invite to the other party */
    const sendInvite = useCallback(
        (payload: CallInvitePayload) => {
            socket?.emit(SOCKET_EVENTS.CALL_INVITE, payload);
        },
        [socket],
    );

    /** Callee side: accept or reject an incoming call */
    const respondToCall = useCallback(
        (payload: CallResponsePayload) => {
            socket?.emit(SOCKET_EVENTS.CALL_RESPONSE, payload);
            setIncomingCall(null);
        },
        [socket],
    );

    /** Either side: notify the other party the call has ended */
    const sendCallEnd = useCallback(
        (payload: CallEndPayload) => {
            socket?.emit(SOCKET_EVENTS.CALL_END, payload);
        },
        [socket],
    );

    /** Listen once for the callee's accept/reject (used by the caller) */
    const waitForResponse = useCallback(
        (
            channelName: string,
            onAccepted: () => void,
            onRejected: () => void,
        ) => {
            if (!socket) return () => {};

            const handler = (payload: CallResponsePayload) => {
                if (payload.channelName !== channelName) return;
                if (payload.accepted) onAccepted();
                else onRejected();
            };

            socket.on(SOCKET_EVENTS.CALL_RESPONSE, handler);
            return () => socket.off(SOCKET_EVENTS.CALL_RESPONSE, handler);
        },
        [socket],
    );

    const clearIncomingCall = useCallback(() => setIncomingCall(null), []);
    const clearCallEndedReason = useCallback(
        () => setCallEndedReason(null),
        [],
    );

    return {
        incomingCall,
        callEndedReason,
        sendInvite,
        respondToCall,
        sendCallEnd,
        waitForResponse,
        clearIncomingCall,
        clearCallEndedReason,
    };
};