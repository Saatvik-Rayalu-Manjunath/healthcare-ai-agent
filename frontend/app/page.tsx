'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Search, Database, FileText, RefreshCw } from 'lucide-react';

// API URL - in production, this would come from environment variables
const API_URL = 'http://localhost:8000';

export default function Home() {
  const [patientId, setPatientId] = useState('');
  const [patientData, setPatientData] = useState<any>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [hl7Message, setHl7Message] = useState('');
  const [parsedHl7, setParsedHl7] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiData, setApiData] = useState('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fetchPatient = async () => {
    if (!patientId) {
      setError('Please enter a patient ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/patient/${patientId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setPatientData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patient data');
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchObservations = async () => {
    if (!patientId) {
      setError('Please enter a patient ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/patient/${patientId}/observations`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setObservations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch observations');
      setObservations([]);
    } finally {
      setLoading(false);
    }
  };

  const parseHl7 = async () => {
    if (!hl7Message) {
      setError('Please enter an HL7 message');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/hl7/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: hl7Message }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setParsedHl7(data);
    } catch (err: any) {
      setError(err.message || 'Failed to parse HL7 message');
      setParsedHl7(null);
    } finally {
      setLoading(false);
    }
  };

  const callApi = async () => {
    if (!apiUrl) {
      setError('Please enter an API URL');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let parsedData = null;
      if (apiData) {
        try {
          parsedData = JSON.parse(apiData);
        } catch (e) {
          throw new Error('Invalid JSON in request data');
        }
      }
      
      const response = await fetch(`${API_URL}/call-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: apiUrl,
          method: apiMethod,
          data: parsedData,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setApiResponse(data);
    } catch (err: any) {
      setError(err.message || 'Failed to call API');
      setApiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async () => {
    if (!searchName) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/patients/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: searchName }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search patients');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Healthcare AI Agent Dashboard</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="patient" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="patient">Patient Data</TabsTrigger>
          <TabsTrigger value="hl7">HL7 Parser</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="api">API Caller</TabsTrigger>
        </TabsList>
        
        <TabsContent value="patient">
          <Card>
            <CardHeader>
              <CardTitle>FHIR Patient Data</CardTitle>
              <CardDescription>
                Retrieve patient information and observations using FHIR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="patientId">Patient ID</Label>
                    <Input 
                      id="patientId" 
                      value={patientId} 
                      onChange={(e) => setPatientId(e.target.value)} 
                      placeholder="Enter patient ID"
                    />
                  </div>
                  <Button onClick={fetchPatient} disabled={loading}>
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Get Patient
                  </Button>
                  <Button onClick={fetchObservations} disabled={loading} variant="outline">
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                    Get Observations
                  </Button>
                </div>
                
                {patientData && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Patient Information</h3>
                    <pre className="bg-slate-100 p-4 rounded-md overflow-auto max-h-80">
                      {JSON.stringify(patientData, null, 2)}
                    </pre>
                  </div>
                )}
                
                {observations && observations.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Observations ({observations.length})</h3>
                    <pre className="bg-slate-100 p-4 rounded-md overflow-auto max-h-80">
                      {JSON.stringify(observations, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hl7">
          <Card>
            <CardHeader>
              <CardTitle>HL7 Message Parser</CardTitle>
              <CardDescription>
                Parse HL7 messages into structured data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="hl7Message">HL7 Message</Label>
                  <Textarea 
                    id="hl7Message" 
                    value={hl7Message} 
                    onChange={(e) => setHl7Message(e.target.value)} 
                    placeholder="Enter HL7 message"
                    className="h-40"
                  />
                </div>
                
                <Button onClick={parseHl7} disabled={loading}>
                  {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Parse Message
                </Button>
                
                {parsedHl7 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Parsed Result</h3>
                    <pre className="bg-slate-100 p-4 rounded-md overflow-auto max-h-80">
                      {JSON.stringify(parsedHl7, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Patient Search</CardTitle>
              <CardDescription>
                Search for patients by name or other criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="searchName">Patient Name</Label>
                    <Input 
                      id="searchName" 
                      value={searchName} 
                      onChange={(e) => setSearchName(e.target.value)} 
                      placeholder="Enter patient name"
                    />
                  </div>
                  <Button onClick={searchPatients} disabled={loading}>
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Search
                  </Button>
                </div>
                
                {searchResults && searchResults.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Search Results ({searchResults.length})</h3>
                    <pre className="bg-slate-100 p-4 rounded-md overflow-auto max-h-80">
                      {JSON.stringify(searchResults, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>External API Caller</CardTitle>
              <CardDescription>
                Call external APIs through the agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <Label htmlFor="apiUrl">API URL</Label>
                    <Input 
                      id="apiUrl" 
                      value={apiUrl} 
                      onChange={(e) => setApiUrl(e.target.value)} 
                      placeholder="https://api.example.com/endpoint"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiMethod">Method</Label>
                    <Select value={apiMethod} onValueChange={setApiMethod}>
                      <SelectTrigger id="apiMethod">
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="apiData">Request Data (JSON)</Label>
                  <Textarea 
                    id="apiData" 
                    value={apiData} 
                    onChange={(e) => setApiData(e.target.value)} 
                    placeholder="Enter JSON data (for POST/PUT requests)"
                    className="h-32"
                  />
                </div>
                
                <Button onClick={callApi} disabled={loading}>
                  {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Call API
                </Button>
                
                {apiResponse && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">API Response</h3>
                    <pre className="bg-slate-100 p-4 rounded-md overflow-auto max-h-80">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}