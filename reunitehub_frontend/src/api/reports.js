import api from './axios'

// Fetch all reports (Django will handle pagination)
export const getReports = () => api.get("/reports/"); 

// Fetch a single report by ID
export const getReportDetails = (id) => api.get(`/reports/${id}`);

// Create a new report
export const createReport = (formData) => api.post("/reports/", formData);

export const createSighting = (reportId, formData) => api.post(`/reports/${reportId}/sightings/`, formData)
