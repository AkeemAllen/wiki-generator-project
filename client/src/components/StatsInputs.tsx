import { NumberInput, SimpleGrid, Title } from "@mantine/core";
import { Stats } from "../types";

type StatsInputProps = {
  stats: Stats;
  setStats: any;
};

const StatsInputs = ({ stats, setStats }: StatsInputProps) => {
  const handleStatsChange = (value: number, stat: string) => {
    setStats({ ...stats, [stat]: value });
  };

  return (
    <>
      <Title order={2} mt="50px">
        Stats
      </Title>
      <SimpleGrid cols={2}>
        <NumberInput
          label="HP"
          value={stats.hp}
          onChange={(e: number) => handleStatsChange(e, "hp")}
        />
        <NumberInput
          label="Attack"
          value={stats.attack}
          onChange={(e: number) => handleStatsChange(e, "attack")}
        />
        <NumberInput
          label="Defense"
          value={stats.defense}
          onChange={(e: number) => handleStatsChange(e, "defense")}
        />
        <NumberInput
          label="Special Attack"
          value={stats.sp_attack}
          onChange={(e: number) => handleStatsChange(e, "sp_attack")}
        />
        <NumberInput
          label="Special Defense"
          value={stats.sp_defense}
          onChange={(e: number) => handleStatsChange(e, "sp_defense")}
        />
        <NumberInput
          label="Speed"
          value={stats.speed}
          onChange={(e: number) => handleStatsChange(e, "speed")}
        />
      </SimpleGrid>
    </>
  );
};

export default StatsInputs;
