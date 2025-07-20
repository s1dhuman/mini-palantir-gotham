#db.py


'''
# Setting up the db connection to our SQLite database using SQLAlchemy 
# (a Python ORM => Object Relational Mapper).

This file will:
    -Connect to the database
    -Define a session (how our app will talk to the DB)
    -Create a Base class for defining tables (in models.py later)
'''

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./gotham.db"


# creating engine --> this is the code DB connection object
#'check_same_thread=False' is required to work with fastapi
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread", False})

# create session maker
# so everytime we want to interact with the db, we'll use this session
sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

base = declarative_base() # base class to define all the db tables using python classes --> we'll use this in models.py to define out our tables 