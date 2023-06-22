import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "usehooks-ts";
import "./App.css";
import MainAppshell from "./components/MainAppshell";

function App() {
  const [currentWiki, setCurrentWiki] = useLocalStorage("currentWiki", "none");
  const navigate = useNavigate();

  useEffect(() => {
    if (currentWiki === "none") {
      navigate("/select-wiki");
    }
  }, []);

  return (
    <>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Notifications position="top-right" />
        {currentWiki !== "none" && <MainAppshell />}
      </MantineProvider>
    </>
  );
}

export default App;
