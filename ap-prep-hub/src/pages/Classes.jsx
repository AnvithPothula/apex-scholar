/**
 * Classes / clubs — create a class, share one link, everyone joins.
 *
 * Three states, one component, driven by the route:
 *   /classes         list the classes I'm in, and create one
 *   /classes/:code   roster + leaderboard, or a Join prompt if I'm not in it
 *   /join/:code      redirects to /classes/:code (short link for sharing)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Plus, Copy, Check, Trophy, LogOut, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { Card, Button, Badge, Input } from '../components/ui/UIComponents';
import MultiSelectDropdown from '../components/ui/MultiSelectDropdown';
import { getAvailableSubjects } from '../constants/comprehensiveCurriculum';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { createPageUrl } from '../utils/helpers';
import classesService from '../services/classes';
import { normalizeClassCode } from '../utils/classCode';

function Shell({ children, back }) {
  return (
    <div className="min-h-screen bg-base-950 text-content-primary">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="flex items-center gap-2 mb-6">
          {back && (
            <Link to={back} aria-label="Back to classes" className="text-content-muted hover:text-content-primary">
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          )}
          <Users className="w-6 h-6 text-content-primary" strokeWidth={1.5} />
          <h1 className="text-h2 font-display text-content-primary">Classes</h1>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Classes() {
  const { code } = useParams();
  return code ? <ClassDetail code={code} /> : <ClassList />;
}

// ---- /classes ------------------------------------------------------------

function ClassList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [joinInput, setJoinInput] = useState('');
  const [busy, setBusy] = useState(false);
  // MultiSelectDropdown wants { label, value }; getAvailableSubjects returns
  // plain strings, and passing those straight in crashed the page on
  // `o.label.toLowerCase()`.
  const allSubjects = useMemo(() => {
    try {
      return (getAvailableSubjects() || []).map((s) => ({ label: s, value: s }));
    } catch {
      return [];
    }
  }, []);

  const load = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    // Live variant so a class the owner deleted disappears here too.
    setClasses(await classesService.getMyClassesLive(user.uid));
    setIsLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // try/finally on every one of these: without it, one rejected promise leaves
  // the button spinning with no error shown and no way to retry.
  const create = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      const created = await classesService.createClass(user, { name, subjects });
      if (!created) return toast.error("Couldn't create the class. Try again.");
      setName('');
      setSubjects([]);
      navigate(`${createPageUrl('Classes')}/${created.id}`);
    } finally {
      setBusy(false);
    }
  };

  const join = async () => {
    const normalized = normalizeClassCode(joinInput);
    if (!normalized) return toast.error("That join code doesn't look right. Codes are 8 characters.");
    if (busy) return;
    setBusy(true);
    try {
      const result = await classesService.joinClass(user, normalized);
      if (result === 'notfound') return toast.error('No class with that code.');
      if (result === 'error') return toast.error("Couldn't join. Try again.");
      navigate(`${createPageUrl('Classes')}/${normalized}`);
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return <Shell><p className="text-content-secondary">Loading…</p></Shell>;
  }

  return (
    <Shell>
      <Card className="p-5 mb-4">
        <h2 className="text-h4 font-display mb-1">Start a class or club</h2>
        <p className="text-body-sm text-content-secondary mb-4">
          You get one link. Everyone who opens it joins, and you all share a leaderboard.
        </p>
        <div className="space-y-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && create()}
            placeholder="e.g. Period 3 AP Biology"
            maxLength={60}
          />
          <MultiSelectDropdown
            options={allSubjects}
            selected={subjects}
            onChange={setSubjects}
            placeholder="Subjects that count (leave empty for all)"
          />
          <p className="text-caption text-content-muted">
            {subjects.length
              ? `Only ${subjects.length === 1 ? 'this subject counts' : 'these subjects count'} toward the leaderboard.`
              : 'Every subject counts toward the leaderboard.'}
          </p>
          <Button variant="primary" onClick={create} disabled={!name.trim() || busy} className="w-full sm:w-auto">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />
                  : <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />}
            Create
          </Button>
        </div>
      </Card>

      <Card className="p-5 mb-6">
        <h2 className="text-h4 font-display mb-1">Join with a code</h2>
        <p className="text-body-sm text-content-secondary mb-4">
          Paste the link your teacher gave you, or type the 8-character code.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && join()}
            placeholder="ABCD2345"
            className="flex-1 font-mono"
          />
          <Button variant="secondary" onClick={join} disabled={!joinInput.trim() || busy}>
            Join
          </Button>
        </div>
      </Card>

      <h2 className="text-h4 font-display mb-3">Your classes</h2>
      {classes.length === 0 ? (
        <Card className="p-5">
          <p className="text-body-sm text-content-secondary">
            You're not in any classes yet. Create one above, or join with a code.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {classes.map((c) => (
            <Link key={c.id} to={`${createPageUrl('Classes')}/${c.id}`} className="block">
              <Card className="p-4 hover:bg-base-750 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-body text-content-primary">{c.name || 'Untitled class'}</span>
                  <Badge variant="secondary" className="font-mono">{c.id}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}

// ---- /classes/:code ------------------------------------------------------

function ClassDetail({ code }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [klass, setKlass] = useState(null);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const normalized = normalizeClassCode(code);
  const isMember = rows.some((r) => r.uid === user?.uid);

  const load = useCallback(async () => {
    if (!normalized) { setIsLoading(false); return; }
    const found = await classesService.getClass(normalized);
    setKlass(found);
    // Non-members can't read the roster by design, so this comes back empty
    // for them — that's the rules working, not a failure.
    setRows(found ? await classesService.getLeaderboard(normalized) : []);
    setIsLoading(false);
  }, [normalized]);

  useEffect(() => { load(); }, [load]);

  const join = async () => {
    setBusy(true);
    try {
      const result = await classesService.joinClass(user, normalized);
      if (result === 'notfound') return toast.error('No class with that code.');
      if (result === 'error') return toast.error("Couldn't join. Try again.");
      toast.success(`Joined ${klass?.name || 'the class'}.`);
      setIsLoading(true);
      load();
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(classesService.joinUrl(normalized));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed — select the link and copy it manually.');
    }
  };

  const leave = async () => {
    const ok = await confirm({
      title: 'Leave this class?',
      message: "Your scores stay in your own account, but you'll drop off this leaderboard.",
      confirmText: 'Leave',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const done = await classesService.leaveClass(user.uid, normalized);
      // An ownerless class could never be deleted or administered again, so
      // the owner is asked to delete it instead of orphaning the roster.
      if (done === 'owner') {
        return toast.error('You created this class — delete it instead of leaving.');
      }
      if (!done) return toast.error("Couldn't leave. Try again.");
      navigate(createPageUrl('Classes'));
    } finally {
      setBusy(false);
    }
  };

  const toggleOwner = async (targetUid, action) => {
    setBusy(true);
    try {
      const result = await classesService.setOwner(user.uid, normalized, targetUid, action);
      if (result === 'notowner') return toast.error('Only an owner can change owners.');
      if (result === 'lastowner') return toast.error('A class needs at least one owner.');
      if (result === 'notmember') return toast.error('That person is not in this class.');
      if (result !== 'ok') return toast.error("Couldn't update owners. Try again.");
      toast.success(action === 'promote' ? 'Added as an owner.' : 'Removed as an owner.');
      setIsLoading(true);
      load();
    } finally {
      setBusy(false);
    }
  };

  const destroy = async () => {
    const ok = await confirm({
      title: `Delete ${klass?.name || 'this class'}?`,
      message:
        'The class and its leaderboard are removed for everyone. Students keep all their own scores and practice history. This cannot be undone.',
      confirmText: 'Delete class',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const result = await classesService.deleteClass(user.uid, normalized);
      if (result === 'notowner') return toast.error('Only the person who created the class can delete it.');
      if (result !== 'deleted') return toast.error("Couldn't delete the class. Try again.");
      toast.success('Class deleted.');
      navigate(createPageUrl('Classes'));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <Shell back={createPageUrl('Classes')}><p className="text-content-secondary">Loading…</p></Shell>;

  if (!normalized || !klass) {
    return (
      <Shell back={createPageUrl('Classes')}>
        <Card className="p-5">
          <p className="text-body text-content-primary mb-1">That class doesn't exist.</p>
          <p className="text-body-sm text-content-secondary">
            Check the code with whoever shared it — codes are 8 characters and never contain O, I, L, 0 or 1.
          </p>
        </Card>
      </Shell>
    );
  }

  const isOwner = classesService.isOwnerOf(klass, user?.uid);
  const owners = classesService.ownerIdsOf(klass);

  return (
    <Shell back={createPageUrl('Classes')}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-h3 font-display text-content-primary">{klass.name}</h2>
          <p className="text-caption text-content-muted">
            {isOwner ? 'You created this class' : `Created by ${klass.ownerName || 'a teacher'}`}
          </p>
          {Array.isArray(klass.subjects) && klass.subjects.length > 0 && (
            <p className="text-caption text-content-muted mt-1">
              Counts: {klass.subjects.join(', ')}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="font-mono shrink-0">{normalized}</Badge>
      </div>

      {!isMember ? (
        <Card className="p-5 mb-4">
          <p className="text-body text-content-primary mb-3">Join this class to see the leaderboard.</p>
          <Button variant="primary" onClick={join} disabled={busy}>
            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />}
            Join {klass.name}
          </Button>
        </Card>
      ) : (
        <Card className="p-4 mb-4">
          <p className="text-label text-content-muted mb-2">Share this link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-body-sm text-content-secondary bg-base-800 rounded-md px-3 py-2 truncate">
              {classesService.joinUrl(normalized)}
            </code>
            <Button variant="outline" onClick={copy} size="sm">
              {copied ? <Check className="w-4 h-4" strokeWidth={1.5} /> : <Copy className="w-4 h-4" strokeWidth={1.5} />}
              <span className="ml-2">{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        </Card>
      )}

      {isMember && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-content-primary" strokeWidth={1.5} />
            <h3 className="text-h4 font-display">Leaderboard</h3>
          </div>
          <Card className="divide-y divide-border-subtle">
            {rows.map((r, i) => (
              <div
                key={r.uid}
                className={`flex items-center gap-3 px-4 py-3 ${r.uid === user?.uid ? 'bg-base-800' : ''}`}
              >
                <span className="text-caption text-content-muted w-6 shrink-0">{i + 1}</span>
                <span className="flex-1 text-body-sm text-content-primary truncate">
                  {r.displayName}
                  {r.uid === user?.uid && <span className="text-content-muted"> (you)</span>}
                  {owners.includes(r.uid) && (
                    <Badge variant="secondary" className="ml-2 align-middle">Owner</Badge>
                  )}
                </span>
                {isOwner && r.uid !== user?.uid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => toggleOwner(r.uid, owners.includes(r.uid) ? 'demote' : 'promote')}
                    className="shrink-0 text-content-muted"
                  >
                    {owners.includes(r.uid) ? 'Remove owner' : 'Make owner'}
                  </Button>
                )}
                <span className="text-body-sm text-content-secondary shrink-0">
                  {/* Not having started is not the same as scoring zero (A18). */}
                  {r.accuracy === null
                    ? <span className="text-content-muted">No practice yet</span>
                    : `${r.accuracy}% of ${r.questionsAnswered}`}
                </span>
              </div>
            ))}
          </Card>
          <p className="text-caption text-content-muted mt-3">
            Accuracy across every practice test taken since joining. Ties break toward more questions answered.
          </p>

          <div className="mt-6">
            {isOwner ? (
              <Button variant="ghost" onClick={destroy} disabled={busy} className="text-error-400">
                <Trash2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Delete class
              </Button>
            ) : (
              <Button variant="ghost" onClick={leave} disabled={busy} className="text-content-muted">
                <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Leave class
              </Button>
            )}
          </div>
        </>
      )}
    </Shell>
  );
}
