

import {
  API_BASE_URL_INTERNAL,
  API_BASE_URL_PUBLIC,
  DOWNLOAD_AUTH_TOKEN,
} from './constants';
import type {
  SimulationJobPayload,
  EnhancedSamplingPayload,
  AnalysisJobPayload,
  StartJobResponse,
  GetJobStatusResponse,
  GetJobStatusByUserResponse,
  GetEnergyResponse,
  GetResourcesResponse,
  GetFileListResponse,
  JobStatus,
  ServerResource,
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
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return response.text() as unknown as Promise<T>;
}

export const api = {
  startJob: (payload: SimulationJobPayload): Promise<StartJobResponse> => {
    const formData = new FormData();

    // Convert payload to FormData, handling files and other data types
    (Object.keys(payload) as Array<keyof SimulationJobPayload>).forEach((key) => {
      const value = payload[key];

      if (key === 'simulationType') {
        // Convert simulationType to the 'MD' boolean flag the backend expects
        formData.append('MD', String(value === 'MD'));
      } else if (value instanceof File) {
        // Append file data
        formData.append(key, value, value.name);
      } else if (value !== undefined && value !== null) {
        // Append other fields as strings
        formData.append(key, String(value));
      }
    });
    
    // The browser will set the 'Content-Type: multipart/form-data' header automatically
    return fetch(`${API_BASE_URL_INTERNAL}/startJobMultipart`, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error (${response.status}) on /startJobMultipart: ${errorBody}`);
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        return response.text() as unknown as Promise<StartJobResponse>;
    });
  },

  runEnhancedSamplingJob: (payload: EnhancedSamplingPayload): Promise<StartJobResponse> => {
    const formData = new FormData();

    // Convert payload to FormData
    (Object.keys(payload) as Array<keyof EnhancedSamplingPayload>).forEach((key) => {
      const value = payload[key];
      // Skip the samplingType as the backend doesn't seem to use it directly
      if (key === 'samplingType') return;
      
      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return fetch(`${API_BASE_URL_INTERNAL}/runOxdnaUmbrella`, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error (${response.status}) on /runOxdnaUmbrella: ${errorBody}`);
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        return response.text() as unknown as Promise<StartJobResponse>;
    });
  },
  
  startAnalysisJob: (payload: AnalysisJobPayload): Promise<StartJobResponse> => {
    const formData = new FormData();
     (Object.keys(payload) as Array<keyof AnalysisJobPayload>).forEach((key) => {
      const value = payload[key];
       if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
     });
    
     return fetch(`${API_BASE_URL_INTERNAL}/startAnalysisMultipart`, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error (${response.status}) on /startAnalysisMultipart: ${errorBody}`);
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        return response.text() as unknown as Promise<StartJobResponse>;
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
  
  getEnergyData: async (uuid: string): Promise<GetEnergyResponse> => {
    return fetchAPI<GetEnergyResponse>(`/energy/${uuid}/0/3`, { method: 'GET' });
  },

  getServerResources: async (): Promise<ServerResource[]> => {
    const response = await fetchAPI<GetResourcesResponse>('/getResources', { method: 'GET' });
    return Object.entries(response).map(([id, resData], index) => ({
      id: id, 
      name: `Server ${index + 1}`, 
      CPUavail: resData.CPUavail,
      GPUavail: resData.GPUavail,
      TotalRam: resData.totalRAM,
      RAMavail: resData.RAMavail,
      totalCPU: resData.totalCPU,
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

  downloadAllFiles: async (uuid: string): Promise<Blob> => {
     const response = await fetch(
      `${API_BASE_URL_INTERNAL}/downloadAll/${uuid}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Download All Error (${response.status}) for ${uuid}: ${errorBody}`);
      throw new Error(
        `Download all failed: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }
    return response.blob();
  },

  listJobFiles: async (uuid: string): Promise<string[]> => {
    const response = await fetchAPI<GetFileListResponse>(`/list/${uuid}`, { method: 'GET' });
    return Object.values(response).sort();
  },

  getJobFileContent: async (uuid: string, filename: string): Promise<string> => {
    const blob = await api.downloadFile(uuid, filename);
    return blob.text();
  }
};
