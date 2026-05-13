import api from './axios'

// Fetching all reports (when params is empty)
// Fetching filtered reports (when params contains gender, location, etc.)
export const getReports = (params) => api.get("/reports/", { params });

// Fetch a single report by ID
export const getReportDetails = (id) => api.get(`/reports/${id}`);

// Create a new report
export const createReport = (formData) => api.post("/reports/", formData);

// Create a new sighting for a specific report
export const createSighting = (reportId, formData) => api.post(`/reports/${reportId}/sightings`, formData)

// Fetch sightings for a specific report
export const getSightings = (reportId) => api.get(`/reports/${reportId}/sightings`);

// Fetch tips for a specific report
export const getTips = (reportId) => api.get(`/reports/${reportId}/tips/`);

// Create a new tip for a specific report
export const createTip = (reportId, tipData) => 
    api.post(`/reports/${reportId}/tips`, tipData);
