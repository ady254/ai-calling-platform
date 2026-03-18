from pydantic import BaseModel


class BusinessCreate(BaseModel):
    name: str
    industry: str
    default_language: str