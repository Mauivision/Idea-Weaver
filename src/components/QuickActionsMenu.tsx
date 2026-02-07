import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  ContentCopy as ContentCopyIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import IdeaShareDialog from './IdeaShareDialog.tsx';
import { Idea } from '../models/Idea.tsx';

QuickActionsMenu.propTypes = {
  idea: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleFavorite: PropTypes.func,
  onConnect: PropTypes.func,
  onDuplicate: PropTypes.func,
  onShare: PropTypes.func,
  onArchive: PropTypes.func
};

const QuickActionsMenu = React.memo(({ 
  idea, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  onConnect, 
  onDuplicate, 
  onShare, 
  onArchive 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => () => {
    action();
    handleClose();
  };

  const menuItems = useMemo(() => ([
    onEdit && {
      key: 'edit',
      icon: <EditIcon fontSize="small" />,
      text: 'Edit',
      action: () => onEdit(idea)
    },
    onToggleFavorite && {
      key: 'favorite',
      icon: idea.isFavorite ? <StarIcon fontSize="small" color="primary" /> : <StarBorderIcon fontSize="small" />,
      text: idea.isFavorite ? 'Unfavorite' : 'Favorite',
      action: () => onToggleFavorite(idea.id)
    },
    onConnect && {
      key: 'connect',
      icon: <LinkIcon fontSize="small" />,
      text: 'Connect',
      action: () => onConnect(idea.id)
    },
    onDuplicate && {
      key: 'duplicate',
      icon: <ContentCopyIcon fontSize="small" />,
      text: 'Duplicate',
      action: () => onDuplicate(idea)
    },
    onShare && {
      key: 'share',
      icon: <ShareIcon fontSize="small" />,
      text: 'Share',
      action: () => setShareDialogOpen(true)
    },
    onArchive && {
      key: 'archive',
      icon: <ArchiveIcon fontSize="small" />,
      text: 'Archive',
      action: () => onArchive(idea.id)
    },
    onDelete && {
      key: 'delete',
      icon: <DeleteIcon fontSize="small" color="error" />,
      text: 'Delete',
      action: () => onDelete(idea.id),
      color: 'error.main'
    }
  ].filter(Boolean)), [idea, onEdit, onToggleFavorite, onConnect, onDuplicate, onShare, onArchive, onDelete]);

  return (
    <>
      <Tooltip title="More actions">
        <IconButton
          size="small"
          onClick={handleClick}
          sx={{ ml: 'auto' }}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {menuItems.map((item, index) => (
          <React.Fragment key={item.key}>
            {index > 0 && item.key === 'delete' && <Divider />}
            <MenuItem
              onClick={handleAction(item.action)}
              sx={{ color: item.color || 'inherit' }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText>{item.text}</ListItemText>
            </MenuItem>
          </React.Fragment>
        ))}
      </Menu>

      {onShare && (
        <IdeaShareDialog
          open={shareDialogOpen}
          idea={idea}
          onClose={() => setShareDialogOpen(false)}
        />
      )}
    </>
  );
});

export default QuickActionsMenu;

