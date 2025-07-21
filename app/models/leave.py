from sqlalchemy import Column, Integer, Date, Boolean, Enum, ForeignKey, String
from sqlalchemy.orm import relationship
from core.database import Base
import enum

class LeaveType(str, enum.Enum):
    VACATION = 'Vacation'
    SICK = 'Sick'
    OTHER = 'Other'

class Leave(Base):
    __tablename__ = 'leaves'

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    approved = Column(Boolean, default=False)
    reason = Column(String, nullable=True)

    employee = relationship('Employee', back_populates='leaves')