/// <reference types="vite/client" />

declare module 'next/server' {
  export class NextResponse extends Response {
    static json<T = any>(body: T, init?: ResponseInit): NextResponse;
  }
}
