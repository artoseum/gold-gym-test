import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Flag, Image, Send, Lock, Plus, X, MoreHorizontal, Crown, ChevronLeft } from 'lucide-react';
import { useAuthStore, useMembershipStore, useSocialStore } from '../store/stores';
import { compressImage, timeAgo } from '../utils/helpers';
import { useToast } from '../components/Toast';
import './SocialPage.css';

function UsernameSetup({ uid, onDone }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { setUsername: saveUsername, isUsernameTaken } = useSocialStore();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const u = username.trim();
    if (u.length < 3) { setError('Username must be at least 3 characters.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(u)) { setError('Only letters, numbers, and underscores.'); return; }
    if (isUsernameTaken(u)) { setError('Username already taken. Try another.'); return; }
    saveUsername(uid, u);
    toast('Username set! Welcome to the community 🎉', 'success');
    onDone();
  };

  return (
    <div className="username-setup animate-scale-in">
      <div className="username-setup-icon">👤</div>
      <h2>Create Your Handle</h2>
      <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 24 }}>
        Pick a unique username for the community. This stays fixed while your subscription is active and won't reveal your personal details.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-16" style={{ maxWidth: 360, width: '100%' }}>
        <div className="input-group">
          <label className="input-label">Username</label>
          <input
            className="input"
            placeholder="e.g. IronWarrior92"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
          />
          {error && <p style={{ color: 'var(--error)', fontSize: '0.8rem' }}>{error}</p>}
        </div>
        <button className="btn btn-primary btn-lg">Set Username &amp; Join</button>
      </form>
    </div>
  );
}

