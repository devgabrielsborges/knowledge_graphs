import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const limit = searchParams.get('limit') || '10';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(`${BASE_URL}/paper/search`, {
      params: {
        query,
        limit,
        fields: 'paperId,title,abstract,year,venue,authors,url,openAccessPdf,citationCount,referenceCount,fieldsOfStudy,publicationTypes'
      }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error searching papers:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to search papers', details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
