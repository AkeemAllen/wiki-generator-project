import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Backups from "./pages/Backups";
import Deployment from "./pages/Deployment";
import GameRoutes from "./pages/GameRoutes";
import GameRoutesDetails, {
  loader as routeLoader,
} from "./pages/GameRoutesDetails";
import GenerateWiki from "./pages/GenerateWiki";
import Moves from "./pages/Moves";
import Pokemon from "./pages/Pokemon";
import SelectWiki from "./pages/SelectWiki";
import ErrorPage from "./pages/error-page";

const router = createBrowserRouter([
  {
    path: "/select-wiki",
    element: <SelectWiki />,
  },
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "pokemon",
        element: <Pokemon />,
      },
      {
        path: "generate-wiki",
        element: <GenerateWiki />,
      },
      {
        path: "moves",
        element: <Moves />,
      },
      {
        path: "game-routes",
        element: <GameRoutes />,
      },
      {
        path: "backups",
        element: <Backups />,
      },
      {
        path: "deployment",
        element: <Deployment />,
      },
      {
        path: "game-routes/:routeName",
        element: <GameRoutesDetails />,
        loader: routeLoader,
      },
    ],
  },
]);

export { router };
