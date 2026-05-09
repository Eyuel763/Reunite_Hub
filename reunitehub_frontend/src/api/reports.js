import api from './axios'

// Fetching all reports (when params is empty)
// Fetching filtered reports (when params contains gender, location, etc.)
export const getReports = (params) => api.get("/reports/", { params });

// Fetch a single report by ID
export const getReportDetails = (id) => api.get(`/reports/${id}`);

// Create a new report
export const createReport = (formData) => api.post("/reports/", formData);

export const createSighting = (reportId, formData) => api.post(`/reports/${reportId}/sightings/`, formData)
