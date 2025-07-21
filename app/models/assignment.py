from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class Assignment(Base):
    __tablename__ = 'assignments'

    employee_id = Column(Integer, ForeignKey('employees.id'), primary_key=True)
    task_id = Column(Integer, ForeignKey('tasks.id'), primary_key=True)
    assigned_hours = Column(Float, nullable=True)
    role_on_task = Column(String, nullable=True)

    employee = relationship('Employee', back_populates='assignments')
    task = relationship('Task', back_populates='assignments')