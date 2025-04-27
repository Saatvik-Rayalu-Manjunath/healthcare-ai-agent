import requests
import json
from typing import Dict, List, Any, Optional
import os

class HealthcareAgent:
    """
    An AI agent for healthcare data retrieval and processing.
    Supports FHIR and HL7 standards and can call multiple APIs.
    """
    
    def __init__(self, base_fhir_url: str = None, api_key: str = None):
        self.base_fhir_url = base_fhir_url or "https://hapi.fhir.org/baseR4"  # Default to public FHIR server
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/fhir+json",
            "Accept": "application/fhir+json"
        }
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"
    
    def get_patient(self, patient_id: str) -> Dict:
        """Retrieve patient information using FHIR API"""
        endpoint = f"{self.base_fhir_url}/Patient/{patient_id}"
        response = requests.get(endpoint, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def search_patients(self, params: Dict) -> List[Dict]:
        """Search for patients matching criteria"""
        endpoint = f"{self.base_fhir_url}/Patient"
        response = requests.get(endpoint, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json().get("entry", [])
    
    def get_patient_observations(self, patient_id: str) -> List[Dict]:
        """Get clinical observations for a patient"""
        endpoint = f"{self.base_fhir_url}/Observation"
        params = {"patient": patient_id}
        response = requests.get(endpoint, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json().get("entry", [])
    
    def parse_hl7_message(self, hl7_message: str) -> Dict:
        """
        Parse an HL7 message and convert to structured data
        This is a simplified implementation - production code would use a proper HL7 parser
        """
        # Simple parsing logic for demonstration
        segments = hl7_message.split("\r")
        result = {}
        
        for segment in segments:
            if not segment:
                continue
                
            fields = segment.split("|")
            segment_type = fields[0]
            
            if segment_type == "PID":  # Patient identification
                if len(fields) > 5:
                    result["patient_id"] = fields[3]
                    name_parts = fields[5].split("^") if len(fields) > 5 else []
                    if len(name_parts) >= 2:
                        result["last_name"] = name_parts[0]
                        result["first_name"] = name_parts[1]
            
            elif segment_type == "OBX":  # Observation
                if len(fields) > 5:
                    if "observations" not in result:
                        result["observations"] = []
                    result["observations"].append({
                        "id": fields[3],
                        "value": fields[5],
                        "units": fields[6] if len(fields) > 6 else None
                    })
                    
        return result
    
    def convert_fhir_to_hl7(self, fhir_data: Dict) -> str:
        """
        Convert FHIR data to HL7 format (simplified)
        """
        # This is a very simplified conversion for demonstration
        hl7_message = []
        
        # Message header
        hl7_message.append("MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|20230615120000||ADT^A01|MSG00001|P|2.5")
        
        # Patient data
        if "name" in fhir_data and fhir_data["name"]:
            name = fhir_data["name"][0]
            family = name.get("family", "")
            given = name.get("given", [""])[0] if "given" in name and name["given"] else ""
            
            patient_id = fhir_data.get("id", "")
            gender = fhir_data.get("gender", "")
            birth_date = fhir_data.get("birthDate", "")
            
            hl7_message.append(f"PID|||{patient_id}||{family}^{given}||{birth_date}|{gender}")
        
        return "\r".join(hl7_message)
    
    def call_external_api(self, url: str, method: str = "GET", data: Optional[Dict] = None, 
                         headers: Optional[Dict] = None) -> Dict:
        """Generic method to call external APIs"""
        request_headers = headers or {}
        
        if method.upper() == "GET":
            response = requests.get(url, headers=request_headers)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=request_headers)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=request_headers)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=request_headers)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
            
        response.raise_for_status()
        return response.json() if response.content else {}

# Example usage
if __name__ == "__main__":
    # Initialize the agent
    agent = HealthcareAgent()
    
    # Example: Get patient data
    try:
        # Using a sample patient ID from the public HAPI FHIR server
        patient = agent.get_patient("example")
        print("Patient data:")
        print(json.dumps(patient, indent=2))
        
        # Example HL7 message parsing
        hl7_message = """MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|20230615120000||ADT^A01|MSG00001|P|2.5
PID|||12345||Smith^John||19800101|M
OBX||NM|8302-2^Height^LN||180|cm
OBX||NM|8462-4^BP Diastolic^LN||80|mm[Hg]
OBX||NM|8480-6^BP Systolic^LN||120|mm[Hg]"""
        
        parsed_hl7 = agent.parse_hl7_message(hl7_message)
        print("\nParsed HL7 message:")
        print(json.dumps(parsed_hl7, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")