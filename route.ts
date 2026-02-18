import { NextResponse } from 'next/server';

export async function POST() {
  // Al establecer maxAge en -1, le decimos al navegador que borre la cookie.
  const options = {
    name: 'session',
    value: '',
    maxAge: -1,
    path: '/',
  };

  const response = NextResponse.json({ status: 'success' }, { status: 200 });
  response.cookies.set(options);
  return response;
}