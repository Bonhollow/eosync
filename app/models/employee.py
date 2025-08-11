from sqlalchemy import Column, Integer, String, Date, Float
from sqlalchemy.orm import relationship
from core.database import Base

class Employee(Base):
    __tablename__ = 'employees'

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=False)
    birth_date = Column(Date, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, nullable=True)
    hire_date = Column(Date, nullable=True)
    role = Column(String, nullable=False)
    department = Column(String, nullable=True)
    salary = Column(Float, nullable=True)

    skills = relationship('Skill', secondary='employee_skills', back_populates='employees')
    assignments = relationship('Assignment', back_populates='employee')
    leaves = relationship('Leave', back_populates='employee')
