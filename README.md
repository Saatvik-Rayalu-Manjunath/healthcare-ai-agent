# Healthcare AI Agent

A comprehensive AI agent for healthcare data retrieval and processing, with support for FHIR APIs and HL7 standards.

## Features

- **Data Retrieval**: Fetch patient data from FHIR servers
- **Multiple API Integration**: Call various healthcare APIs with a unified interface
- **Healthcare Standards**: Support for both FHIR and HL7 formats
- **Modern Web UI**: User-friendly interface built with Next.js and Tailwind CSS

## Project Structure

\`\`\`
healthcare-ai-agent/
│
├── backend/
│   ├── agent.py           # Core AI agent functionality
│   ├── api.py             # FastAPI backend server
│   └── requirements.txt   # Python dependencies
│
└── frontend/              # Next.js web application
    ├── app/
    ├── components/
    ├── public/
    └── ...
\`\`\`

## Setup Instructions

### Backend

1. Install Python dependencies: