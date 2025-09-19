import React, { useState, useEffect } from 'react';
import { 
  getMessages, 
  createMessage, 
  updateMessage, 
  deleteMessage
} from '../API/messages';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Message as MessageIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Simple date formatting function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Types
interface Message {
  id: string;
  title: string;
  content: string;
  audience: 'drivers' | 'businesses';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  created_by: string;
  read_count?: number;
  total_recipients?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`messages-tabpanel-${index}`}
      aria-labelledby={`messages-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Messages: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  // Form state for creating/editing messages
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'drivers' as 'drivers' | 'businesses',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load messages on component mount
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const result = await getMessages();
      setMessages(result.data);
    } catch (error) {
      console.error('Error loading messages:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load messages',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateMessage = () => {
    setFormData({
      title: '',
      content: '',
      audience: tabValue === 0 ? 'drivers' : 'businesses',
      priority: 'medium',
      status: 'draft'
    });
    setFormErrors({});
    setCreateDialogOpen(true);
  };

  const handleEditMessage = (message: Message) => {
    setFormData({
      title: message.title,
      content: message.content,
      audience: message.audience,
      priority: message.priority,
      status: message.status
    });
    setFormErrors({});
    setCreateDialogOpen(true);
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
  };

  const handleSaveMessage = async () => {
    // Validate form
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.content.trim()) errors.content = 'Content is required';
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (selectedMessage) {
        // Update existing message
        const updatedMessage = await updateMessage({
          id: selectedMessage.id,
          ...formData
        });
        setMessages(prev => prev.map(msg => 
          msg.id === selectedMessage.id ? updatedMessage : msg
        ));
        setSnackbar({
          open: true,
          message: 'Message updated successfully',
          severity: 'success'
        });
      } else {
        // Create new message
        const newMessage = await createMessage(formData);
        setMessages(prev => [newMessage, ...prev]);
        setSnackbar({
          open: true,
          message: 'Message created successfully',
          severity: 'success'
        });
      }

      setCreateDialogOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error saving message:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save message',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;
    
    try {
      await deleteMessage(messageToDelete);
      setMessages(prev => prev.filter(msg => msg.id !== messageToDelete));
      setSnackbar({
        open: true,
        message: 'Message deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete message',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const filteredMessages = messages.filter(msg => 
    tabValue === 0 ? msg.audience === 'drivers' : msg.audience === 'businesses'
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Messages
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateMessage}
          sx={{ minWidth: 150 }}
        >
          New Message
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="messages tabs">
            <Tab
              icon={<PersonIcon />}
              label="Drivers"
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              icon={<BusinessIcon />}
              label="Businesses"
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Driver Messages
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Communicate important updates, announcements, and guidelines to all drivers.
          </Typography>
          {renderMessagesList('drivers')}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Business Messages
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Share business updates, policy changes, and important information with business partners.
          </Typography>
          {renderMessagesList('businesses')}
        </TabPanel>
      </Paper>

      {/* Create/Edit Message Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedMessage ? 'Edit Message' : 'Create New Message'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                error={!!formErrors.title}
                helperText={formErrors.title}
                placeholder="Enter a clear, descriptive title"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Message Content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                error={!!formErrors.content}
                helperText={formErrors.content}
                placeholder="Write your message here. Be clear and concise."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveMessage}
            variant="contained"
            startIcon={<SendIcon />}
          >
            {selectedMessage ? 'Update Message' : 'Create Message'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedMessage?.title}
        </DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={selectedMessage.priority.toUpperCase()}
                  color={getPriorityColor(selectedMessage.priority) as any}
                  size="small"
                />
                <Chip
                  label={selectedMessage.status.toUpperCase()}
                  color={getStatusColor(selectedMessage.status) as any}
                  size="small"
                />
              </Box>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {selectedMessage.content}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Created: {formatDate(selectedMessage.created_at)}
                </Typography>
                {selectedMessage.read_count && selectedMessage.total_recipients && (
                  <Typography variant="body2" color="text.secondary">
                    Read: {selectedMessage.read_count}/{selectedMessage.total_recipients}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              handleEditMessage(selectedMessage!);
            }}
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this message? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );

  function renderMessagesList(audience: 'drivers' | 'businesses') {
    const audienceMessages = filteredMessages.filter(msg => msg.audience === audience);

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (audienceMessages.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No messages yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first message to communicate with {audience}.
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {audienceMessages.map((message) => (
          <ListItem
            key={message.id}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
              bgcolor: 'background.paper'
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" component="span">
                    {message.title}
                  </Typography>
                  <Chip
                    label={message.priority.toUpperCase()}
                    color={getPriorityColor(message.priority) as any}
                    size="small"
                  />
                  <Chip
                    label={message.status.toUpperCase()}
                    color={getStatusColor(message.status) as any}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 1
                    }}
                  >
                    {message.content}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(message.created_at)}
                    </Typography>
                    {message.read_count && message.total_recipients && (
                      <Typography variant="caption" color="text.secondary">
                        Read: {message.read_count}/{message.total_recipients}
                      </Typography>
                    )}
                  </Box>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={() => handleViewMessage(message)}
                  size="small"
                  title="View Message"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleEditMessage(message)}
                  size="small"
                  title="Edit Message"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteClick(message.id)}
                  size="small"
                  title="Delete Message"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  }
};

export default Messages;
