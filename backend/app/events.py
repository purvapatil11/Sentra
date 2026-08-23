from collections import deque
from datetime import datetime, timezone
import json
from threading import Condition
from typing import Any, Iterator


class EventBroker:
    def __init__(self, history_size: int = 250):
        self._condition = Condition()
        self._events: deque[dict[str, Any]] = deque(maxlen=history_size)
        self._next_id = 1

    def publish(
        self,
        source: str,
        message: str,
        *,
        level: str = "info",
        run_id: str | None = None,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        with self._condition:
            event = {
                "id": self._next_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "source": source,
                "level": level,
                "message": message,
                "run_id": run_id,
                "data": data or {},
            }
            self._next_id += 1
            self._events.append(event)
            self._condition.notify_all()
            return event

    def stream(self, last_event_id: int | None, replay: int) -> Iterator[str]:
        with self._condition:
            if last_event_id is not None:
                cursor = last_event_id
            elif self._events:
                cursor = max(0, self._events[-1]["id"] - replay)
            else:
                cursor = 0

        while True:
            with self._condition:
                pending = [event for event in self._events if event["id"] > cursor]
                if not pending:
                    self._condition.wait(timeout=15)
                    pending = [event for event in self._events if event["id"] > cursor]

            if not pending:
                yield ": heartbeat\n\n"
                continue

            for event in pending:
                cursor = event["id"]
                yield (
                    f"id: {event['id']}\n"
                    "event: telemetry\n"
                    f"data: {json.dumps(event, separators=(',', ':'))}\n\n"
                )


event_broker = EventBroker()


def publish_event(
    source: str,
    message: str,
    *,
    level: str = "info",
    run_id: str | None = None,
    data: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return event_broker.publish(
        source,
        message,
        level=level,
        run_id=run_id,
        data=data,
    )
