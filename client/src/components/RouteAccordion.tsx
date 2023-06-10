import { Accordion, createStyles, rem } from "@mantine/core";
import { ReactNode, useState } from "react";

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    borderRadius: theme.radius.sm,
  },
  item: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    border: `${rem(1)} solid transparent`,
    position: "relative",
    zIndex: 0,
    transition: "transform 150ms ease",

    "&[data-active]": {
      transform: "scale(1.03)",
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      boxShadow: theme.shadows.md,
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2],
      borderRadius: theme.radius.md,
      zIndex: 1,
    },
  },
  box: {
    borderRadius: 4,
    color: theme.colors.blue[7],
    backgroundColor: theme.colors.blue[0],
    marginTop: 5,
    ":hover": {
      cursor: "pointer",
      backgroundColor: theme.colors.blue[1],
      transform: "scale(1.03)",
      transition: "background-color 0.2s ease",
    },
    transition: "background-color 0.2s ease",
  },
}));

type RouteAccordionProps = {
  routeName: string;
  children: ReactNode;
};

const RouteAccordion = ({ routeName, children }: RouteAccordionProps) => {
  const { classes } = useStyles();
  const [isContentEditable, setisContentEditable] = useState(false);
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      setisContentEditable(false);
    }
  };
  return (
    <Accordion
      maw={420}
      mx="auto"
      variant="filled"
      classNames={classes}
      className={classes.root}
    >
      <Accordion.Item
        value={routeName}
        onDoubleClick={() => setisContentEditable(true)}
        onKeyDown={handleKeyDown}
        contentEditable={isContentEditable}
      >
        <Accordion.Control>{routeName}</Accordion.Control>
        <Accordion.Panel>{children}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default RouteAccordion;
