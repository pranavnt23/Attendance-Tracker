from pydantic import BaseModel
from typing import List, Dict, Any


class AttendanceReportRequest(BaseModel):
    class_id: str
    start_date: str
    end_date: str


class AttendanceReportResponse(BaseModel):
    report_data: List[Dict[str, Any]]
