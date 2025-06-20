declare module "*.css" {
  const styles: { [className: string]: string };
  export = styles;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: React.FunctionComponent<{
    size?: "tiny" | "small" | "medium" | "large";
    className?: string;
  }>;
  export default content;
}

declare const BACKEND_HOST: string;

// Next.js API types
declare module 'next' {
  export interface NextApiRequest {
    method?: string;
    body: any;
    query: { [key: string]: string | string[] };
    cookies: { [key: string]: string };
    headers: { [key: string]: string | string[] | undefined };
  }

  export interface NextApiResponse<T = any> {
    status(statusCode: number): NextApiResponse<T>;
    json(body: T): void;
    send(body: any): void;
    end(): void;
    setHeader(name: string, value: string | string[]): NextApiResponse<T>;
    getHeader(name: string): string | string[] | undefined;
  }
}
