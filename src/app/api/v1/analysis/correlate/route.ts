import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { case_id, type = 'combined' } = await request.json();
    if (!case_id) {
      return NextResponse.json({ error: 'case_id required' }, { status: 400 });
    }

    const jobId = `job-${Date.now()}`;
    const job = {
      id: jobId,
      case_id,
      type,
      status: 'queued',
      model_version: 'v2.4.1-timing-fingerprint',
      created_by: 'SA Reyes, Marcus',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, jobId, job }, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
