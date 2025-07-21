# main.py

'''
this file wil help us
    - spin fastAPI servver using Unicorn
    - define reoutes (APIs) to fetch data from db
    -. serve that data in JSON so frontend can use it
'''

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from db import sessionLocal
from models import CrimeEvent

app = FastAPI()

def getDb():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()
        
# ROUTE: GET ALL CRIME EVENTS
app.get("/crimes")

def getCrimes(db: Session = Depends(getDb)):
    crimes = db.query(CrimeEvent).all()
    
    
    # return as list of dictionaries (not ORM objects)
    return [
        {
            "id" : crime.id,
            "offence" : crime.offense,
            "borough" : crime.borough,
            "complaintDate" : crime.complaintDate,
            "latitude" : crime.latidude,
            "longitude" : crime.longitude
        }
        for crime in crimes
    ]
