import type { ProjectData } from '../types';
import { mockProjects } from '../data/mockData';

// Replace string with your deployed Google Apps Script Web App URL
// Or use an environment variable (e.g., VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || '';

function isValidProject(item: unknown): item is ProjectData {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.projectName === 'string' &&
    typeof obj.customer === 'string' &&
    typeof obj.orderValue === 'number' &&
    typeof obj.progress === 'number' &&
    typeof obj.billing === 'object' && obj.billing !== null
  );
}

export const fetchProjects = async (): Promise<ProjectData[]> => {
  if (!API_URL) {
    console.warn("API_URL is not defined. Falling back to mock data.");
    return mockProjects;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("API response is not an array. Falling back to mock data.");
      return mockProjects;
    }

    const validData = data.filter((item: unknown) => {
      const valid = isValidProject(item);
      if (!valid) console.warn("Skipping invalid project entry:", item);
      return valid;
    });

    return validData;
  } catch (error) {
    console.error("Failed to fetch projects from GAS:", error);
    // Fall back to mock data on error for demonstration purposes
    return mockProjects;
  }
};
