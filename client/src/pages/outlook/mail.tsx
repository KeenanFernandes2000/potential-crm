import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Inbox, Mail, Clock, User, RefreshCw, AlertCircle, Send, FileText, Archive, Edit3, X, Paperclip, Plus, Reply, Forward, MoreHorizontal, Move, Trash2, Save, Download, File, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface EmailMessage {
  id: string;
  conversationId: string;
  subject: string;
  from?: {
    emailAddress: {
      address: string;
      name?: string;
    };
  };
  toRecipients?: { emailAddress: { address: string; name?: string } }[];
  bodyPreview: string;
  body?: { content: string; contentType: string };
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
  originalFolder?: string;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  contentType: string;
  size: number;
  isInline?: boolean;
  contentId?: string;
}

interface Recipient {
  name: string;
  address: string;
}

interface ComposeEmailData {
  subject: string;
  body: {
    contentType: "HTML" | "Text";
    content: string;
  };
  toRecipients: Recipient[];
  ccRecipients: Recipient[];
  bccRecipients: Recipient[];
  saveToSentItems: boolean;
  attachments?: File[];
}

interface ReplyData {
  messageId: string;
  comment: string;
}

interface ForwardData {
  messageId: string;
  toRecipients: Recipient[];
  comment: string;
}

interface MoveData {
  messageId: string;
  destinationId: string;
}

interface DraftData {
  subject: string;
  body: {
    contentType: "HTML" | "Text";
    content: string;
  };
  toRecipients: Recipient[];
  ccRecipients: Recipient[];
  bccRecipients: Recipient[];
  attachments?: File[];
}

const FOLDERS = [
  { key: "Inbox", label: "Inbox", icon: Inbox },
  { key: "Sent Items", label: "Sent Items", icon: Send },
  { key: "Drafts", label: "Drafts", icon: FileText },
  { key: "Archive", label: "Archive", icon: Archive },
];

// Available folders for moving emails
const MOVE_FOLDERS = [
  { value: "inbox", label: "Inbox" },
  { value: "sentitems", label: "Sent Items" },
  { value: "drafts", label: "Drafts" },
  { value: "archive", label: "Archive" },
  { value: "deleteditems", label: "Deleted Items" },
  { value: "junkemail", label: "Junk Email" },
];

type ConversationMap = { [conversationId: string]: EmailMessage[] };

type ConversationsByFolder = {
  [folder: string]: ConversationMap;
};

