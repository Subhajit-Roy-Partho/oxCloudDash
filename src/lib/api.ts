
import {
  API_BASE_URL_INTERNAL,
  API_BASE_URL_PUBLIC,
  DOWNLOAD_AUTH_TOKEN,
} from './constants';
import type {
  SimulationJobPayload,
  StartJobResponse,
  GetJobStatusResponse,
  GetJobStatusByUserResponse,
  GetEnergyResponse,
  GetResourcesResponse,
  JobStatus,
  ServerResource,
  EnergyData,
} from './types';

async function fetchAPI<T>(
  url: string,
  options: RequestInit = {},
  baseUrl: string = API_BASE_URL_INTERNAL
): Promise<T> {
  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`API Error (${response.status}) on ${url}: ${errorBody}`);
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  
  // Handle cases where response might be text (like UUID from startJob)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return response.text() as unknown as Promise<T>;
}

export const api = {
  startJob: (payload: SimulationJobPayload): Promise<StartJobResponse> => {
    return fetchAPI<StartJobResponse>('/startJob', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  stopJob: (uuid: string): Promise<string> => {
    return fetchAPI<string>(`/stopJob/${uuid}`, { method: 'GET' });
  },

  resumeJob: (uuid: string): Promise<string> => {
    return fetchAPI<string>(`/resumeJob/${uuid}`, { method: 'GET' });
  },

  deleteJob: (uuid: string): Promise<string> => {
    return fetchAPI<string>(`/deleteJob/${uuid}`, { method: 'GET' });
  },

  getJobStatus: (uuid: string): Promise<GetJobStatusResponse> => {
    return fetchAPI<GetJobStatusResponse>(`/getJobStatus/${uuid}`, { method: 'GET' });
  },

  getJobsByUser: async (userId: string): Promise<JobStatus[]> => {
    const response = await fetchAPI<GetJobStatusByUserResponse>(`/getJobStatusByUser/${userId}`, { method: 'GET' });
    // Transform the object response into an array
    return Object.values(response);
  },
  
  getEnergyData: async (uuid: string): Promise<EnergyData> => {
    const response = await fetchAPI<GetEnergyResponse>(`/getEnergy/${uuid}`, { method: 'GET' });
    // Transform GetEnergyResponse into EnergyData format: [[x1,y1], [x2,y2]...]
    // Assuming data[i][0] is x and data[i][1] is y
    const energyValues: EnergyData = [];
    Object.values(response).forEach(innerObj => {
      const keys = Object.keys(innerObj).map(Number).sort((a,b) => a-b);
      if (keys.length >= 2) {
         // Assuming first key is x, second is y for simplicity
        energyValues.push([innerObj[keys[0].toString() as keyof typeof innerObj] as number, innerObj[keys[1].toString() as keyof typeof innerObj] as number]);
      } else if (keys.length === 1 && energyValues.length > 0) {
        // If only one value, assume it's y and x is index
        energyValues.push([energyValues.length, innerObj[keys[0].toString() as keyof typeof innerObj] as number]);
      }
    });
    // Sort by first element (step/time)
    return energyValues.sort((a,b) => a[0] - b[0]);
  },

  getServerResources: async (): Promise<ServerResource[]> => {
    const response = await fetchAPI<GetResourcesResponse>('/getResources', { method: 'GET' });
    // Transform into ServerResource[]
    return Object.entries(response).map(([id, resData], index) => ({
      id: id, 
      name: `Server ${index + 1}`, 
      CPUavail: resData.CPUavail,
      GPUavail: resData.GPUavail,
      TotalRam: resData.totalRAM, // Map from backend's totalRAM
      RAMavail: resData.RAMavail,
      totalCPU: resData.totalCPU, // Include totalCPU
    }));
  },

  downloadFile: async (uuid: string, filename: string): Promise<Blob> => {
    const response = await fetch(
      `${API_BASE_URL_PUBLIC}/download/${uuid}/${filename}`,
      {
        method: 'GET',
        headers: {
          Authorization: DOWNLOAD_AUTH_TOKEN,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Download Error (${response.status}) for ${uuid}/${filename}: ${errorBody}`);
      throw new Error(
        `Download failed: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }
    return response.blob();
  },
};

