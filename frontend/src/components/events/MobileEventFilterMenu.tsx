import { Checkbox, ListItemText, Menu, MenuItem } from "@mui/material";

interface FilterOption {
  value: string;
  label: string;
}

interface MobileEventFilterMenuProps {
  anchor: HTMLElement | null;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
}

export const MobileEventFilterMenu = ({
  anchor,
  options,
  selectedValues,
  onToggle,
  onClose,
}: MobileEventFilterMenuProps) => (
  <Menu
    anchorEl={anchor}
    open={Boolean(anchor)}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    transformOrigin={{ vertical: "top", horizontal: "left" }}
    slotProps={{
      paper: {
        sx: {
          minWidth: 190,
          mt: 0.75,
          borderRadius: 2.5,
          boxShadow: (theme) => theme.appShadows.menu,
        },
      },
    }}
  >
    {options.map((option) => (
      <MenuItem
        key={option.value}
        onClick={() => onToggle(option.value)}
        dense
      >
        <Checkbox
          checked={selectedValues.includes(option.value)}
          size="small"
          disableRipple
          slotProps={{
            input: { "aria-label": option.label },
          }}
        />
        <ListItemText primary={option.label} />
      </MenuItem>
    ))}
  </Menu>
);
