export const getProfileFieldStyles = (isEditing: boolean) => ({
  "& .MuiOutlinedInput-root": {
    bgcolor: isEditing ? "background.paper" : "app.background.field",
    transition: "background-color 0.2s ease, border-color 0.2s ease",
    "& fieldset": {
      borderColor: isEditing ? "app.border.field" : "transparent",
    },
    "&:hover fieldset": {
      borderColor: isEditing ? "app.border.field" : "transparent",
    },
    "&.Mui-focused fieldset": { borderColor: "app.brand.accent" },
    "&.Mui-error": {
      "& fieldset": { borderColor: "error.main" },
      "&:hover fieldset": { borderColor: "error.main" },
      "&.Mui-focused fieldset": { borderColor: "error.main" },
    },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "app.brand.accent" },
  "& .MuiInputLabel-root.Mui-error": { color: "error.main" },
  "& .MuiInputBase-input": { cursor: isEditing ? "text" : "default" },
});
