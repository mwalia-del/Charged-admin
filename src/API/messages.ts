// API Base URL
const API_BASE_URL = 'https://api.charged.autos';

// Types
export interface Message {
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

export interface CreateMessageRequest {
  title: string;
  content: string;
  audience: 'drivers' | 'businesses';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
}

export interface UpdateMessageRequest extends Partial<CreateMessageRequest> {
  id: string;
}

export interface MessageFilters {
  audience?: 'drivers' | 'businesses';
  status?: 'draft' | 'published' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  search?: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const userString = localStorage.getItem("charged_admin_user");
  const user = userString ? JSON.parse(userString) : null;
  return user?.token || null;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Get all messages with optional filters
export const getMessages = async (filters: MessageFilters = {}): Promise<{ data: Message[]; total: number }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (filters.audience) queryParams.append('audience', filters.audience);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.search) queryParams.append('search', filters.search);

    const url = `${API_BASE_URL}/admin/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await handleResponse(response);
    return {
      data: result.data?.messages || result.messages || result.data || result,
      total: result.data?.total || result.total || 0
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Get a single message by ID
export const getMessage = async (id: string): Promise<Message> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/messages/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await handleResponse(response);
    return result.data || result;
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error;
  }
};

// Create a new message
export const createMessage = async (messageData: CreateMessageRequest): Promise<Message> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });

    const result = await handleResponse(response);
    return result.data || result;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
};

// Update an existing message
export const updateMessage = async (messageData: UpdateMessageRequest): Promise<Message> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const { id, ...updateData } = messageData;

    const response = await fetch(`${API_BASE_URL}/admin/messages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    const result = await handleResponse(response);
    return result.data || result;
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (id: string): Promise<void> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/messages/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    await handleResponse(response);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Publish a message (change status from draft to published)
export const publishMessage = async (id: string): Promise<Message> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/messages/${id}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await handleResponse(response);
    return result.data || result;
  } catch (error) {
    console.error('Error publishing message:', error);
    throw error;
  }
};

// Archive a message
export const archiveMessage = async (id: string): Promise<Message> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/messages/${id}/archive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await handleResponse(response);
    return result.data || result;
  } catch (error) {
    console.error('Error archiving message:', error);
    throw error;
  }
};

// Get message statistics
export const getMessageStats = async (): Promise<{
  total_messages: number;
  published_messages: number;
  draft_messages: number;
  archived_messages: number;
  driver_messages: number;
  business_messages: number;
  recent_activity: Array<{
    date: string;
    messages_created: number;
    messages_published: number;
  }>;
}> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/messages/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await handleResponse(response);
    return result.data || result;
  } catch (error) {
    console.error('Error fetching message stats:', error);
    throw error;
  }
};

// Get message recipients (for tracking read status)
export const getMessageRecipients = async (messageId: string): Promise<{
  total_recipients: number;
  read_count: number;
  unread_count: number;
  recipients: Array<{
    id: string;
    name: string;
    email: string;
    read_at?: string;
    audience: 'drivers' | 'businesses';
  }>;
}> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/messages/${messageId}/recipients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await handleResponse(response);
    return result.data || result;
  } catch (error) {
    console.error('Error fetching message recipients:', error);
    throw error;
  }
};
