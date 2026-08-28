"use client";

import { useEffect, useRef, useState } from "react";
import { CircleDot, TerminalSquare } from "lucide-react";
import { getEventStreamUrl } from "@/lib/api";
import type { SOCEvent } from "@/lib/types";

type StreamStatus = "connecting" | "live" | "reconnecting";

function formatEventTime(timestamp: string) {
  const time = timestamp.split("T")[1];
  return time ? time.slice(0, 8) : "--:--:--";
}

export function SOCConsole() {
  const [events, setEvents] = useState<SOCEvent[]>([]);
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stream = new EventSource(getEventStreamUrl());

    stream.onopen = () => setStatus("live");
    stream.onerror = () => setStatus("reconnecting");

    const handleTelemetry = (event: MessageEvent<string>) => {
      const telemetry = JSON.parse(event.data) as SOCEvent;
      setEvents((current) => {
        if (current.some((item) => item.id === telemetry.id)) {
          return current;
        }
        return [...current, telemetry].slice(-80);
      });
    };

    stream.addEventListener("telemetry", handleTelemetry as EventListener);

    return () => {
      stream.removeEventListener("telemetry", handleTelemetry as EventListener);
      stream.close();
    };
  }, []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <section className="soc-console" aria-label="Live SOC terminal telemetry">
      <header className="soc-console-header">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-3.5 w-3.5" />
          <span>SENTRA://SOC-LIVE</span>
        </div>
        <div className="flex items-center gap-2" data-stream-status={status}>
          <CircleDot className="h-3 w-3" />
          {status.toUpperCase()}
        </div>
      </header>
      <div className="soc-console-body" ref={bodyRef}>
        {events.length ? (
          events.map((event) => (
            <div className="soc-console-line" key={event.id}>
              <span className="soc-console-time">{formatEventTime(event.timestamp)}</span>
              <strong data-source={event.source} data-level={event.level}>
                {event.source}
              </strong>
              <span>{event.message}</span>
            </div>
          ))
        ) : (
          <div className="soc-console-empty">
            Connected to backend telemetry. Launch an attack to stream pipeline events.
          </div>
        )}
        <div className="soc-console-prompt">
          <span>operator@sentra:~$</span>
          <i aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
