export function ok(data: unknown, status = 200) {
  return Response.json({ data }, { status });
}

export function fail(
  message: string,
  status = 400,
  code?: string
) {
  return Response.json(
    {
      error: {
        message,
        code,
      },
    },
    { status }
  );
}
