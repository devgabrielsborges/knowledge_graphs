import axios from 'axios';
import { Paper, GraphData, GraphNode, GraphLink } from '@/types';

// Use direct API calls for static export (GitHub Pages)
const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

const api = axios.create({
  baseURL: BASE_URL,
});

export const searchPapers = async (query: string, limit = 10): Promise<Paper[]> => {
  try {
    const response = await api.get('/paper/search', {
      params: {
        query,
        limit,
        fields: 'paperId,title,abstract,year,venue,authors,url,openAccessPdf,citationCount,referenceCount,fieldsOfStudy,publicationTypes'
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error searching papers:', error);
    return [];
  }
};

export const getPaperDetails = async (paperId: string): Promise<Paper | null> => {
  try {
    const response = await api.get(`/paper/${paperId}`, {
      params: {
        fields: 'paperId,title,abstract,year,venue,authors,url,openAccessPdf,citationCount,referenceCount,fieldsOfStudy,publicationTypes'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting paper details:', error);
    return null;
  }
};

export const getPaperConnections = async (paperId: string, limit = 10) => {
  try {
    const [citationsRes, referencesRes] = await Promise.all([
      api.get(`/paper/${paperId}/citations`, {
        params: { limit, fields: 'paperId,title,year,authors' }
      }),
      api.get(`/paper/${paperId}/references`, {
        params: { limit, fields: 'paperId,title,year,authors' }
      })
    ]);

    return {
      citations: citationsRes.data.data || [],
      references: referencesRes.data.data || []
    };
  } catch (error) {
    console.error('Error getting paper connections:', error);
    return { citations: [], references: [] };
  }
};
