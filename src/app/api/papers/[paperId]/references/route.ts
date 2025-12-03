import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { paperId: string } }
) {
  const { paperId } = params;
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit') || '10';

  try {
    const response = await axios.get(`${BASE_URL}/paper/${paperId}/references`, {
      params: {
        limit,
        fields: 'paperId,title,year,authors'
      }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error getting paper references:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to get paper references', details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
