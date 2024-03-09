import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
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
      <MantineProvider>
        <Notifications position="top-right" />
        <MainAppshell />
      </MantineProvider>
    </>
  );
}

export default App;
