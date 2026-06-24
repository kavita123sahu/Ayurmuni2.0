// callTypes.ts
// Shared types for the doctor <-> patient video call feature

export type CallRole = 'doctor' | 'patient';

export type CallUser = {
    id: string; // user id from your own backend (doctor id / patient id)
    name: string;
    avatar?: string;
    role: CallRole;
};

export type CallStatus =
    | 'idle'
    | 'ringing-outgoing' // I am calling someone, waiting for them to accept
    | 'ringing-incoming' // someone is calling me
    | 'connecting' // accepted, joining Agora channel
    | 'connected' // in call
    | 'ended'
    | 'rejected'
    | 'missed'
    | 'failed';

export type AgoraTokenResponse = {
    token: string;
    channelName: string;
    uid: number; // numeric uid Agora needs
    appId: string;
};

// ---- Socket event payloads ----

export type CallInvitePayload = {
    appointmentId: string;
    channelName: string;
    callerId: string;
    callerName: string;
    callerRole: CallRole;
    calleeId: string;
};

export type CallResponsePayload = {
    appointmentId: string;
    channelName: string;
    accepted: boolean;
    responderId: string;
};

export type CallEndPayload = {
    appointmentId: string;
    channelName: string;
    endedBy: string;
};

// ---- Socket event names (keep in one place so both ends match) ----
export const SOCKET_EVENTS = {
    CALL_INVITE: 'call:invite',
    CALL_RESPONSE: 'call:response',
    CALL_END: 'call:end',
    CALL_BUSY: 'call:busy',
} as const;