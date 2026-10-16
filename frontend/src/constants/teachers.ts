export const formatTeacherShortName = (fullName: string) => {
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

  if (nameParts.length <= 1) {
    return nameParts[0] ?? "";
  }

  const [lastName, ...otherNames] = nameParts;
  const initials = otherNames
    .map((name) => `${name.charAt(0).toUpperCase()}.`)
    .join(" ");

  return `${lastName} ${initials}`;
};