const OutlookMail = () => {
  const [conversations, setConversations] = useState<ConversationsByFolder>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>(FOLDERS[0].key);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editDraftOpen, setEditDraftOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [updatingDraft, setUpdatingDraft] = useState(false);
  const [sendingDraft, setSendingDraft] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<EmailMessage | null>(null);
  const [currentDraft, setCurrentDraft] = useState<EmailMessage | null>(null);

  // Attachment state
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [messageAttachments, setMessageAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<EmailMessage[]>([]);
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compose form state
  const [composeData, setComposeData] = useState<ComposeEmailData>({
    subject: "",
    body: {
      contentType: "HTML",
      content: "",
    },
    toRecipients: [],
    ccRecipients: [],
    bccRecipients: [],
    saveToSentItems: true,
    attachments: [],
  });
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");

  // Reply state
  const [replyComment, setReplyComment] = useState("");

  // Forward state
  const [forwardData, setForwardData] = useState<ForwardData>({
    messageId: "",
    toRecipients: [],
    comment: "",
  });
  const [forwardToInput, setForwardToInput] = useState("");

  // Move state
  const [selectedDestination, setSelectedDestination] = useState("");

  // Fetch threaded conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        setLoading(false);
        return;
      }
      const response = await fetch("http://localhost:8000/api/integration/outlook/messages?threaded=true", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      const conversationsByFolder: ConversationsByFolder = data?.data?.conversations || {};
      setConversations(conversationsByFolder);
      // Select the first conversation in the selected folder by default
      const folderConvos = conversationsByFolder[selectedFolder] || {};
      const firstConvoId = Object.keys(folderConvos)[0] || null;
      setSelectedConversationId(firstConvoId);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  // Send email
  const sendEmail = async () => {
    try {
      setSending(true);
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      // If we have attachments, we need to create a draft first and then send it
      if (composeData.attachments && composeData.attachments.length > 0) {
        console.log("Sending email with attachments - creating draft first");
        
        // Create draft without attachments property (backend doesn't expect it)
        const draftData = {
          subject: composeData.subject,
          body: composeData.body,
          toRecipients: composeData.toRecipients,
          ccRecipients: composeData.ccRecipients,
          bccRecipients: composeData.bccRecipients,
        };

        // Create draft
        const draftResponse = await fetch("http://localhost:8000/api/integration/drafts", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draftData),
        });

        const draftResult = await draftResponse.json();
        if (!draftResponse.ok) {
          throw new Error(draftResult.message || "Failed to create draft with attachments");
        }

        const draftId = draftResult.data?.id;
        if (!draftId) {
          throw new Error("No draft ID returned from server");
        }

        // Add attachments to draft
        for (const file of composeData.attachments) {
          try {
            await addAttachment(draftId, file, false);
          } catch (attachErr) {
            console.error("Error adding attachment:", attachErr);
            throw new Error(`Failed to add attachment: ${file.name}`);
          }
        }

        // Send the draft
        const sendResponse = await fetch(`http://localhost:8000/api/integration/drafts/${draftId}/send`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const sendResult = await sendResponse.json();
        if (!sendResponse.ok) {
          throw new Error(sendResult.message || "Failed to send email with attachments");
        }
      } else {
        // Send email directly without attachments
        const emailData = {
          subject: composeData.subject,
          body: composeData.body,
          toRecipients: composeData.toRecipients,
          ccRecipients: composeData.ccRecipients,
          bccRecipients: composeData.bccRecipients,
          saveToSentItems: composeData.saveToSentItems,
        };

        const response = await fetch("http://localhost:8000/api/integration/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to send email");
        }
      }

      // Reset compose form and close modal
      resetComposeForm();
      setComposeOpen(false);

      // Refresh conversations
      fetchConversations();
    } catch (err) {
      console.error("Error sending email:", err);
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  // Reply to email
  const replyToEmail = async () => {
    if (!currentMessage) return;
    
    try {
      setSending(true);
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      const replyData: ReplyData = {
        messageId: currentMessage.id,
        comment: replyComment,
      };

      const response = await fetch("http://localhost:8000/api/integration/reply", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(replyData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to reply to email");
      }

      // Reset reply form and close modal
      setReplyComment("");
      setReplyOpen(false);
      setCurrentMessage(null);

      // Refresh conversations
      fetchConversations();
    } catch (err) {
      console.error("Error replying to email:", err);
      setError(err instanceof Error ? err.message : "Failed to reply to email");
    } finally {
      setSending(false);
    }
  };

  // Forward email
  const forwardEmail = async () => {
    try {
      setSending(true);
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      const response = await fetch("http://localhost:8000/api/integration/forward", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(forwardData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to forward email");
      }

      // Reset forward form and close modal
      setForwardData({
        messageId: "",
        toRecipients: [],
        comment: "",
      });
      setForwardToInput("");
      setForwardOpen(false);
      setCurrentMessage(null);

      // Refresh conversations
      fetchConversations();
    } catch (err) {
      console.error("Error forwarding email:", err);
      setError(err instanceof Error ? err.message : "Failed to forward email");
    } finally {
      setSending(false);
    }
  };

  // Move email
  const moveEmail = async () => {
    if (!currentMessage || !selectedDestination) return;
    
    try {
      setSending(true);
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      const moveData: MoveData = {
        messageId: currentMessage.id,
        destinationId: selectedDestination,
      };

      const response = await fetch("http://localhost:8000/api/integration/move", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(moveData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to move email");
      }

      // Reset move state and close modal
      setSelectedDestination("");
      setMoveOpen(false);
      setCurrentMessage(null);

      // Refresh conversations
      fetchConversations();
    } catch (err) {
      console.error("Error moving email:", err);
      setError(err instanceof Error ? err.message : "Failed to move email");
    } finally {
      setSending(false);
    }
  };

  // Delete email
  const deleteEmail = async () => {
    if (!currentMessage) return;
    
    try {
      setSending(true);
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/integration/message/${currentMessage.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to delete email");
      }

      // Close confirmation dialog and reset state
      setDeleteConfirmOpen(false);
      setCurrentMessage(null);

      // Refresh conversations
      fetchConversations();
    } catch (err) {
      console.error("Error deleting email:", err);
      setError(err instanceof Error ? err.message : "Failed to delete email");
    } finally {
      setSending(false);
    }
  };

  // Attachment functions
  const listAttachments = async (messageId: string, message?: EmailMessage) => {
    try {
      setLoadingAttachments(true);
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      // Set the current message for download functionality
      if (message) {
        setCurrentMessage(message);
      }

      console.log("Fetching attachments for message:", { messageId, hasMessageId: !!messageId });

      if (!messageId) {
        throw new Error("Message ID is required to fetch attachments");
      }

      const url = `http://localhost:8000/api/integration/messages/${messageId}/attachments`;
      console.log("Attachment fetch URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch attachments");
      }

      setMessageAttachments(result.data?.attachments || []);
      setAttachmentsOpen(true);
    } catch (err) {
      console.error("Error fetching attachments:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch attachments");
    } finally {
      setLoadingAttachments(false);
    }
  };

  const downloadAttachment = async (messageId: string, attachmentId: string, fileName: string) => {
    try {
      // Validate inputs
      if (!messageId || !attachmentId) {
        setError("Invalid message ID or attachment ID");
        return;
      }

      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      console.log("Downloading attachment:", { messageId, attachmentId, fileName });

      const response = await fetch(`http://localhost:8000/api/integration/messages/${messageId}/attachments/${attachmentId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to download attachment";
        
        try {
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // If it's HTML (like a 404 page), get the status text
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading attachment:", err);
      setError(err instanceof Error ? err.message : "Failed to download attachment");
    }
  };

  const addAttachment = async (messageId: string, file: File, refreshList: boolean = true) => {
    try {
      setUploadingAttachment(true);
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      console.log("Adding attachment to message:", { messageId, fileName: file.name, size: file.size });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:8000/api/integration/messages/${messageId}/attachments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to add attachment");
      }

      console.log("Attachment added successfully:", result);

      // Refresh attachments list only if requested (for UI interactions)
      if (refreshList) {
        listAttachments(messageId, currentMessage || undefined);
      }
    } catch (err) {
      console.error("Error adding attachment:", err);
      setError(err instanceof Error ? err.message : "Failed to add attachment");
      throw err; // Re-throw for calling functions to handle
    } finally {
      setUploadingAttachment(false);
    }
  };

  const removeAttachmentFromCompose = (index: number) => {
    setComposeData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || [],
    }));
  };

  const addAttachmentToCompose = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    setComposeData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newFiles],
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };



  // Parse email addresses from input
  const parseEmails = (input: string): Recipient[] => {
    return input
      .split(/[,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0)
      .map(email => {
        const match = email.match(/^(.+?)\s*<(.+?)>$/) || email.match(/^(.+)$/);
        if (match) {
          const [, nameOrEmail, emailPart] = match;
          if (emailPart) {
            return { name: nameOrEmail.trim(), address: emailPart.trim() };
          } else {
            return { name: "", address: nameOrEmail.trim() };
          }
        }
        return { name: "", address: email };
      });
  };

  // Update recipients when input changes
  const updateRecipients = (type: 'to' | 'cc' | 'bcc', input: string) => {
    const recipients = parseEmails(input);
    setComposeData(prev => ({
      ...prev,
      [`${type}Recipients`]: recipients,
    }));
  };

  // Reset compose form
  const resetComposeForm = () => {
    setComposeData({
      subject: "",
      body: { contentType: "HTML", content: "" },
      toRecipients: [],
      ccRecipients: [],
      bccRecipients: [],
      saveToSentItems: true,
      attachments: [],
    });
    setToInput("");
    setCcInput("");
    setBccInput("");
    setShowCc(false);
    setShowBcc(false);
  };

  // Close edit draft modal with form reset
  const closeEditDraft = () => {
    resetComposeForm();
    setEditDraftOpen(false);
    setCurrentDraft(null);
    setCurrentMessage(null);
  };

  // Open reply modal
  const openReply = (message: EmailMessage) => {
    setCurrentMessage(message);
    setReplyComment("");
    setReplyOpen(true);
  };

  // Open forward modal
  const openForward = (message: EmailMessage) => {
    setCurrentMessage(message);
    setForwardData({
      messageId: message.id,
      toRecipients: [],
      comment: "",
    });
    setForwardToInput("");
    setForwardOpen(true);
  };

  // Open move modal
  const openMove = (message: EmailMessage) => {
    setCurrentMessage(message);
    setSelectedDestination("");
    setMoveOpen(true);
  };

  // Open delete confirmation
  const openDeleteConfirm = (message: EmailMessage) => {
    setCurrentMessage(message);
    setDeleteConfirmOpen(true);
  };

  // Update forward recipients
  const updateForwardRecipients = (input: string) => {
    const recipients = parseEmails(input);
    setForwardData(prev => ({
      ...prev,
      toRecipients: recipients,
    }));
  };

  // Save draft
  const saveDraft = async () => {
    try {
      setSavingDraft(true);
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      const draftData: DraftData = {
        subject: composeData.subject,
        body: composeData.body,
        toRecipients: composeData.toRecipients,
        ccRecipients: composeData.ccRecipients,
        bccRecipients: composeData.bccRecipients,
      };

      // First, create the draft
      const response = await fetch("http://localhost:8000/api/integration/drafts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to save draft");
      }

      // If there are attachments, add them to the draft
      if (composeData.attachments && composeData.attachments.length > 0) {
        const draftId = result.data?.id;
        if (draftId) {
          console.log("Adding attachments to draft:", draftId);
          for (const file of composeData.attachments) {
            try {
              await addAttachment(draftId, file, false);
            } catch (attachErr) {
              console.error("Error adding attachment to draft:", attachErr);
              // Continue with other attachments even if one fails
            }
          }
        }
      }

      // Reset compose form and close modal
      resetComposeForm();
      setComposeOpen(false);

      // Refresh conversations to show the new draft
      fetchConversations();
    } catch (err) {
      console.error("Error saving draft:", err);
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSavingDraft(false);
    }
  };

  // Update draft
  const updateDraft = async () => {
    if (!currentDraft) return;
    
    try {
      setUpdatingDraft(true);
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      const draftData: DraftData = {
        subject: composeData.subject,
        body: composeData.body,
        toRecipients: composeData.toRecipients,
        ccRecipients: composeData.ccRecipients,
        bccRecipients: composeData.bccRecipients,
      };

      // First, update the draft content
      const response = await fetch(`http://localhost:8000/api/integration/drafts/${currentDraft.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update draft");
      }

      // If there are new attachments, add them to the draft
      if (composeData.attachments && composeData.attachments.length > 0) {
        console.log("Adding new attachments to draft:", currentDraft.id);
        for (const file of composeData.attachments) {
          try {
            await addAttachment(currentDraft.id, file, false);
          } catch (attachErr) {
            console.error("Error adding attachment to draft:", attachErr);
            // Continue with other attachments even if one fails
          }
        }
      }

      // Reset form and close modal
      closeEditDraft();

      // Refresh conversations to show the updated draft
      fetchConversations();
    } catch (err) {
      console.error("Error updating draft:", err);
      setError(err instanceof Error ? err.message : "Failed to update draft");
    } finally {
      setUpdatingDraft(false);
    }
  };

  // Send draft
  const sendDraft = async (draftId: string) => {
    try {
      setSendingDraft(true);
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/integration/drafts/${draftId}/send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to send draft");
      }

      // Refresh conversations
      fetchConversations();
    } catch (err) {
      console.error("Error sending draft:", err);
      setError(err instanceof Error ? err.message : "Failed to send draft");
    } finally {
      setSendingDraft(false);
    }
  };

  // Load attachments for draft editing (doesn't open modal)
  const loadDraftAttachments = async (messageId: string) => {
    try {
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Loading draft attachments for editing:", messageId);

      const response = await fetch(`http://localhost:8000/api/integration/messages/${messageId}/attachments`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch draft attachments");
      }

      setMessageAttachments(result.data?.attachments || []);
    } catch (err) {
      console.error("Error loading draft attachments:", err);
      throw err;
    }
  };

  // Remove attachment from draft/message (backend API call)
  const removeAttachmentFromMessage = async (messageId: string, attachmentId: string) => {
    try {
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      console.log("Removing attachment from message:", { messageId, attachmentId });

      const response = await fetch(`http://localhost:8000/api/integration/messages/${messageId}/attachments/${attachmentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to remove attachment");
      }

      // Refresh the attachments list
      if (editDraftOpen && currentMessage) {
        await loadDraftAttachments(currentMessage.id);
      } else if (attachmentsOpen && currentMessage) {
        listAttachments(currentMessage.id, currentMessage);
      }
    } catch (err) {
      console.error("Error removing attachment:", err);
      setError(err instanceof Error ? err.message : "Failed to remove attachment");
    }
  };

  // Search emails
  const searchEmails = async (query: string) => {
    if (!query.trim()) {
      clearSearch();
      return;
    }

    try {
      setSearching(true);
      setError(null);
      const token = localStorage.getItem("microsoft_session_token");
      if (!token) {
        setError("No authentication token found. Please authenticate with Microsoft first.");
        return;
      }

      console.log("Searching emails with query:", query);

      const params = new URLSearchParams({
        query: query.trim(),
        top: "50"
      });

      const response = await fetch(`http://localhost:8000/api/integration/search?${params}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to search emails");
      }

      const emails = result.data?.emails || [];
      setSearchResults(emails);
      setIsSearchMode(true);
      
      console.log(`Found ${emails.length} search results`);
    } catch (err) {
      console.error("Error searching emails:", err);
      setError(err instanceof Error ? err.message : "Failed to search emails");
    } finally {
      setSearching(false);
    }
  };

  // Clear search and return to normal view
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchMode(false);
    setSelectedConversationId(null);
  };

  // Navigate to email from search results
  const navigateToEmail = async (email: EmailMessage) => {
    console.log("Navigating to email:", {
      emailId: email.id,
      conversationId: email.conversationId,
      originalFolder: email.originalFolder,
      subject: email.subject
    });
    
    // Clear search mode first
    setIsSearchMode(false);
    setSearchQuery("");
    setSearchResults([]);
    
    const token = localStorage.getItem("microsoft_session_token");
    if (!token) {
      setError("No authentication token found. Please authenticate with Microsoft first.");
      return;
    }
    
    try {
      setLoading(true);
      
      // First, try to find the conversation in existing loaded conversations
      let foundFolder = null;
      let foundConversation = null;
      
      for (const [folderName, folderConversations] of Object.entries(conversations)) {
        const typedFolderConversations = folderConversations as ConversationMap;
        if (typedFolderConversations[email.conversationId]) {
          foundFolder = folderName;
          foundConversation = typedFolderConversations[email.conversationId];
          break;
        }
      }
      
      if (foundFolder && foundConversation) {
        // Found in existing conversations
        console.log("Found conversation in existing data:", foundFolder);
        setSelectedFolder(foundFolder);
        
        // Clear selection first, then set after folder change
        setSelectedConversationId(null);
        setTimeout(() => {
          setSelectedConversationId(email.conversationId);
          console.log("Set conversation ID for existing conversation:", email.conversationId);
        }, 150);
        return;
      }
      
      // If not found, fetch the specific conversation using the conversation ID
      console.log("Conversation not found in existing data, fetching specific conversation...");
      
      const response = await fetch(`http://localhost:8000/api/integration/outlook/conversations/${email.conversationId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch conversation");
      }
      
      const conversationMessages = result.data?.messages || [];
      if (conversationMessages.length === 0) {
        throw new Error("No messages found in conversation");
      }
      
      // Find which folder this conversation belongs to by checking the first message
      const firstMessage = conversationMessages[0];
      let targetFolder = firstMessage.originalFolder || "Inbox";
      
      // Map folder names
      const folderMapping: { [key: string]: string } = {
        "Inbox": "Inbox",
        "Sent Items": "Sent Items",
        "SentItems": "Sent Items",
        "Drafts": "Drafts",
        "Archive": "Archive",
        "Deleted Items": "Deleted Items",
        "DeletedItems": "Deleted Items",
        "Junk Email": "Junk Email",
        "JunkEmail": "Junk Email",
      };
      
      targetFolder = folderMapping[targetFolder] || targetFolder;
      
      console.log("Found conversation in folder:", targetFolder);
      
             // Update conversations state with the new conversation
       const updatedConversations = {
         ...conversations,
         [targetFolder]: {
           ...conversations[targetFolder],
           [email.conversationId]: conversationMessages
         }
       };
       
       setConversations(updatedConversations);
       
       // Set the folder first
       setSelectedFolder(targetFolder);
       
       // Clear any existing selection first
       setSelectedConversationId(null);
       
       // Then set the conversation after a brief delay to ensure folder change is processed
       setTimeout(() => {
         setSelectedConversationId(email.conversationId);
         console.log("Set conversation ID after folder change:", email.conversationId);
       }, 150);
      
    } catch (err) {
      console.error("Error navigating to email:", err);
      
      // Fallback: try to refresh all conversations
      console.log("Falling back to full conversation refresh...");
      try {
        const response = await fetch("http://localhost:8000/api/integration/outlook/messages?threaded=true", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        const data = await response.json();
        const newConversationsByFolder = data?.data?.conversations || {};
        setConversations(newConversationsByFolder);
        
                 // Try to find the conversation again
         for (const [folderName, folderConversations] of Object.entries(newConversationsByFolder)) {
           const typedFolderConversations = folderConversations as ConversationMap;
           if (typedFolderConversations[email.conversationId]) {
             console.log("Found conversation after refresh in folder:", folderName);
             setSelectedFolder(folderName);
             
             // Clear selection first, then set after folder change
             setSelectedConversationId(null);
             setTimeout(() => {
               setSelectedConversationId(email.conversationId);
               console.log("Set conversation ID after fallback refresh:", email.conversationId);
             }, 150);
             return;
           }
         }
        
        // Still not found, just set it anyway
        console.warn("Conversation still not found after refresh, setting anyway");
        setSelectedConversationId(email.conversationId);
        
      } catch (refreshErr) {
        console.error("Error in fallback refresh:", refreshErr);
        setError(refreshErr instanceof Error ? refreshErr.message : "Failed to navigate to email");
      }
    } finally {
      setLoading(false);
    }
  };

  // Open edit draft modal
  const openEditDraft = async (message: EmailMessage) => {
    setCurrentDraft(message);
    setCurrentMessage(message); // Set current message for attachment functionality
    
    // Pre-populate form with draft data
    setComposeData({
      subject: message.subject || "",
      body: {
        contentType: "HTML",
        content: message.body?.content || "",
      },
      toRecipients: message.toRecipients?.map(r => ({
        name: r.emailAddress?.name || "",
        address: r.emailAddress?.address || "",
      })) || [],
      ccRecipients: [], // Note: CC recipients might need to be extracted from the message if available
      bccRecipients: [], // Note: BCC recipients might need to be extracted from the message if available
      saveToSentItems: true,
      attachments: [],
    });
    
    // Set input fields
    setToInput(message.toRecipients?.map(r => 
      r.emailAddress?.name ? `${r.emailAddress.name} <${r.emailAddress.address}>` : r.emailAddress?.address || ""
    ).join(", ") || "");
    
    // Load existing attachments if the draft has any
    if (message.hasAttachments) {
      try {
        await loadDraftAttachments(message.id);
      } catch (err) {
        console.error("Error loading draft attachments:", err);
        // Continue opening the modal even if attachments fail to load
      }
    } else {
      // Clear any existing attachments
      setMessageAttachments([]);
    }
    
    setEditDraftOpen(true);
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to clear search
      if (e.key === 'Escape' && isSearchMode) {
        clearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchMode]);

  // When folder changes, select first conversation in that folder
  useEffect(() => {
    const folderConvos = conversations[selectedFolder] || {};
    const firstConvoId = Object.keys(folderConvos)[0] || null;
    setSelectedConversationId(firstConvoId);
  }, [selectedFolder, conversations]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSenderName = (email: EmailMessage) => {
    // Handle drafts which don't have a 'from' field
    if (!email.from) {
      // Check if this is a draft in the Drafts folder
      if (email.originalFolder === "Drafts") {
        return "Draft";
      }
      return "Unknown";
    }
    
    // Support both { from: { emailAddress: { ... } } } and { from: { name, address } }
    if (
      typeof email.from === "object" &&
      email.from !== null &&
      "emailAddress" in email.from &&
      email.from.emailAddress &&
      typeof email.from.emailAddress === "object"
    ) {
  return (
        email.from.emailAddress.name ||
        email.from.emailAddress.address ||
        "Unknown"
      );
    }
    if (
      typeof email.from === "object" &&
      email.from !== null &&
      "name" in email.from &&
      typeof email.from.name === "string"
    ) {
      return email.from.name || ("address" in email.from ? (email.from as any).address : "Unknown");
    }
    if (
      typeof email.from === "object" &&
      email.from !== null &&
      "address" in email.from &&
      typeof email.from.address === "string"
    ) {
      return email.from.address;
    }
    return "Unknown";
  };

  const getPreviewText = (preview: string) => {
    return preview.length > 60 ? `${preview.substring(0, 60)}...` : preview;
  };

  // For the middle pane: show threads for the selected folder OR search results
  const folderConversations = conversations[selectedFolder] || {};
  const conversationIds = Object.keys(folderConversations);

  // For the right pane: show all messages in the selected thread (already provided by backend)
  const selectedThread = selectedConversationId
    ? (folderConversations[selectedConversationId] || []).slice().sort((a, b) => new Date(a.receivedDateTime).getTime() - new Date(b.receivedDateTime).getTime())
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mr-3" />
        <span className="text-gray-600">Loading conversations...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Conversations</h3>
          <p className="text-gray-600 mb-4 max-w-md">{error}</p>
          <Button onClick={fetchConversations} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-background rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Outlook Mail</h1>
                <p className="text-gray-600 text-sm">
                  {isSearchMode 
                    ? `${searchResults.length} search result${searchResults.length === 1 ? '' : 's'} for "${searchQuery}"`
                    : `${conversationIds.length} conversation${conversationIds.length === 1 ? '' : 's'} in ${FOLDERS.find(f => f.key === selectedFolder)?.label}`
                  }
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="flex items-center space-x-3">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search emails... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        searchEmails(searchQuery);
                      }
                    }}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <Button 
                  onClick={() => searchEmails(searchQuery)} 
                  disabled={searching || !searchQuery.trim()}
                  variant="outline"
                  size="sm"
                >
                  {searching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Button onClick={() => setComposeOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Edit3 className="h-4 w-4 mr-2" />
              New Email
            </Button>
            <Button onClick={fetchConversations} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        {/* Main 3-column Layout */}
        <div className="flex flex-1 min-h-0">
          {/* Left: Folder List */}
          <nav className="w-48 min-w-[120px] max-w-[200px] border-r bg-gray-50 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1">
                {FOLDERS.map(folder => {
                  const Icon = folder.icon;
                  return (
                    <li key={folder.key}>
                      <button
                        className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors text-left
                          ${selectedFolder === folder.key ? 'bg-white text-blue-700 font-semibold shadow border-l-4 border-blue-600' : 'hover:bg-blue-100 text-gray-700'}`}
                        onClick={() => setSelectedFolder(folder.key)}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {folder.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
          {/* Middle: Thread List OR Search Results */}
          <aside className="w-80 min-w-[240px] max-w-xs border-r bg-gray-50 flex flex-col h-full overflow-hidden">
            {/* Search results header */}
            {isSearchMode && (
              <div className="px-4 py-2 border-b bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">Search Results</h3>
                  <Button variant="ghost" size="sm" onClick={clearSearch} className="h-6 px-2">
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto">
              {searching ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                  <RefreshCw className="h-8 w-8 mb-2 animate-spin" />
                  Searching emails...
                </div>
              ) : isSearchMode ? (
                // Search results view
                searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                    <Search className="h-8 w-8 mb-2" />
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {searchResults.map((email) => (
                      <li
                        key={email.id}
                        className="cursor-pointer px-4 py-3 transition-colors group select-none hover:bg-blue-50"
                        onClick={() => navigateToEmail(email)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm truncate">{getSenderName(email)}</span>
                          <div className="flex items-center space-x-1">
                            {email.originalFolder && (
                              <span className="px-1.5 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                                {email.originalFolder}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                              {formatDate(email.receivedDateTime)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mb-0.5">
                          <div className="truncate text-sm flex-1">
                            {email.subject || '(No Subject)'}
                          </div>
                          {email.hasAttachments && (
                            <Paperclip className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="truncate text-xs text-gray-600">
                          {getPreviewText(email.bodyPreview || 'No preview available')}
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                // Normal conversation view
                conversationIds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                    <Mail className="h-8 w-8 mb-2" />
                    No conversations in this folder
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {conversationIds.map((cid) => {
                      const thread = folderConversations[cid];
                      // Show latest message in thread (regardless of folder)
                      const latest = thread.reduce((a, b) => new Date(a.receivedDateTime) > new Date(b.receivedDateTime) ? a : b);
                      // Unread if any message in thread is unread
                      const isUnread = thread.some(m => !m.isRead);
                      return (
                        <li
                          key={cid}
                          className={`cursor-pointer px-4 py-3 transition-colors group select-none
                            ${selectedConversationId === cid ? 'bg-white border-l-4 border-blue-600 shadow-sm' : 'hover:bg-blue-50'}
                            ${isUnread ? 'font-bold text-blue-900' : 'text-gray-800'}`}
                          onClick={() => setSelectedConversationId(cid)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm truncate">{getSenderName(latest)}</span>
                            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{formatDate(latest.receivedDateTime)}</span>
                          </div>
                          <div className="truncate text-sm mb-0.5">
                            {latest.subject || '(No Subject)'}
                          </div>
                          <div className="truncate text-xs text-gray-600">
                            {getPreviewText(latest.bodyPreview || 'No preview available')}
                          </div>
                          {thread.length > 1 && (
                            <div className="text-xs text-gray-400 mt-1">{thread.length} messages</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )
              )}
            </div>
          </aside>
          {/* Right: Conversation Content */}
          <main className="flex-1 flex flex-col h-full overflow-y-auto bg-white">
            {!selectedThread ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                {isSearchMode ? (
                  <>
                    <Search className="h-12 w-12 mb-4" />
                    <div className="text-lg font-medium">Click on a search result to view the email</div>
                    <div className="text-sm mt-2">Search results will navigate to the email's original location</div>
                  </>
                ) : (
                  <>
                    <Inbox className="h-12 w-12 mb-4" />
                    <div className="text-lg font-medium">Select a conversation to view its content</div>
                  </>
                )}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto w-full p-8 space-y-8">
                {selectedThread.map((msg, idx) => (
                  <div key={msg.id} className="border-b pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center">
                        <User className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-semibold text-gray-900">{getSenderName(msg)}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-gray-700 text-sm">
                          {msg.toRecipients?.map((r) => {
                            if (r.emailAddress && (r.emailAddress.name || r.emailAddress.address)) {
                              return r.emailAddress.name || r.emailAddress.address;
                            }
                            if ('name' in r && typeof r.name === 'string') {
                              return r.name;
                            }
                            if ('address' in r && typeof r.address === 'string') {
                              return r.address;
                            }
                            return '';
                          }).filter(Boolean).join(', ') || 'Me'}
                        </span>
                        {msg.originalFolder && (
                          <span className="ml-3 px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-500 border border-gray-200">{msg.originalFolder}</span>
                        )}
              </div>
                      
                      {/* Message Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {msg.originalFolder === "Drafts" ? (
                            // Draft-specific actions
                            <>
                              <DropdownMenuItem onClick={() => openEditDraft(msg)}>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Draft
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => sendDraft(msg.id)}
                                disabled={sendingDraft}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                {sendingDraft ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Draft
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {msg.hasAttachments && (
                                <DropdownMenuItem 
                                  onClick={() => listAttachments(msg.id, msg)}
                                  disabled={loadingAttachments}
                                >
                                  {loadingAttachments ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Loading...
                                    </>
                                  ) : (
                                    <>
                                      <Paperclip className="h-4 w-4 mr-2" />
                                      View Attachments
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => openDeleteConfirm(msg)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Draft
                              </DropdownMenuItem>
                            </>
                          ) : (
                            // Regular email actions
                            <>
                              <DropdownMenuItem onClick={() => openReply(msg)}>
                                <Reply className="h-4 w-4 mr-2" />
                                Reply
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openForward(msg)}>
                                <Forward className="h-4 w-4 mr-2" />
                                Forward
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {msg.hasAttachments && (
                                <DropdownMenuItem 
                                  onClick={() => listAttachments(msg.id, msg)}
                                  disabled={loadingAttachments}
                                >
                                  {loadingAttachments ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Loading...
                                    </>
                                  ) : (
                                    <>
                                      <Paperclip className="h-4 w-4 mr-2" />
                                      View Attachments
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => openMove(msg)}>
                                <Move className="h-4 w-4 mr-2" />
                                Move to folder
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openDeleteConfirm(msg)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
              </div>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(msg.receivedDateTime)}
            </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-lg font-bold text-gray-900 break-words">{msg.subject || '(No Subject)'}</div>
                      {msg.hasAttachments && (
                        <Paperclip className="h-4 w-4 text-gray-500" />
                      )}
              </div>
                    <div className="prose prose-sm max-w-none text-gray-900">
                      {msg.body?.contentType === 'html' ? (
                        <div dangerouslySetInnerHTML={{ __html: msg.body.content }} />
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans text-gray-800 bg-transparent p-0 m-0 border-0 shadow-none">{msg.body?.content || msg.bodyPreview || 'No content available.'}</pre>
                      )}
            </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Compose Email Modal */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
                <Edit3 className="h-5 w-5 mr-2" />
                New Message
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setComposeOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {/* Recipients */}
              <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="to" className="w-12 text-sm">To:</Label>
                <Input
                  id="to"
                  value={toInput}
                  onChange={(e) => {
                    setToInput(e.target.value);
                    updateRecipients('to', e.target.value);
                  }}
                  placeholder="Enter email addresses separated by commas"
                  className="flex-1"
                />
                <div className="flex space-x-1">
                  {!showCc && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCc(true)}
                      className="text-xs"
                    >
                      Cc
                    </Button>
                  )}
                  {!showBcc && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBcc(true)}
                      className="text-xs"
                    >
                      Bcc
                    </Button>
                  )}
                </div>
                </div>
              
              {showCc && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="cc" className="w-12 text-sm">Cc:</Label>
                  <Input
                    id="cc"
                    value={ccInput}
                    onChange={(e) => {
                      setCcInput(e.target.value);
                      updateRecipients('cc', e.target.value);
                    }}
                    placeholder="Enter Cc recipients"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCc(false);
                      setCcInput("");
                      updateRecipients('cc', "");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {showBcc && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="bcc" className="w-12 text-sm">Bcc:</Label>
                  <Input
                    id="bcc"
                    value={bccInput}
                    onChange={(e) => {
                      setBccInput(e.target.value);
                      updateRecipients('bcc', e.target.value);
                    }}
                    placeholder="Enter Bcc recipients"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowBcc(false);
                      setBccInput("");
                      updateRecipients('bcc', "");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
              </div>
              )}
        </div>

            {/* Subject */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="subject" className="w-12 text-sm">Subject:</Label>
              <Input
                id="subject"
                value={composeData.subject}
                onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
                className="flex-1"
              />
      </div>

            {/* Body */}
            <div className="flex-1 flex flex-col min-h-0">
              <Label htmlFor="body" className="text-sm mb-2">Message:</Label>
              <Textarea
                id="body"
                value={composeData.body.content}
                onChange={(e) => setComposeData(prev => ({
                  ...prev,
                  body: { ...prev.body, content: e.target.value }
                }))}
                placeholder="Type your message here..."
                className="flex-1 min-h-[200px] resize-none"
              />
    </div>

            {/* Attachments */}
            {composeData.attachments && composeData.attachments.length > 0 && (
              <div className="border-t pt-4">
                <Label className="text-sm mb-2 block">Attachments:</Label>
                <div className="space-y-2">
                  {composeData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-2">
                        <File className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachmentFromCompose(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach
                      <input
                        type="file"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => addAttachmentToCompose(e.target.files)}
                      />
                    </label>
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Insert
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setComposeOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={saveDraft}
                  disabled={savingDraft || sending || (!composeData.subject.trim() && !composeData.body.content.trim())}
                >
                  {savingDraft ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </>
                  )}
                </Button>
                <Button
                  onClick={sendEmail}
                  disabled={sending || savingDraft || !composeData.toRecipients.length || !composeData.subject.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Modal */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-3xl max-h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Reply className="h-5 w-5 mr-2" />
                Reply to: {currentMessage?.subject || '(No Subject)'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {/* Original message info */}
            {currentMessage && (
              <div className="p-3 bg-gray-50 rounded border text-sm">
                <div><strong>From:</strong> {getSenderName(currentMessage)}</div>
                <div><strong>Date:</strong> {formatDate(currentMessage.receivedDateTime)}</div>
                <div><strong>Subject:</strong> {currentMessage.subject || '(No Subject)'}</div>
              </div>
            )}

            {/* Reply message */}
            <div className="flex-1 flex flex-col min-h-0">
              <Label htmlFor="reply-body" className="text-sm mb-2">Your reply:</Label>
              <Textarea
                id="reply-body"
                value={replyComment}
                onChange={(e) => setReplyComment(e.target.value)}
                placeholder="Type your reply here..."
                className="flex-1 min-h-[200px] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setReplyOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={replyToEmail}
                disabled={sending || !replyComment.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Replying...
                  </>
                ) : (
                  <>
                    <Reply className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forward Modal */}
      <Dialog open={forwardOpen} onOpenChange={setForwardOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Forward className="h-5 w-5 mr-2" />
                Forward: {currentMessage?.subject || '(No Subject)'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setForwardOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {/* Recipients */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="forward-to" className="w-12 text-sm">To:</Label>
              <Input
                id="forward-to"
                value={forwardToInput}
                onChange={(e) => {
                  setForwardToInput(e.target.value);
                  updateForwardRecipients(e.target.value);
                }}
                placeholder="Enter email addresses separated by commas"
                className="flex-1"
              />
            </div>

            {/* Original message info */}
            {currentMessage && (
              <div className="p-3 bg-gray-50 rounded border text-sm">
                <div><strong>From:</strong> {getSenderName(currentMessage)}</div>
                <div><strong>Date:</strong> {formatDate(currentMessage.receivedDateTime)}</div>
                <div><strong>Subject:</strong> {currentMessage.subject || '(No Subject)'}</div>
              </div>
            )}

            {/* Forward message */}
            <div className="flex-1 flex flex-col min-h-0">
              <Label htmlFor="forward-body" className="text-sm mb-2">Add a message (optional):</Label>
              <Textarea
                id="forward-body"
                value={forwardData.comment}
                onChange={(e) => setForwardData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Add your message here..."
                className="flex-1 min-h-[150px] resize-none"
              />
                </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setForwardOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={forwardEmail}
                disabled={sending || !forwardData.toRecipients.length}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Forwarding...
                  </>
                ) : (
                  <>
                    <Forward className="h-4 w-4 mr-2" />
                    Send Forward
                  </>
                )}
              </Button>
                </div>
                </div>
        </DialogContent>
      </Dialog>

      {/* Move Email Modal */}
      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Move className="h-5 w-5 mr-2" />
              Move Email
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentMessage && (
              <div className="p-3 bg-gray-50 rounded border text-sm">
                <div><strong>Subject:</strong> {currentMessage.subject || '(No Subject)'}</div>
                <div><strong>From:</strong> {getSenderName(currentMessage)}</div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="destination">Move to folder:</Label>
              <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  {MOVE_FOLDERS.map((folder) => (
                    <SelectItem key={folder.value} value={folder.value}>
                      {folder.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setMoveOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={moveEmail}
                disabled={sending || !selectedDestination}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Moving...
                  </>
                ) : (
                  <>
                    <Move className="h-4 w-4 mr-2" />
                    Move Email
                  </>
                )}
              </Button>
        </div>
      </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-red-600" />
              Delete Email
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this email? This action cannot be undone.
              {currentMessage && (
                <div className="mt-3 p-3 bg-gray-50 rounded border text-sm">
                  <div><strong>Subject:</strong> {currentMessage.subject || '(No Subject)'}</div>
                  <div><strong>From:</strong> {getSenderName(currentMessage)}</div>
    </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteEmail}
              disabled={sending}
              className="bg-red-600 hover:bg-red-700"
            >
              {sending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Email
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

             {/* Edit Draft Modal */}
       <Dialog open={editDraftOpen} onOpenChange={closeEditDraft}>
         <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
           <DialogHeader>
             <DialogTitle className="flex items-center justify-between">
               <div className="flex items-center">
                 <Edit3 className="h-5 w-5 mr-2" />
                 Edit Draft
               </div>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={closeEditDraft}
               >
                 <X className="h-4 w-4" />
               </Button>
             </DialogTitle>
           </DialogHeader>
          
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {/* Recipients */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="to" className="w-12 text-sm">To:</Label>
                <Input
                  id="to"
                  value={toInput}
                  onChange={(e) => {
                    setToInput(e.target.value);
                    updateRecipients('to', e.target.value);
                  }}
                  placeholder="Enter email addresses separated by commas"
                  className="flex-1"
                />
                <div className="flex space-x-1">
                  {!showCc && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCc(true)}
                      className="text-xs"
                    >
                      Cc
                    </Button>
                  )}
                  {!showBcc && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBcc(true)}
                      className="text-xs"
                    >
                      Bcc
                    </Button>
                  )}
                </div>
              </div>
              
              {showCc && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="cc" className="w-12 text-sm">Cc:</Label>
                  <Input
                    id="cc"
                    value={ccInput}
                    onChange={(e) => {
                      setCcInput(e.target.value);
                      updateRecipients('cc', e.target.value);
                    }}
                    placeholder="Enter Cc recipients"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCc(false);
                      setCcInput("");
                      updateRecipients('cc', "");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {showBcc && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="bcc" className="w-12 text-sm">Bcc:</Label>
                  <Input
                    id="bcc"
                    value={bccInput}
                    onChange={(e) => {
                      setBccInput(e.target.value);
                      updateRecipients('bcc', e.target.value);
                    }}
                    placeholder="Enter Bcc recipients"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowBcc(false);
                      setBccInput("");
                      updateRecipients('bcc', "");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="subject" className="w-12 text-sm">Subject:</Label>
              <Input
                id="subject"
                value={composeData.subject}
                onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
                className="flex-1"
              />
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col min-h-0">
              <Label htmlFor="body" className="text-sm mb-2">Message:</Label>
              <Textarea
                id="body"
                value={composeData.body.content}
                onChange={(e) => setComposeData(prev => ({
                  ...prev,
                  body: { ...prev.body, content: e.target.value }
                }))}
                placeholder="Type your message here..."
                className="flex-1 min-h-[200px] resize-none"
              />
            </div>

            {/* Existing Attachments (from draft) */}
            {messageAttachments.length > 0 && (
              <div className="border-t pt-4">
                <Label className="text-sm mb-2 block">Existing Attachments:</Label>
                <div className="space-y-2">
                  {messageAttachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <File className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{attachment.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(attachment.size)})</span>
                        {attachment.isInline && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Inline</span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => currentMessage && removeAttachmentFromMessage(currentMessage.id, attachment.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Attachments */}
            {composeData.attachments && composeData.attachments.length > 0 && (
              <div className="border-t pt-4">
                <Label className="text-sm mb-2 block">New Attachments:</Label>
                <div className="space-y-2">
                  {composeData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-2">
                        <File className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachmentFromCompose(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach
                      <input
                        type="file"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => addAttachmentToCompose(e.target.files)}
                      />
                    </label>
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Insert
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={closeEditDraft}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={updateDraft}
                  disabled={updatingDraft || sending || (!composeData.subject.trim() && !composeData.body.content.trim())}
                >
                  {updatingDraft ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Draft
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attachments Modal */}
      <Dialog open={attachmentsOpen} onOpenChange={setAttachmentsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Paperclip className="h-5 w-5 mr-2" />
                Attachments
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAttachmentsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {messageAttachments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No attachments found in this message.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messageAttachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <File className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{attachment.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(attachment.size)} • {attachment.contentType}
                          {attachment.isInline && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                              Inline
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (currentMessage?.id) {
                            downloadAttachment(currentMessage.id, attachment.id, attachment.name);
                          } else {
                            setError("No message selected for attachment download");
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {currentMessage?.originalFolder === "Drafts" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => currentMessage && removeAttachmentFromMessage(currentMessage.id, attachment.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add attachment to existing message (for drafts) */}
            {currentMessage?.originalFolder === "Drafts" && (
              <div className="border-t pt-4">
                <div className="relative">
                  <Button variant="outline" className="w-full" asChild disabled={uploadingAttachment}>
                    <label className="cursor-pointer">
                      {uploadingAttachment ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Attachment
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0] && currentMessage) {
                            addAttachment(currentMessage.id, e.target.files[0], true);
                          }
                        }}
                        disabled={uploadingAttachment}
                      />
                    </label>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OutlookMail; 