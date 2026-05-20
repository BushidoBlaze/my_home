import {useEffect, useRef, useState} from "react";

type Params = {
    activeChatId?: string;
    onSendFile: (file: File) => Promise<void>;
};

export function useMediaRecord({activeChatId, onSendFile}: Params) {
    const [recordingMode, setRecordingMode] = useState<"voice" | "video" | null>(null);
    const [mediaDraft, setMediaDraft] = useState<{
        file: File;
        mode: "voice" | "video";
        previewUrl: string
    } | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<BlobPart[]>([]);

    useEffect(() => {
        return () => {
            if (mediaDraft?.previewUrl) URL.revokeObjectURL(mediaDraft.previewUrl);
        };
    }, [mediaDraft]);

    async function startRecording(mode: "voice" | "video") {
        if (!activeChatId || recordingMode) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                mode === "voice"
                    ? {audio: true}
                    : {video: true, audio: true}
            );

            mediaStreamRef.current = stream;
            recordedChunksRef.current = [];
            setRecordingMode(mode);

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (ev) => {
                if (ev.data.size > 0) recordedChunksRef.current.push(ev.data);
            };

            recorder.onstop = async () => {
                const mimeType = mode === "voice" ? "audio/webm" : "video/webm";
                const blob = new Blob(recordedChunksRef.current, {type: mimeType});
                const fileName = `${mode}-${Date.now()}.webm`;
                const file = new File([blob], fileName, {type: mimeType});

                stream.getTracks().forEach(t => t.stop());
                mediaStreamRef.current = null;
                setRecordingMode(null);
                const previewUrl = URL.createObjectURL(blob);
                setMediaDraft(prev => {
                    if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
                    return {file, mode, previewUrl};
                });
            };

            recorder.start();
        } catch (error) {
            console.error(error);
            setRecordingMode(null);
        }
    }

    function stopRecording() {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
    }

    async function sendDraftMedia() {
        if (!mediaDraft) return;
        await onSendFile(mediaDraft.file);
        URL.revokeObjectURL(mediaDraft.previewUrl);
        setMediaDraft(null);
    }

    function cancelDraftMedia() {
        if (!mediaDraft) return;
        URL.revokeObjectURL(mediaDraft.previewUrl);
        setMediaDraft(null);
    }

    return {
        recordingMode,
        mediaDraft,
        startRecording,
        stopRecording,
        sendDraftMedia,
        cancelDraftMedia,
    };
}
