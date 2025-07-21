from sqlalchemy import Column, Integer, String, Text, Date, Float, Enum, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base
import enum

class TaskStatus(str, enum.Enum):
    TODO = 'To Do'
    IN_PROGRESS = 'In Progress'
    DONE = 'Done'

class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    estimated_hours = Column(Float, nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO)

    project = relationship('Project', back_populates='tasks')
    assignments = relationship('Assignment', back_populates='task')