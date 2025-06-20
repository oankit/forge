import { Home } from "src/home";
import { ErrorPage, GeneratePage } from "src/pages";

export enum Paths {
  HOME = "/",

}

export const routes = [
  {
    path: Paths.HOME,
    element: <Home />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <GeneratePage />,
      },
  
      // @TODO: Add additional pages and routes as needed.
    ],
  },
];
