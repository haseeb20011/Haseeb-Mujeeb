import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Clock3,
  Inbox,
  Mail,
  MailOpen,
  MessageCircle,
  Reply,
  Search,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import "./MessagesManager.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const EMPTY_COUNTS = {
  inbox: 0,
  unread: 0,
  starred: 0,
  archived: 0,
  total: 0,
};

const TONES = [
  "green",
  "orange",
  "yellow",
  "purple",
  "blue",
];

const getInitials = (name = "") =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "ME";

const getTone = (message) => {
  const source = String(
    message?.id || message?.email || message?.name || "message"
  );

  const total = Array.from(source).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0
  );

  return TONES[total % TONES.length];
};

const formatReceivedAt = (value) => {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (isToday) {
    return `Today, ${time}`;
  }

  if (isYesterday) {
    return `Yesterday, ${time}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === now.getFullYear()
        ? undefined
        : "numeric",
  }).format(date);
};

const normalizeMessage = (message) => ({
  ...message,
  id: String(message.id || message._id || ""),
  projectType: message.projectType || "Not specified",
  budget: message.budget || "Not specified",
  subject: message.subject || "Portfolio website enquiry",
  message: message.message || "",
  unread: Boolean(message.unread),
  starred: Boolean(message.starred),
  archived: Boolean(message.archived),
  tone: getTone(message),
  receivedAt: formatReceivedAt(
    message.createdAt || message.receivedAt
  ),
});

export default function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [activeFilter, setActiveFilter] =
    useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [error, setError] = useState("");

  const publishMessageUpdate = useCallback(
    (nextCounts, nextMessages = []) => {
      window.dispatchEvent(
        new CustomEvent("portfolio-messages-updated", {
          detail: {
            messages: nextMessages,
            counts: nextCounts,
            count: nextCounts.inbox,
            unreadCount: nextCounts.unread,
          },
        })
      );
    },
    []
  );

  const loadMessages = useCallback(
    async ({ keepSelection = true } = {}) => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          filter: activeFilter,
          limit: "100",
        });

        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }

        const response = await fetch(
          `${API_URL}/api/messages?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const result = await response
          .json()
          .catch(() => ({}));

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message ||
              "Messages could not be loaded."
          );
        }

        const nextMessages = Array.isArray(result.messages)
          ? result.messages.map(normalizeMessage)
          : [];

        const nextCounts = {
          ...EMPTY_COUNTS,
          ...(result.counts || {}),
        };

        setMessages(nextMessages);
        setCounts(nextCounts);
        publishMessageUpdate(nextCounts, nextMessages);

        setSelectedId((currentId) => {
          if (
            keepSelection &&
            currentId &&
            nextMessages.some(
              (message) => message.id === currentId
            )
          ) {
            return currentId;
          }

          return nextMessages[0]?.id || null;
        });
      } catch (requestError) {
        setMessages([]);
        setSelectedId(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Messages could not be loaded."
        );
      } finally {
        setIsLoading(false);
      }
    }, [activeFilter, searchQuery, publishMessageUpdate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadMessages({ keepSelection: false });
    }, searchQuery.trim() ? 250 : 0);

    return () => window.clearTimeout(timer);
  }, [loadMessages]);

  const selectedMessage = useMemo(
    () =>
      messages.find(
        (message) => message.id === selectedId
      ) || messages[0] || null,
    [messages, selectedId]
  );

  const updateMessageRecord = async (
    messageId,
    updates,
    { reload = false } = {}
  ) => {
    setActionPending(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/messages/${messageId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
            "The message could not be updated."
        );
      }

      const updatedMessage = normalizeMessage(
        result.message
      );

      const nextCounts = {
        ...counts,
        ...(result.counts || {}),
      };

      setCounts(nextCounts);

      if (reload) {
        await loadMessages({ keepSelection: false });
      } else {
        setMessages((current) => {
          const nextMessages = current.map((message) =>
            message.id === messageId
              ? updatedMessage
              : message
          );

          publishMessageUpdate(
            nextCounts,
            nextMessages
          );

          return nextMessages;
        });
      }

      return updatedMessage;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The message could not be updated."
      );

      return null;
    } finally {
      setActionPending(false);
    }
  };

  const handleSelectMessage = async (message) => {
    setSelectedId(message.id);

    if (message.unread) {
      await updateMessageRecord(message.id, {
        unread: false,
      });
    }
  };

  const handleDeleteMessage = async (message) => {
    const confirmed = window.confirm(
      `Delete the message from ${message.name}?`
    );

    if (!confirmed) return;

    setActionPending(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/messages/${message.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
            "The message could not be deleted."
        );
      }

      const nextCounts = {
        ...counts,
        ...(result.counts || {}),
      };

      setCounts(nextCounts);
      setSelectedId(null);
      await loadMessages({ keepSelection: false });
      publishMessageUpdate(nextCounts, []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The message could not be deleted."
      );
    } finally {
      setActionPending(false);
    }
  };

  const handleArchiveMessage = async (message) => {
    setSelectedId(null);

    await updateMessageRecord(
      message.id,
      {
        archived: !message.archived,
        unread: false,
      },
      { reload: true }
    );
  };

  const filterItems = [
    {
      id: "inbox",
      label: "Inbox",
      icon: Inbox,
      count: counts.inbox,
    },
    {
      id: "unread",
      label: "Unread",
      icon: Mail,
      count: counts.unread,
    },
    {
      id: "starred",
      label: "Starred",
      icon: Star,
      count: counts.starred,
    },
    {
      id: "archived",
      label: "Archived",
      icon: Archive,
      count: counts.archived,
    },
  ];

  return (
    <section className="cms-messages">
      <header className="cms-messages__header">
        <div>
          <span className="cms-messages__eyebrow">
            Client communication
          </span>

          <h1>Messages</h1>

          <p>
            Review real portfolio enquiries saved in
            MongoDB, organize conversations, and reply
            directly by email.
          </p>
        </div>

        <div className="cms-messages__header-status">
          <span>
            <CheckCircle2 size={15} />
            MongoDB connected
          </span>

          <strong>{counts.unread} unread</strong>
        </div>
      </header>

      {error && (
        <div
          className="cms-messages__empty"
          role="alert"
          style={{ marginBottom: 20 }}
        >
          <span>
            <Mail size={24} />
          </span>
          <strong>Messages could not be updated</strong>
          <p>{error}</p>
          <button
            type="button"
            onClick={() =>
              loadMessages({ keepSelection: false })
            }
          >
            Try again
          </button>
        </div>
      )}

      <section className="cms-messages__summary">
        <article className="cms-messages__summary-intro">
          <span>
            <Sparkles size={16} />
            Live communication centre
          </span>

          <strong>
            Every new contact-form enquiry now appears
            here automatically.
          </strong>

          <p>
            Read, star, archive, delete, and reply to
            real submissions. All message changes are
            saved permanently in MongoDB.
          </p>
        </article>

        <MessageStat
          label="Inbox"
          value={counts.inbox}
          detail="Active conversations"
          icon={Inbox}
          tone="purple"
        />

        <MessageStat
          label="Unread"
          value={counts.unread}
          detail="Needs your attention"
          icon={Mail}
          tone="orange"
        />

        <MessageStat
          label="Starred"
          value={counts.starred}
          detail="Priority enquiries"
          icon={Star}
          tone="green"
        />
      </section>

      <section className="cms-messages__workspace">
        <aside className="cms-messages__filters">
          <div className="cms-messages__filters-heading">
            <span>
              <MessageCircle size={16} />
            </span>

            <div>
              <strong>Mailbox</strong>
              <small>
                {counts.total} total messages
              </small>
            </div>
          </div>

          <nav>
            {filterItems.map((item) => {
              const FilterIcon = item.icon;

              return (
                <button
                  type="button"
                  key={item.id}
                  className={
                    activeFilter === item.id
                      ? "is-active"
                      : ""
                  }
                  onClick={() => {
                    setActiveFilter(item.id);
                    setSelectedId(null);
                  }}
                >
                  <FilterIcon size={16} />
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </button>
              );
            })}
          </nav>

          <div className="cms-messages__filters-note">
            <Clock3 size={16} />

            <div>
              <strong>Response target</strong>
              <span>
                Reply within one business day.
              </span>
            </div>
          </div>
        </aside>

        <div className="cms-messages__list-panel">
          <header className="cms-messages__list-header">
            <div>
              <h2>
                {
                  filterItems.find(
                    (item) => item.id === activeFilter
                  )?.label
                }
              </h2>

              <p>
                {isLoading
                  ? "Loading messages..."
                  : `${messages.length} messages`}
              </p>
            </div>

            <label className="cms-messages__search">
              <Search size={15} />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search messages..."
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </label>
          </header>

          <div className="cms-messages__list">
            {messages.map((message) => (
              <button
                type="button"
                key={message.id}
                className={`cms-message-item ${
                  selectedMessage?.id === message.id
                    ? "is-selected"
                    : ""
                } ${
                  message.unread ? "is-unread" : ""
                }`}
                onClick={() =>
                  handleSelectMessage(message)
                }
                disabled={actionPending}
              >
                <span
                  className={`cms-message-item__avatar is-${message.tone}`}
                >
                  {getInitials(message.name)}
                </span>

                <span className="cms-message-item__content">
                  <span className="cms-message-item__top">
                    <strong>{message.name}</strong>
                    <time>{message.receivedAt}</time>
                  </span>

                  <span className="cms-message-item__subject">
                    {message.subject}
                  </span>

                  <span className="cms-message-item__preview">
                    {message.message}
                  </span>
                </span>

                <span className="cms-message-item__indicators">
                  {message.starred && (
                    <Star
                      size={13}
                      fill="currentColor"
                    />
                  )}

                  {message.unread && <i />}
                </span>
              </button>
            ))}

            {!isLoading && messages.length === 0 && (
              <div className="cms-messages__empty">
                <span>
                  <Search size={24} />
                </span>

                <strong>No messages found</strong>

                <p>
                  New contact submissions will appear
                  here automatically.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("inbox");
                    loadMessages({
                      keepSelection: false,
                    });
                  }}
                >
                  Refresh inbox
                </button>
              </div>
            )}
          </div>
        </div>

        <article className="cms-messages__detail">
          {selectedMessage ? (
            <>
              <header className="cms-messages__detail-header">
                <div className="cms-messages__sender">
                  <span
                    className={`cms-messages__sender-avatar is-${selectedMessage.tone}`}
                  >
                    {getInitials(selectedMessage.name)}
                  </span>

                  <div>
                    <strong>
                      {selectedMessage.name}
                    </strong>

                    <a
                      href={`mailto:${selectedMessage.email}`}
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>

                <div className="cms-messages__detail-actions">
                  <button
                    type="button"
                    className={
                      selectedMessage.starred
                        ? "is-starred"
                        : ""
                    }
                    onClick={() =>
                      updateMessageRecord(
                        selectedMessage.id,
                        {
                          starred:
                            !selectedMessage.starred,
                        }
                      )
                    }
                    title="Star message"
                    disabled={actionPending}
                  >
                    <Star
                      size={16}
                      fill={
                        selectedMessage.starred
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateMessageRecord(
                        selectedMessage.id,
                        {
                          unread:
                            !selectedMessage.unread,
                        }
                      )
                    }
                    title={
                      selectedMessage.unread
                        ? "Mark as read"
                        : "Mark as unread"
                    }
                    disabled={actionPending}
                  >
                    {selectedMessage.unread ? (
                      <MailOpen size={16} />
                    ) : (
                      <Mail size={16} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleArchiveMessage(
                        selectedMessage
                      )
                    }
                    title={
                      selectedMessage.archived
                        ? "Move to inbox"
                        : "Archive message"
                    }
                    disabled={actionPending}
                  >
                    <Archive size={16} />
                  </button>

                  <button
                    type="button"
                    className="is-delete"
                    onClick={() =>
                      handleDeleteMessage(
                        selectedMessage
                      )
                    }
                    title="Delete message"
                    disabled={actionPending}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </header>

              <div className="cms-messages__detail-body">
                <div className="cms-messages__subject">
                  <span>Subject</span>
                  <h2>{selectedMessage.subject}</h2>
                </div>

                <div className="cms-messages__meta-grid">
                  <div>
                    <span>Project type</span>
                    <strong>
                      {selectedMessage.projectType}
                    </strong>
                  </div>

                  <div>
                    <span>Budget</span>
                    <strong>
                      {selectedMessage.budget}
                    </strong>
                  </div>

                  <div>
                    <span>Received</span>
                    <strong>
                      {selectedMessage.receivedAt}
                    </strong>
                  </div>
                </div>

                <div className="cms-messages__message-copy">
                  <p>{selectedMessage.message}</p>
                </div>
              </div>

              <footer className="cms-messages__detail-footer">
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    `Re: ${selectedMessage.subject}`
                  )}`}
                  className="cms-messages__reply"
                >
                  <Reply size={16} />
                  Reply by email
                </a>

                <span>
                  <UserRound size={14} />
                  Replying as Haseeb Mujeeb
                </span>
              </footer>
            </>
          ) : (
            <div className="cms-messages__detail-empty">
              <span>
                <MailOpen size={30} />
              </span>

              <strong>Select a message</strong>

              <p>
                Choose a conversation from the list to
                view its complete details.
              </p>
            </div>
          )}
        </article>
      </section>
    </section>
  );
}

function MessageStat({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}) {
  return (
    <article
      className={`cms-messages__stat is-${tone}`}
    >
      <span>
        <Icon size={19} />
      </span>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </article>
  );
}