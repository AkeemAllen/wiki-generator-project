import { Button, Grid, Text, TextInput } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useLocalStorage } from "usehooks-ts";
import { useDeployWiki } from "../apis/wikiApis";
import { isNullEmptyOrUndefined } from "../utils";

function Deployment() {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  const [repoUrl, setRepoUrl] = useInputState<string>("");
  const { mutate, isLoading } = useDeployWiki((data: any) => {
    notifications.show({ message: data.message });
  });

  return (
    <Grid mt={20}>
      <Grid.Col>
        <Text color="red">
          Ensure that a repository with the same name as this wiki{" "}
          <strong>{currentWiki}</strong> exists in your github account before
          proceeding
        </Text>
      </Grid.Col>
      <Grid.Col>
        <TextInput
          label="Repo Url"
          placeholder="Paste repository url: Ex. 'https://github.com/<author>/<wiki_name>.git' or 'git@github.com:<author>/<wiki_name>.git'"
          onChange={setRepoUrl}
        />
      </Grid.Col>
      <Grid.Col>
        <Text>
          This button will push the current wiki into the repo and then deploy
          your wiki to the site url
        </Text>
      </Grid.Col>
      <Grid.Col>
        <Text>
          If process is taking too long, check server terminal to see if github
          credentials need to be entered
        </Text>
      </Grid.Col>
      <Grid.Col>
        <Button
          disabled={isNullEmptyOrUndefined(repoUrl)}
          loading={isLoading}
          onClick={() => mutate({ wiki_name: currentWiki, repo_url: repoUrl })}
        >
          Deploy
        </Button>
      </Grid.Col>
    </Grid>
  );
}

export default Deployment;
