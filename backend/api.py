from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import uvicorn
import json
from agent import HealthcareAgent

app = FastAPI(title="Healthcare AI Agent API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class PatientSearch(BaseModel):
    name: Optional[str] = None
    identifier: Optional[str] = None
    birthdate: Optional[str] = None
    gender: Optional[str] = None

class ApiRequest(BaseModel):
    url: str
    method: str = "GET"
    data: Optional[Dict] = None
    headers: Optional[Dict] = None

class Hl7Message(BaseModel):
    message: str

class FhirData(BaseModel):
    data: Dict[str, Any]

# Dependency
def get_agent():
    # In production, you might want to get these from environment variables
    base_fhir_url = "https://hapi.fhir.org/baseR4"
    api_key = None
    return HealthcareAgent(base_fhir_url, api_key)

@app.get("/")
def read_root():
    return {"message": "Healthcare AI Agent API"}

@app.get("/patient/{patient_id}")
def get_patient(patient_id: str, agent: HealthcareAgent = Depends(get_agent)):
    try:
        return agent.get_patient(patient_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Patient not found: {str(e)}")

@app.post("/patients/search")
def search_patients(search: PatientSearch, agent: HealthcareAgent = Depends(get_agent)):
    params = {k: v for k, v in search.dict().items() if v is not None}
    try:
        return agent.search_patients(params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching patients: {str(e)}")

@app.get("/patient/{patient_id}/observations")
def get_patient_observations(patient_id: str, agent: HealthcareAgent = Depends(get_agent)):
    try:
        return agent.get_patient_observations(patient_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving observations: {str(e)}")

@app.post("/hl7/parse")
def parse_hl7(hl7: Hl7Message, agent: HealthcareAgent = Depends(get_agent)):
    try:
        return agent.parse_hl7_message(hl7.message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing HL7 message: {str(e)}")

@app.post("/fhir-to-hl7")
def convert_fhir_to_hl7(fhir: FhirData, agent: HealthcareAgent = Depends(get_agent)):
    try:
        hl7_message = agent.convert_fhir_to_hl7(fhir.data)
        return {"hl7_message": hl7_message}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error converting FHIR to HL7: {str(e)}")

@app.post("/call-api")
def call_external_api(request: ApiRequest, agent: HealthcareAgent = Depends(get_agent)):
    try:
        return agent.call_external_api(
            request.url, 
            request.method, 
            request.data, 
            request.headers
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling external API: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)