import { NextResponse } from 'next/server';

export async function GET() {
  const data = [
    { day: 'Jul 27', jobs: 4 },
    { day: 'Jul 28', jobs: 7 },
    { day: 'Jul 29', jobs: 3 },
    { day: 'Jul 30', jobs: 9 },
    { day: 'Jul 31', jobs: 5 },
    { day: 'Aug 01', jobs: 11 },
    { day: 'Aug 02', jobs: 6 },
    { day: 'Aug 03', jobs: 8 },
    { day: 'Aug 04', jobs: 2 },
    { day: 'Aug 05', jobs: 13 },
    { day: 'Aug 06', jobs: 7 },
    { day: 'Aug 07', jobs: 10 },
    { day: 'Aug 08', jobs: 4 },
    { day: 'Aug 09', jobs: 8 },
  ];

  return NextResponse.json(data);
}
