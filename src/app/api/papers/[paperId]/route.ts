import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { paperId: string } }
) {
  const { paperId } = params;

  try {
    const response = await axios.get(`${BASE_URL}/paper/${paperId}`, {
      params: {
        fields: 'paperId,title,abstract,year,venue,authors,url,openAccessPdf,citationCount,referenceCount,fieldsOfStudy,publicationTypes'
      }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error getting paper details:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to get paper details', details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
