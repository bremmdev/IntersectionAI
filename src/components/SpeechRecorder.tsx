"use client";

import React from "react";
import { Mic, MicOff, StopCircle } from "lucide-react";
import { Button } from "./ui/button";
import { transcribe } from "@/_actions/translate";
import { getWaveBlob } from "@/lib/webmtowav";
import { useTranslation } from "@/context/translation-context";
import { toast } from "sonner";
import { useMounted } from "@/hooks/useMounted";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearchParams } from "next/navigation";
import { codeToLanguageName, sanitizeLanguage } from "@/lib/utils";

const TOTAL_RECORDING_TIME = 30;

const SpeechRecorder = () => {
  const [permission, setPermission] = React.useState<boolean | undefined>(
    undefined
  );

  const [translationState, translationDispatch] = useTranslation();

  const mounted = useMounted();

  const searchParams = useSearchParams();

  const selectedLanguage = sanitizeLanguage(searchParams.get("from"));

  const { recordingStatus } = translationState;

  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const mediaRecorder = React.useRef<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = React.useState<Array<Blob>>([]);
  const [timeRemaining, setTimeRemaining] =
    React.useState<number>(TOTAL_RECORDING_TIME);
  const timerRef = React.useRef<number | null>(null);

  const getMicrophonePermission = React.useCallback(async () => {
    if (!mounted) return;
    if (!("MediaDevices" in window)) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setPermission(true);
      setStream(stream);
      toast.success("Microphone enabled");
    } catch (err) {
      setPermission(false);
      toast.warning(
        "Microphone permission denied. Please enable it in settings and press the button again."
      );
    }
  }, [mounted, setPermission]);

  async function startRecording() {
    if (!mediaRecorder || stream === null) return;

    //handle the case where the user disables the microphone permission in settings after first enabling it
    const permissionName = "microphone" as PermissionName;
    const micPermission = await navigator.permissions.query({
      name: permissionName,
    });
    if (micPermission.state === "denied") {
      setPermission(false);
      toast.warning(
        "Microphone permission denied. Please enable it in settings."
      );

      return;
    }

    translationDispatch({ type: "RECORDING_START" });

    timerRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

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

  const stopRecording = React.useCallback(async () => {
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
      try {
        const data = await transcribe(formData);

        if (typeof data !== "object" || data?.RecognitionStatus !== "Success")
          return toast.error("Error transcribing audio");

        translationDispatch({
          type: "INPUT_CHANGE",
          payload: data.DisplayText,
        });
      } catch (err) {
        translationDispatch({ type: "RECORDING_RESET" });
        toast.error("Error transcribing audio");
      } finally {
        setAudioChunks([]);
        clearInterval(timerRef.current as number);
        setTimeRemaining(TOTAL_RECORDING_TIME);
        translationDispatch({ type: "RECORDING_RESET" });
      }
    };
  }, [audioChunks, selectedLanguage, translationDispatch]);

  //get microphone permission on mount
  React.useEffect(() => {
    getMicrophonePermission();
  }, [getMicrophonePermission]);

  React.useEffect(() => {
    if (timeRemaining === 0) {
      stopRecording();
    }
  }, [timeRemaining, stopRecording]);

  const showPermissionButton =
    permission == false && recordingStatus === "idle";
  const showMicButton =
    permission &&
    recordingStatus !== "recording" &&
    selectedLanguage !== "auto" &&
    recordingStatus === "idle";
  const showMicOff =
    permission && recordingStatus === "idle" && selectedLanguage === "auto";
  const isRecording = permission && recordingStatus === "recording";

  return (
    <div className="h-12 -mt-3 flex items-center rounded-lg">
      {showMicOff && (
        <Tooltip>
          <TooltipTrigger asChild>
            <MicOff size={24} className="stroke-slate-400 ml-1" aria-hidden />
          </TooltipTrigger>
          <TooltipContent>
            <p>Select a language to enable voice translation</p>
          </TooltipContent>
        </Tooltip>
      )}
      {permission === undefined && (
        <span className="inline-block ml-1 animate-spin delay-100 w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-600"></span>
      )}
      {showPermissionButton && (
        <Button
          className="h-9"
          variant="outline"
          onClick={getMicrophonePermission}
        >
          Enable mic
        </Button>
      )}
      {showMicButton && (
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Start recording voice</p>
          </TooltipContent>
        </Tooltip>
      )}
      {isRecording && (
        <div className="flex gap-2 items-center">
          <button onClick={stopRecording} aria-label="stop recording audio">
            <StopCircle
              size={32}
              className="stroke-rose-600 cursor-pointer hover:bg-slate-100 rounded-full p-1"
              aria-hidden
            />
          </button>
          <span>00 : {timeRemaining.toString().padStart(2, "0")}</span>
        </div>
      )}
    </div>
  );
};

export default SpeechRecorder;
