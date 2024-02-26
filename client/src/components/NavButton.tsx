import { Group, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import { ReactNode } from "react";
import classes from "../styles/NavButton.module.css";

type NavButtonProps = {
  color: string;
  text: string;
  icon: ReactNode;
  isActive?: boolean;
};

const NavButton = ({ color, text, icon, isActive = false }: NavButtonProps) => {
  return (
    <UnstyledButton
      classNames={{ root: isActive ? classes.rootActive : classes.root }}
    >
      <Group className={classes.group}>
        <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon>

        <Text size="sm" c="#545454">
          {text}
        </Text>
      </Group>
    </UnstyledButton>
  );
};

export default NavButton;
