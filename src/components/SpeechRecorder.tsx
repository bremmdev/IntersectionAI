"use client";

import React from "react";
import { Mic, StopCircle } from "lucide-react";
import { Button } from "./ui/button";
import { transcribe } from "@/_actions/translate";
import { getWaveBlob } from "@/lib/webmtowav";
import { useTranslation } from "@/context/translation-context";

type RecordingStatus = "idle" | "recording" | "stopped";

const SpeechRecorder = () => {
  const [permission, setPermission] = React.useState<boolean | undefined>(
    undefined
  );

  const [translationState, translationDispatch] = useTranslation();

  const { selectedLanguage, recordingStatus } = translationState;

  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const mediaRecorder = React.useRef<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = React.useState<Array<Blob>>([]);

  //get microphone permission on mount
  React.useEffect(() => {
    getMicrophonePermission();
  }, []);

  async function getMicrophonePermission() {
    if (!("MediaDevices" in window)) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setPermission(true);
      setStream(stream);
    } catch (err) {
      setPermission(false);
    }
  }

  async function startRecording() {
    if (!mediaRecorder || stream === null) return;

    translationDispatch({ type: "RECORDING_START" });

    //create new Media recorder instance using the stream
    const media = new MediaRecorder(stream);
    //set the MediaRecorder instance to the mediaRecorder ref
    mediaRecorder.current = media;
    //invokes the start method to start the recording process
    mediaRecorder.current.start();
    let localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  }

  async function stopRecording() {
    if (!mediaRecorder.current) return;

    translationDispatch({ type: "RECORDING_STOP" });

    //stops the recording instance
    mediaRecorder.current.stop();

    mediaRecorder.current.onstop = async () => {
      //creates a blob file from the audiochunks data
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      //convert the blob to wav blob
      const wavBlob = await getWaveBlob(audioBlob, true);

      //create a file from the wav blob
      const file = new File([wavBlob], "audio.wav", { type: "audio/wav" });

      const formData = new FormData();
      formData.append("audio", file);
      formData.append("language", selectedLanguage);
      const data = await transcribe(formData);

      translationDispatch({ type: "INPUT_CHANGE", payload: data.DisplayText });

      setAudioChunks([]);
    };
  }

  const showPermissionButton =
    permission == false && recordingStatus === "idle";
  const showMicButton =
    permission &&
    recordingStatus !== "recording" &&
    selectedLanguage !== "Detect";
  const showMicStopButton = permission && recordingStatus === "recording";

  return (
    <div className="h-8 my-2 ml-2">
      {permission === undefined && (
        <span className="inline-block animate-spin delay-100 w-5 h-5 ml-2 mt-2 rounded-full border-2 border-slate-300 border-t-slate-600"></span>
      )}
      {showPermissionButton && (
        <Button className="h-9" onClick={getMicrophonePermission}>
          Enable mic
        </Button>
      )}
      {showMicButton && (
        <button
          onClick={startRecording}
          aria-label="record audio from microphone"
        >
          <Mic
            size={32}
            className="stroke-primary-blue cursor-pointer hover:bg-slate-100 rounded-full p-1"
            aria-hidden
          />
        </button>
      )}
      {showMicStopButton && (
        <button onClick={stopRecording} aria-label="stop recording audio">
          <StopCircle
            size={32}
            className="stroke-rose-600 cursor-pointer hover:bg-slate-100 rounded-full p-1"
            aria-hidden
          />
        </button>
      )}
    </div>
  );
};

export default SpeechRecorder;