import api from './axios'

// Fetch all reports (Django will handle pagination)
export const getReports = () => api.get("/reports/"); 

// Fetch a single report by ID
export const getReportDetails = (id) => api.get(`/reports/${id}`);

// Create a new report
export const createReport = (data) => api.post("/reports/", data);
