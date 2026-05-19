import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth, { supabase } from '../hooks/useAuth';
import useMapStore from '../store/mapStore';
import { api } from '../utils/api';
import { categoryConfig } from '../utils/categoryConfig';

const AVATAR_SEEDS = [
  'atlas', 'nova', 'sage', 'iris', 'orion',
  'cleo', 'luna', 'aurora', 'jasper', 'marin',
  'sol', 'zen',
];

const makeAvatarUrl = (seed) => `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;

const getInitials = (value) => {
  const text = String(value || '').trim();
  if (!text) return 'EP';
  return text
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

const formatMemberSince = (value) => {
  if (!value) return 'Member since unknown';
  return `Member since ${new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))}`;
};

const formatRelativeDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { setSelectedPlace, setPendingFlyToPlace } = useMapStore();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const avatarOptions = useMemo(
    () => AVATAR_SEEDS.map((seed) => ({ seed, url: makeAvatarUrl(seed) })),
    []
  );

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const response = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      setProfile(response.data);
      setDisplayName(response.data.user?.displayName || '');
    } catch (requestError) {
      console.error('Error loading profile:', requestError);
      setError('Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (location.hash === '#bookmarks') {
      const node = document.getElementById('bookmarks');
      node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, profile]);

  const updateProfile = async (payload) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setSaving(true);
    setError('');

    try {
      const response = await api.put('/api/auth/me', payload, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setProfile(response.data);
      setDisplayName(response.data.user?.displayName || '');
      setEditingName(false);
    } catch (requestError) {
      console.error('Error updating profile:', requestError);
      setError('Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBookmark = async (placeId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      await api.delete(`/api/places/${placeId}/bookmark`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      await loadProfile();
    } catch (requestError) {
      console.error('Error removing bookmark:', requestError);
      setError('Could not remove bookmark.');
    }
  };

  const handleViewOnMap = (place) => {
    setSelectedPlace(place);
    setPendingFlyToPlace(place);
    navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const memberSince = formatMemberSince(profile?.user?.createdAt);

  const statCards = profile?.stats ? [
    { label: 'Places Explored', value: profile.stats.placesExplored },
    { label: 'Quizzes Taken', value: profile.stats.quizzesTaken },
    { label: 'Average Score', value: `${profile.stats.averageScore}%` },
    { label: 'Bookmarks Saved', value: profile.stats.bookmarksSaved },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Loading profile</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <p className="text-war text-sm">{error || 'Profile unavailable.'}</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-5 py-2 rounded border border-primary text-primary text-xs uppercase tracking-[0.2em]"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.3em] text-text-muted hover:text-primary transition-colors"
          >
            ← Back to Map
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs uppercase tracking-[0.25em] px-4 py-2 rounded border border-war/30 text-war hover:bg-war/10 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <section className="rounded-3xl border border-border bg-background-panel/95 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.24)] p-5 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border border-border bg-background-card flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.25)] shrink-0">
                {profile.user?.avatarUrl ? (
                  <img src={profile.user.avatarUrl} alt="Profile avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">{getInitials(profile.user?.displayName || profile.user?.email)}</span>
                )}
              </div>

              <div className="space-y-3 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  {editingName ? (
                    <>
                      <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full sm:w-[260px] bg-background-card border border-border rounded px-3 py-2 text-lg font-semibold outline-none focus:border-primary"
                        placeholder="Display name"
                      />
                      <button
                        disabled={saving}
                        onClick={() => updateProfile({ displayName })}
                        className="px-3 py-2 rounded border border-primary text-primary text-xs uppercase tracking-[0.2em] disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        disabled={saving}
                        onClick={() => {
                          setEditingName(false);
                          setDisplayName(profile.user?.displayName || '');
                        }}
                        className="px-3 py-2 rounded border border-border text-text-muted text-xs uppercase tracking-[0.2em] disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-primary break-words">
                        {profile.user?.displayName || 'Chronicle Seeker'}
                      </h1>
                      <button
                        onClick={() => setEditingName(true)}
                        className="text-xs uppercase tracking-[0.2em] px-3 py-2 rounded border border-border text-text-muted hover:text-primary hover:border-primary transition-colors"
                      >
                        Edit name
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-text-muted">{memberSince}</p>
              </div>
            </div>

            <div className="lg:text-right space-y-2">
              <p className="text-[10px] uppercase tracking-[0.35em] text-text-muted">Choose Avatar</p>
              <p className="text-xs text-text-muted max-w-md lg:ml-auto">
                Select one of the DiceBear adventurer avatars. The choice saves instantly.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-3">
            {AVATAR_SEEDS.map((seed) => {
              const url = makeAvatarUrl(seed);
              const isActive = profile.user?.avatarUrl === url;
              return (
                <button
                  key={seed}
                  onClick={() => updateProfile({ avatarUrl: url })}
                  className={`rounded-full p-1 border transition-all duration-200 ${isActive ? 'border-primary shadow-[0_0_0_2px_rgba(201,168,76,0.2)]' : 'border-border hover:border-primary/50'}`}
                  title={`Choose ${seed}`}
                >
                  <img src={url} alt={seed} className="w-full h-auto rounded-full bg-background-card" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-background-panel px-4 py-5 text-center">
              <p className="text-[10px] uppercase tracking-[0.25em] text-text-muted">{stat.label}</p>
              <p className="mt-3 text-3xl sm:text-4xl font-mono font-bold text-primary">{stat.value}</p>
            </div>
          ))}
        </section>

        <section id="bookmarks" className="rounded-3xl border border-border bg-background-panel/95 backdrop-blur-md p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs uppercase tracking-[0.3em] text-primary font-bold">Bookmarks</h2>
            <span className="text-[10px] uppercase tracking-[0.25em] text-text-muted">{profile.bookmarks.length} saved</span>
          </div>

          {profile.bookmarks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center text-text-muted">
              No bookmarks yet. Explore the map!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {profile.bookmarks.map((bookmark) => {
                const place = bookmark.place;
                const badge = categoryConfig[place.category] || categoryConfig.culture;
                return (
                  <article key={bookmark.id} className="rounded-2xl border border-border bg-background-card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-text-primary truncate">{place.name}</h3>
                        <span
                          className="inline-flex mt-2 text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full border"
                          style={{
                            color: badge.hex,
                            borderColor: `${badge.hex}55`,
                            backgroundColor: `${badge.hex}12`,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveBookmark(place.id)}
                        className="shrink-0 w-8 h-8 rounded-full border border-border text-text-muted hover:text-war hover:border-war transition-colors"
                        title="Remove bookmark"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewOnMap(place)}
                        className="text-xs px-3 py-2 rounded border border-primary text-primary hover:bg-primary/10 transition-colors"
                      >
                        View on Map
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-background-panel/95 backdrop-blur-md p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs uppercase tracking-[0.3em] text-primary font-bold">Recent Quizzes</h2>
            <span className="text-[10px] uppercase tracking-[0.25em] text-text-muted">Last 5</span>
          </div>

          {profile.recentQuizzes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-text-muted">
              No quizzes taken yet.
            </div>
          ) : (
            <div className="space-y-3">
              {profile.recentQuizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background-card px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">{quiz.place?.name || 'Unknown place'}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">{quiz.place?.category || 'quiz'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-primary text-sm">{quiz.score}/{quiz.total}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">{formatRelativeDate(quiz.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="pb-10 flex justify-center">
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-full border border-war/30 text-war uppercase tracking-[0.25em] text-xs hover:bg-war/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
