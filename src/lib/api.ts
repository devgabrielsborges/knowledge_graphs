import axios from 'axios';
import { Paper, GraphData, GraphNode, GraphLink } from '@/types';

const api = axios.create({
  baseURL: '/api',
});

export const searchPapers = async (query: string, limit = 10): Promise<Paper[]> => {
  try {
    const response = await api.get('/papers/search', {
      params: {
        query,
        limit,
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
    const response = await api.get(`/papers/${paperId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting paper details:', error);
    return null;
  }
};

export const getPaperConnections = async (paperId: string, limit = 10) => {
  try {
    const [citationsRes, referencesRes] = await Promise.all([
      api.get(`/papers/${paperId}/citations`, {
        params: { limit }
      }),
      api.get(`/papers/${paperId}/references`, {
        params: { limit }
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
