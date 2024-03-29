import {
  Button,
  Grid,
  Modal,
  NativeSelect,
  Select,
  SimpleGrid,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconInfoCircle } from "@tabler/icons-react";
import { useLocalStorage } from "usehooks-ts";
import { useCreateWiki } from "../apis/wikiApis";
import { useUpdateEffect } from "../hooks/useUpdateEffect";
import { PokemonVersions, Wikis } from "../types";

type NewWikiModalProps = {
  opened: boolean;
  onClose: () => void;
};

const NewWikiModal = ({ opened, onClose }: NewWikiModalProps) => {
  const [wikiName, setWikiName] = useInputState<string>("");
  const [wikiDescription, setWikiDescription] = useInputState<string>("");
  const [wikiAuthor, setWikiAuthor] = useInputState<string>("");
  const [deploymentUrl, setDeploymentUrl] = useInputState<string>("");
  const [matchupGeneration, setMatchupGeneration] = useInputState<
    "current" | "gen1" | "gen2"
  >("current");

  const [repoUrl, setRepoUrl] = useInputState<string>(
    "https://github.com/__author__/__name__"
  );
  const [siteUrl, setSiteUrl] = useInputState<string>(
    "https://__author__.github.io/__name__"
  );
  const [_, setWikiList] = useLocalStorage<Wikis>("wikiList", {});
  const [versionGroup, setVersionGroup] = useInputState<string>("red-blue");

  const { mutate } = useCreateWiki((data: any) => {
    notifications.show({ message: data.message });
    setWikiList(data.wikis);
  });
  const createNewWiki = () => {
    mutate({
      name: wikiName.toLowerCase().replaceAll(" ", "-"),
      description: wikiDescription,
      author: wikiAuthor,
      repo_url: repoUrl,
      site_url: siteUrl,
      site_name: wikiName,
      settings: {
        version_group: versionGroup,
        deployment_url: deploymentUrl,
        matchup_generation: matchupGeneration,
      },
    });
    onClose();
  };

  useUpdateEffect(() => {
    let codeName = wikiName.toLowerCase().replaceAll(" ", "-");
    setRepoUrl(`https://github.com/${wikiAuthor}/${codeName}`);
    setSiteUrl(`https://${wikiAuthor}.github.io/${codeName}`);
  }, [wikiAuthor, wikiName]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="New Wiki"
      withCloseButton={false}
    >
      <SimpleGrid cols={1} verticalSpacing={20}>
        <TextInput
          label="Wiki Name"
          placeholder="Enter wiki name"
          value={wikiName}
          onChange={setWikiName}
        />
        <TextInput
          label="Code Name"
          readOnly
          disabled
          value={wikiName.toLowerCase().replaceAll(" ", "-")}
        />
        <Textarea
          label="Wiki Description"
          placeholder="Enter wiki description"
          value={wikiDescription}
          onChange={setWikiDescription}
        />
        <TextInput
          label={
            <Grid>
              <Grid.Col span={10}>
                <Text>Wiki Author</Text>
              </Grid.Col>
              <Grid.Col span={1} mt={"1.5px"}>
                <Tooltip label="Use your github user name">
                  <IconInfoCircle size={"1rem"} stroke={1} />
                </Tooltip>
              </Grid.Col>
            </Grid>
          }
          placeholder="Recommended: Your Github Username"
          value={wikiAuthor}
          onChange={setWikiAuthor}
        />
        <TextInput
          label="Deployment Url"
          placeholder="Can be left blank for now"
          value={deploymentUrl}
          onChange={setDeploymentUrl}
        />
        <NativeSelect
          label="Matchup Generation"
          value={matchupGeneration}
          onChange={setMatchupGeneration}
          data={["current", "gen1", "gen2"]}
        />
        <TextInput label="Repo Url" readOnly disabled value={repoUrl} />
        <TextInput
          label="Site Url"
          readOnly
          disabled
          value={siteUrl.toLowerCase()}
        />
        <Select
          label="Version Group"
          onChange={setVersionGroup}
          value={versionGroup}
          data={(
            Object.keys(PokemonVersions) as (keyof typeof PokemonVersions)[]
          ).map((key, index) => {
            return PokemonVersions[key];
          })}
        />
      </SimpleGrid>
      <Button mt={20} onClick={createNewWiki}>
        Create Wiki
      </Button>
    </Modal>
  );
};

export default NewWikiModal;
