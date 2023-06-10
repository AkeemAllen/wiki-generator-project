export const isNullEmptyOrUndefined = (value: any) => {
  return value === null || value === "" || value === undefined;
};

export const capitalize = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};
