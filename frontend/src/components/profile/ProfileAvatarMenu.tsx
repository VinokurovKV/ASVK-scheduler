import { DeleteOutlined, PhotoCameraOutlined } from "@mui/icons-material";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

interface ProfileAvatarMenuProps {
  anchor: HTMLElement | null;
  onClose: () => void;
}

export const ProfileAvatarMenu = ({
  anchor,
  onClose,
}: ProfileAvatarMenuProps) => (
  <Menu
    anchorEl={anchor}
    open={Boolean(anchor)}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    transformOrigin={{ vertical: "top", horizontal: "right" }}
  >
    <MenuItem onClick={onClose}>
      <ListItemIcon>
        <PhotoCameraOutlined fontSize="small" />
      </ListItemIcon>
      <ListItemText>Загрузить фото</ListItemText>
    </MenuItem>
    <MenuItem onClick={onClose}>
      <ListItemIcon>
        <DeleteOutlined fontSize="small" />
      </ListItemIcon>
      <ListItemText>Удалить фото</ListItemText>
    </MenuItem>
  </Menu>
);
