/// <reference types="vite/client" />

declare module 'next/server' {
  export class NextResponse extends Response {
    static json<T = any>(body: T, init?: ResponseInit): NextResponse;
  }
}

declare module 'next' {
  export interface NextApiRequest {
    method?: string;
    body: any;
    query: { [key: string]: string | string[] };
    headers: { [key: string]: string | string[] | undefined };
  }
  export interface NextApiResponse<T = any> {
    status(code: number): NextApiResponse<T>;
    json(body: T): void;
    setHeader(name: string, value: string | string[]): this;
    end(): void;
  }
}
