from fastapi import APIRouter, Header, Query
from fastapi.responses import StreamingResponse

from backend.app.events import event_broker


router = APIRouter(
    prefix="/events",
    tags=["events"],
)


@router.get("/stream")
def stream_events(
    replay: int = Query(default=30, ge=0, le=250),
    last_event_id: str | None = Header(default=None, alias="Last-Event-ID"),
):
    cursor = None
    if last_event_id:
        try:
            cursor = int(last_event_id)
        except ValueError:
            cursor = None

    return StreamingResponse(
        event_broker.stream(cursor, replay),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
