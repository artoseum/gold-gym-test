import { useState } from 'react';
import { Shield, X, Trash2, Ban, UserX, Eye, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import { useAuthStore, useMembershipStore, useSocialStore } from '../store/stores';
import { formatDate, timeAgo } from '../utils/helpers';
import './AdminPage.css';

export default function AdminPage({ onClose }) {
  const allUsers = useAuthStore((s) => s.allUsers);
  const bannedUsers = useAuthStore((s) => s.bannedUsers);
  const banUser = useAuthStore((s) => s.banUser);
  const unbanUser = useAuthStore((s) => s.unbanUser);
  const memberships = useMembershipStore((s) => s.memberships);
  const { posts, reports, deletePost, deleteUserContent } = useSocialStore();
  const currentUid = useAuthStore((s) => s.currentUser?.uid);

  const [tab, setTab] = useState('users');
  const [expandedUser, setExpandedUser] = useState(null);

  const userList = Object.values(allUsers).filter((u) => u.uid !== currentUid);
  const reportedPostIds = [...new Set(reports.map((r) => r.postId))];
  const reportedPosts = posts.filter((p) => reportedPostIds.includes(p.id) && !p.deleted);

  return (
    <div className="admin-overlay">
      <div className="admin-panel animate-slide-right">
        <div className="admin-header">
          <div className="flex items-center gap-10">
            <div className="admin-badge-icon">
              <Shield size={18} />
            </div>
            <div>
              <div className="admin-title">Admin Mode</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Long-press triggered</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" style={{ color: 'rgba(255,255,255,0.7)' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            Users ({userList.length})
          </button>
          <button className={`admin-tab ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>
            Reports {reportedPosts.length > 0 && <span className="admin-badge">{reportedPosts.length}</span>}
          </button>
          <button className={`admin-tab ${tab === 'banned' ? 'active' : ''}`} onClick={() => setTab('banned')}>
            Banned ({bannedUsers.length})
          </button>
        </div>

        <div className="admin-content">
          {/* Users Tab */}
          {tab === 'users' && (
            <div className="flex flex-col gap-10">
              {userList.length === 0 && (
                <div className="admin-empty">No other users registered yet.</div>
              )}
              {userList.map((user) => {
                const membership = memberships[user.uid] || null;
                const active = membership && membership.status === 'active' && Date.now() < membership.expiresAt;
                const isBanned = bannedUsers.includes(user.uid);
                const expanded = expandedUser === user.uid;
                return (
                  <div key={user.uid} className={`admin-user-card ${isBanned ? 'banned' : ''}`}>
                    <div
                      className="admin-user-header"
                      onClick={() => setExpandedUser(expanded ? null : user.uid)}
                    >
                      <div className="admin-user-avatar">{user.displayName?.[0]?.toUpperCase() || '?'}</div>
                      <div className="flex-1">
                        <div className="admin-user-name">{user.displayName}</div>
                        <div className="text-xs text-muted">{user.email || user.phone}</div>
                      </div>
                      {isBanned && <span className="badge badge-red">Banned</span>}
                      {!isBanned && active && <span className="badge badge-green">Active</span>}
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                    {expanded && (
                      <div className="admin-user-details animate-fade-in">
                        <div className="admin-detail-row">
                          <span>Auth Method</span>
                          <strong>{user.authMethod}</strong>
                        </div>
                        <div className="admin-detail-row">
                          <span>Joined</span>
                          <strong>{formatDate(user.createdAt)}</strong>
                        </div>
                        <div className="admin-detail-row">
                          <span>Membership</span>
                          <strong>{membership ? `${membership.planName} — ${active ? 'Active' : 'Expired'}` : 'None'}</strong>
                        </div>
                        {membership && (
                          <div className="admin-detail-row">
                            <span>Expires</span>
                            <strong>{formatDate(membership.expiresAt)}</strong>
                          </div>
                        )}
                        <div className="admin-user-actions mt-12">
                          {isBanned ? (
                            <button className="btn btn-secondary btn-sm" onClick={() => unbanUser(user.uid)}>
                              ✓ Unban User
                            </button>
                          ) : (
                            <button className="btn btn-danger btn-sm" onClick={() => {
                              banUser(user.uid);
                              deleteUserContent(user.uid);
                            }}>
                              <Ban size={12} /> Ban User & Remove Content
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Reports Tab */}
          {tab === 'reports' && (
            <div className="flex flex-col gap-10">
              {reportedPosts.length === 0 && (
                <div className="admin-empty">No reported posts. 🎉</div>
              )}
              {reportedPosts.map((post) => {
                const reportCount = reports.filter((r) => r.postId === post.id).length;
                return (
                  <div key={post.id} className="admin-report-card">
                    <div className="flex items-center gap-10 mb-10">
                      <Flag size={14} color="var(--error)" />
                      <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>@{post.username}</span>
                      <span className="badge badge-red">{reportCount} report{reportCount > 1 ? 's' : ''}</span>
                      <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>{timeAgo(post.createdAt)}</span>
                    </div>
                    {post.caption && <p className="text-sm text-muted mb-10">"{post.caption}"</p>}
                    {post.imageData && (
                      <img src={post.imageData} alt="Reported" className="admin-report-img" />
                    )}
                    <div className="flex gap-8 mt-12">
                      <button className="btn btn-danger btn-sm" onClick={() => deletePost(post.id)}>
                        <Trash2 size={12} /> Remove Post
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => {
                        banUser(post.uid);
                        deleteUserContent(post.uid);
                      }}>
                        <UserX size={12} /> Ban User
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Banned Tab */}
          {tab === 'banned' && (
            <div className="flex flex-col gap-10">
              {bannedUsers.length === 0 && (
                <div className="admin-empty">No banned users.</div>
              )}
              {bannedUsers.map((uid) => {
                const user = allUsers[uid];
                return (
                  <div key={uid} className="admin-user-card banned">
                    <div className="admin-user-header">
                      <div className="admin-user-avatar" style={{ opacity: 0.5 }}>
                        {user?.displayName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="admin-user-name" style={{ opacity: 0.6 }}>{user?.displayName || uid}</div>
                        <div className="text-xs" style={{ color: 'var(--error)' }}>Permanently banned</div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => unbanUser(uid)}>
                        Unban
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