function PostCard({ post, currentUid, currentUsername, onLike, onComment, onReport, onDelete, onViewProfile }) {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const isLiked = post.likes.includes(currentUid);
  const isMine = post.uid === currentUid;

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText.trim());
    setCommentText('');
    setShowCommentBox(false);
  };

  if (post.deleted) return null;

  return (
    <div className="post-card card animate-fade-in">
      <div className="post-header">
        <div className="post-avatar" onClick={() => onViewProfile && onViewProfile(post.uid)} style={{ cursor: onViewProfile ? 'pointer' : 'default' }}>
          {post.username && post.username.length > 0 ? post.username[0].toUpperCase() : '?'}
        </div>
        <div>
          <div className="post-username" onClick={() => onViewProfile && onViewProfile(post.uid)} style={{ cursor: onViewProfile ? 'pointer' : 'default' }}>
            @{post.username}
          </div>
          <div className="text-xs text-muted">{timeAgo(post.createdAt)}</div>
        </div>
        <button className="btn btn-ghost btn-icon btn-sm post-menu-btn" style={{ marginLeft: 'auto' }}
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreHorizontal size={16} />
        </button>
        {showMenu && (
          <div className="post-menu" onClick={() => setShowMenu(false)}>
            {isMine && (
              <button className="post-menu-item danger" onClick={() => onDelete(post.id)}>
                <X size={14} /> Delete Post
              </button>
            )}
            {!isMine && (
              <button className="post-menu-item" onClick={() => onReport(post.id)}>
                <Flag size={14} /> Report Post
              </button>
            )}
          </div>
        )}
      </div>

      {post.imageData && (
        <div className="post-image-wrapper">
          <img src={post.imageData} alt="Progress" className="post-image" loading="lazy" />
        </div>
      )}

      {post.caption && (
        <p className="post-caption">{post.caption}</p>
      )}

      <div className="post-actions">
        <button
          className={`post-action-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => onLike(post.id)}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          {post.likes.length > 0 && <span>{post.likes.length}</span>}
        </button>
        <button
          className="post-action-btn"
          onClick={() => setShowCommentBox(!showCommentBox)}
        >
          <MessageCircle size={16} />
          {post.comments.length > 0 && <span>{post.comments.length}</span>}
        </button>
      </div>

      {/* Comments */}
      {post.comments.length > 0 && (
        <div className="post-comments">
          {post.comments.map((c) => (
            <div key={c.id} className="post-comment">
              <span className="comment-user" onClick={() => onViewProfile && onViewProfile(c.uid)} style={{ cursor: onViewProfile ? 'pointer' : 'default' }}>@{c.username}</span>
              <span className="comment-text">{c.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Comment Box */}
      {showCommentBox && (
        <form onSubmit={handleComment} className="comment-form">
          <input
            className="input"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary btn-icon btn-sm">
            <Send size={14} />
          </button>
        </form>
      )}
    </div>
  );
}

function CreatePostModal({ username, uid, onClose, onCreate }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const toast = useToast();

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('Image too large (max 5MB)', 'error'); return; }
    setLoading(true);
    const compressed = await compressImage(file, 800, 0.7);
    setImage(compressed);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caption.trim() && !image) { toast('Add a caption or image.', 'error'); return; }
    onCreate(uid, username, caption.trim(), image);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">New Post</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-16">
          {image ? (
            <div className="post-preview-img-wrap">
              <img src={image} alt="Preview" className="post-preview-img" />
              <button type="button" className="btn btn-danger btn-sm post-remove-img" onClick={() => setImage(null)}>
                <X size={12} /> Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="upload-zone"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : <><Image size={24} /><span>Upload Progress Photo</span><span className="text-xs text-muted">JPEG/PNG · max 5MB</span></>}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          <div className="input-group">
            <label className="input-label">Caption</label>
            <textarea
              className="input"
              placeholder="Share your progress..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg">Post</button>
        </form>
      </div>
    </div>
  );
}

export default function SocialPage() {
  const toast = useToast();
  const user = useAuthStore((s) => s.currentUser);
  const memberships = useMembershipStore((s) => s.memberships);
  const uid = user?.uid;
  const membership = uid ? (memberships[uid] || null) : null;
  const isActive = (membership && membership.status === 'active' && Date.now() < membership.expiresAt) || user?.isAdmin;
  const { usernames, posts, setUsername, createPost, toggleLike, addComment, deletePost, reportPost } = useSocialStore();
  const username = usernames[user?.uid];
  const [showCreate, setShowCreate] = useState(false);
  const [usernameSet, setUsernameSet] = useState(!!username);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(!!username);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [selectedProfileUid, setSelectedProfileUid] = useState(null);

  const allPosts = posts.filter((p) => !p.deleted);

  if (!isActive) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div className="gold-club-header">
            <Crown size={22} className="text-gold" />
            <h1 className="page-title">GOLD CLUB</h1>
          </div>
          <p className="page-subtitle">The exclusive Gold's Gym social community</p>
        </div>
        <div className="social-locked card">
          <Lock size={48} color="var(--gold-primary)" style={{ opacity: 0.6 }} />
          <h2>Members Only</h2>
          <p className="text-muted">The GOLD CLUB is exclusive to active subscribers. Get a membership to connect with fellow members, share progress, and stay motivated.</p>
          <a href="/membership" className="btn btn-primary mt-16">Get Membership</a>
        </div>
      </div>
    );
  }

  // ── Disclaimer / Community Guidelines step ──
  if (!disclaimerAccepted && !username) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div className="gold-club-header">
            <Crown size={22} className="text-gold" />
            <h1 className="page-title">GOLD CLUB</h1>
          </div>
          <p className="page-subtitle">Community Guidelines</p>
        </div>

        <div className="disclaimer-card card">
          <div className="disclaimer-icon">📜</div>
          <h2 className="disclaimer-title">Before You Join</h2>
          <p className="disclaimer-intro">
            Welcome to the <strong>GOLD CLUB</strong> — our exclusive member community. To keep this space safe, respectful, and empowering for everyone, please review and accept the following guidelines.
          </p>

          <div className="disclaimer-rules">
            <div className="disclaimer-rule">
              <div className="disclaimer-rule-num">01</div>
              <div>
                <div className="disclaimer-rule-title">Respect All Members</div>
                <div className="disclaimer-rule-desc">Treat everyone with dignity and respect. Discrimination based on gender, race, body type, fitness level, or background will not be tolerated.</div>
              </div>
            </div>

            <div className="disclaimer-rule">
              <div className="disclaimer-rule-num">02</div>
              <div>
                <div className="disclaimer-rule-title">Zero Tolerance for Abuse</div>
                <div className="disclaimer-rule-desc">Any form of bullying, harassment, hate speech, or personal attacks is strictly prohibited. This includes comments, posts, and direct interactions.</div>
              </div>
            </div>

            <div className="disclaimer-rule">
              <div className="disclaimer-rule-num">03</div>
              <div>
                <div className="disclaimer-rule-title">No Violence or Threats</div>
                <div className="disclaimer-rule-desc">Content promoting, glorifying, or threatening violence of any kind will result in immediate action. Keep the community safe and supportive.</div>
              </div>
            </div>

            <div className="disclaimer-rule">
              <div className="disclaimer-rule-num">04</div>
              <div>
                <div className="disclaimer-rule-title">Appropriate Content Only</div>
                <div className="disclaimer-rule-desc">Share fitness-related content that inspires and motivates. Inappropriate, explicit, or offensive material is not permitted.</div>
              </div>
            </div>

            <div className="disclaimer-rule">
              <div className="disclaimer-rule-num">05</div>
              <div>
                <div className="disclaimer-rule-title">No Spam or Self-Promotion</div>
                <div className="disclaimer-rule-desc">Excessive self-promotion, spam, scams, or solicitation of any kind will be removed. Share genuinely, not commercially.</div>
              </div>
            </div>

            <div className="disclaimer-rule">
              <div className="disclaimer-rule-num">06</div>
              <div>
                <div className="disclaimer-rule-title">Report, Don't Retaliate</div>
                <div className="disclaimer-rule-desc">If you encounter a violation, use the report feature. Do not engage or escalate. Our admin team will review all reports promptly.</div>
              </div>
            </div>
          </div>

          <div className="disclaimer-consequence">
            <div className="disclaimer-consequence-icon">⚠️</div>
            <div>
              <strong>Violation Consequences</strong>
              <p>Any member found violating these guidelines will face <strong>immediate membership termination</strong> and their <strong>User ID will be permanently blocked</strong> from the Gold Club. Gold's Gym reserves the right to take action without prior notice.</p>
            </div>
          </div>

          <label className="disclaimer-checkbox">
            <input
              type="checkbox"
              checked={disclaimerChecked}
              onChange={(e) => setDisclaimerChecked(e.target.checked)}
            />
            <span>I have read and agree to the <strong>GOLD CLUB Community Guidelines</strong>. I understand that violations may result in membership termination and permanent account suspension.</span>
          </label>

          <button
            className="btn btn-primary btn-lg btn-full"
            disabled={!disclaimerChecked}
            onClick={() => {
              setDisclaimerAccepted(true);
              toast('Guidelines accepted — welcome aboard! 🎉', 'success');
            }}
          >
            <Crown size={16} /> Accept & Continue
          </button>
        </div>
      </div>
    );
  }

  if (!username && !usernameSet) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div className="gold-club-header">
            <Crown size={22} className="text-gold" />
            <h1 className="page-title">GOLD CLUB</h1>
          </div>
        </div>
        <UsernameSetup uid={user.uid} onDone={() => setUsernameSet(true)} />
      </div>
    );
  }

  if (selectedProfileUid) {
    const profilePosts = allPosts.filter(p => p.uid === selectedProfileUid);
    const profileUsername = profilePosts[0]?.username || usernames[selectedProfileUid] || 'User';
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <button className="btn btn-ghost btn-sm mb-16" onClick={() => setSelectedProfileUid(null)}>
            <ChevronLeft size={16} /> Back to Feed
          </button>
          <div className="user-profile-header">
            <div className="user-profile-avatar">{profileUsername[0].toUpperCase()}</div>
            <div>
              <h1 className="page-title">@{profileUsername}</h1>
              <p className="page-subtitle">{profilePosts.length} posts</p>
            </div>
          </div>
        </div>

        {profilePosts.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">📸</div>
            <div className="empty-state-title">No Posts Yet</div>
          </div>
        ) : (
          <div className="social-feed">
            {profilePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUid={uid}
                currentUsername={username}
                onLike={(pid) => toggleLike(pid, uid)}
                onComment={(pid, text) => addComment(pid, uid, username, text)}
                onReport={(pid) => {
                  reportPost(pid, uid);
                  toast('Post reported for review', 'info');
                }}
                onDelete={(pid) => deletePost(pid)}
                onViewProfile={null}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
    <div className="animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="gold-club-header">
            <Crown size={22} className="text-gold" />
            <h1 className="page-title">GOLD CLUB</h1>
          </div>
          <p className="page-subtitle">@{username} • Community Feed</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Post
        </button>
      </div>

      {allPosts.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📸</div>
          <div className="empty-state-title">No Posts Yet</div>
          <div className="empty-state-desc">Be the first to share your fitness journey!</div>
        </div>
      ) : (
        <div className="social-feed">
          {allPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUid={uid}
              currentUsername={username}
              onLike={(pid) => toggleLike(pid, uid)}
              onComment={(pid, text) => {
                addComment(pid, uid, username, text);
                toast('Comment added!', 'success');
              }}
              onReport={(pid) => {
                reportPost(pid, uid);
                toast('Post reported. Admin will review.', 'info');
              }}
              onDelete={(pid) => {
                deletePost(pid);
                toast('Post deleted.', 'info');
              }}
              onViewProfile={(profileUid) => setSelectedProfileUid(profileUid)}
            />
          ))}
        </div>
      )}
    </div>
    {showCreate && (
      <CreatePostModal
        username={username}
        uid={user.uid}
        onClose={() => setShowCreate(false)}
        onCreate={createPost}
      />
    )}
    </>
  );
}
