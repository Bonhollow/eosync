from sqlalchemy import Column, Integer, String, Text, Date, Float
from sqlalchemy.orm import relationship
from core.database import Base

class Project(Base):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    budget_total = Column(Float, nullable=True)

    tasks = relationship('Task', back_populates='project', cascade="all, delete-orphan")