# models.py

'''
we'll define the table schema here using python class, each col has a clas attribute
this table will store each crime event we ingest from the NYC API
    -> offense description
    -> borough
    -> data
    -> time
    -> latitiude / longitude
    -> ...
'''

# Col, Int, etc .. they're all in caps cuz they are classes and not functions or variables
from sqlalchemy import Column, Integer, String, Float, DateTime
from db import base

class CrimeEvent(base) :
    __tablename__ = "crime_events" # table name in db
    
    # columns / parameters
    id = Column(Integer, primary_key=True, index=True)    # unique id for each of the event
    offense = Column(String, index=True)
    borough = Column(String)
    complaintDate = Column(DateTime)
    latitude = Column(Float) 
    longitude = Column(Float)

