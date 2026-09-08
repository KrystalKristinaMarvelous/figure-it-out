"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Copy, Trash2, X } from "lucide-react";
import type { ProjectInviteRow } from "@/lib/supabase/database.types";
import type { ResolvedTask, TeamMember } from "@/lib/data-collab";
import {
  createInvite,
  revokeInvite,
  removeMember,
  setMemberRole,
  leaveProject,
  createTask,
  updateTask,
  setTaskState,
  deleteTask,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/field";
import { initials } from "@/lib/utils";

interface Props {
  projectId: string;
  projectTitle: string;
  isOwner: boolean;
  myUserId: string;
  roster: TeamMember[];
  invites: { view: ProjectInviteRow | null; edit: ProjectInviteRow | null };
  tasks: ResolvedTask[];
  modules: { id: string; name: string }[];
}

const STATE_LABEL: Record<string, string> = { todo: "To do", doing: "Doing", done: "Done" };
const NEXT_STATE: Record<string, "todo" | "doing" | "done"> = {
  todo: "doing",
  doing: "done",
  done: "todo",
};

export function TeamClient(props: Props) {
  const { isOwner } = props;
  const collaborators = props.roster.filter((m) => m.role !== "owner");
  const myTasks = props.tasks.filter((t) => t.assignee_id === props.myUserId);

  return (
    <div className="space-y-12">
      {isOwner && <ShareLinks projectId={props.projectId} invites={props.invites} />}

      {/* roster */}
      <section>
        <p className="eyebrow mb-3">
          {props.roster.length} {props.roster.length === 1 ? "person" : "people"}
        </p>
        <div className="well hairline-x px-4">
          {props.roster.map((m) => (
            <MemberRow
              key={m.userId}
              projectId={props.projectId}
              member={m}
              isOwner={isOwner}
              isMe={m.userId === props.myUserId}
            />
          ))}
        </div>
        {!isOwner && (
          <LeaveButton projectId={props.projectId} />
        )}
      </section>

      {/* my tasks — collaborators */}
      {!isOwner && (
        <section>
          <p className="eyebrow mb-3">Assigned to you</p>
          {myTasks.length === 0 ? (
            <p className="voice text-[13px] text-muted">
              Nothing yet. The owner assigns work here, and then you can edit those modules.
            </p>
          ) : (
            <div className="hairline-x framed">
              {myTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  projectId={props.projectId}
                  task={t}
                  canEditState
                  canManage={false}
                  modules={props.modules}
                  roster={collaborators}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* full checklist */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="eyebrow">Checklist</p>
          <span className="mono text-[10px] uppercase tracking-[0.06em] text-faint">
            {props.tasks.filter((t) => t.state === "done").length}/{props.tasks.length} done
          </span>
        </div>

        {isOwner && (
          <NewTask
            projectId={props.projectId}
            modules={props.modules}
            roster={collaborators}
          />
        )}

        {props.tasks.length === 0 ? (
          <p className="voice mt-4 text-[13px] text-muted">No tasks on the checklist yet.</p>
        ) : (
          <div className="hairline-x framed mt-2">
            {props.tasks.map((t) => (
              <TaskRow
                key={t.id}
                projectId={props.projectId}
                task={t}
                canEditState={isOwner || t.assignee_id === props.myUserId}
                canManage={isOwner}
                modules={props.modules}
                roster={collaborators}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── share links ─────────────────────────────────────────────────────────── */
function ShareLinks({
  projectId,
  invites,
}: {
  projectId: string;
  invites: { view: ProjectInviteRow | null; edit: ProjectInviteRow | null };
}) {
  return (
    <section>
      <p className="eyebrow mb-3">Share links</p>
      <div className="space-y-3">
        <LinkRow
          projectId={projectId}
          access="view"
          invite={invites.view}
          blurb="Read-only. Anyone signed in who opens it can see everything."
        />
        <LinkRow
          projectId={projectId}
          access="edit"
          invite={invites.edit}
          blurb="Lets someone join as an editor. They still only edit what you assign them."
        />
      </div>
    </section>
  );
}

function LinkRow({
  projectId,
  access,
  invite,
  blurb,
}: {
  projectId: string;
  access: "view" | "edit";
  invite: ProjectInviteRow | null;
  blurb: string;
}) {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const url = invite ? `${origin}/join/${invite.token}` : "";

  return (
    <div className="well px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-medium text-ink">
          {access === "view" ? "View link" : "Edit link"}
        </span>
        {invite ? (
          <button
            className="mono text-[10px] uppercase tracking-[0.05em] text-faint hover:text-accent-ink disabled:opacity-40"
            disabled={pending}
            onClick={() => start(() => revokeInvite(projectId, invite.id).then(() => {}))}
          >
            Turn off
          </button>
        ) : (
          <Button
            size="xs"
            variant="outline"
            disabled={pending}
            onClick={() => start(() => createInvite(projectId, access).then(() => {}))}
          >
            Create link
          </Button>
        )}
      </div>
      <p className="voice mt-1 text-[12px] text-muted">{blurb}</p>
      {invite && (
        <div className="mt-2.5 flex items-center gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="fio-field min-w-0 flex-1 rounded-[var(--radius-sm)] border border-hairline bg-paper px-2.5 py-1.5 mono text-[11px] text-muted"
          />
          <button
            aria-label="Copy link"
            className="pressable grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-hairline text-muted hover:text-accent-ink"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
              } catch {
                /* ignore */
              }
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── members ─────────────────────────────────────────────────────────────── */
function MemberRow({
  projectId,
  member,
  isOwner,
  isMe,
}: {
  projectId: string;
  member: TeamMember;
  isOwner: boolean;
  isMe: boolean;
}) {
  const [pending, start] = useTransition();
  const name =
    member.profile?.display_name || member.profile?.username || "Someone";

  return (
    <div className="-mx-4 flex items-center gap-3 px-4 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-hairline bg-sunken text-[11px] text-muted">
        {member.profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.profile.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          initials(name)
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-ink">
          {name} {isMe && <span className="text-faint">· you</span>}
        </span>
        {member.profile?.username && (
          <span className="mono block truncate text-[10.5px] text-faint">
            @{member.profile.username}
          </span>
        )}
      </span>

      {member.role === "owner" ? (
        <span className="mono text-[10px] uppercase tracking-[0.06em] text-faint">Owner</span>
      ) : isOwner ? (
        <div className="flex items-center gap-2">
          <select
            value={member.role}
            disabled={pending}
            onChange={(e) =>
              start(() =>
                setMemberRole(projectId, member.userId, e.target.value as "editor" | "viewer").then(
                  () => {},
                ),
              )
            }
            className="fio-field h-7 cursor-pointer rounded-[var(--radius-sm)] border border-hairline bg-paper px-2 text-[11px] text-muted"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            aria-label={`Remove ${name}`}
            disabled={pending}
            className="text-faint hover:text-accent-ink disabled:opacity-40"
            onClick={() => {
              if (confirm(`Remove ${name} from this project?`))
                start(() => removeMember(projectId, member.userId).then(() => {}));
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <span className="mono text-[10px] uppercase tracking-[0.06em] text-faint">
          {member.role}
        </span>
      )}
    </div>
  );
}

function LeaveButton({ projectId }: { projectId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="mt-3 text-[11.5px] text-muted hover:text-accent-ink disabled:opacity-40"
      disabled={pending}
      onClick={() => {
        if (confirm("Leave this project? You'll lose access until you're invited again."))
          start(() => leaveProject(projectId).then(() => {}));
      }}
    >
      Leave this project
    </button>
  );
}

/* ── checklist ───────────────────────────────────────────────────────────── */
function NewTask({
  projectId,
  modules,
  roster,
}: {
  projectId: string;
  modules: { id: string; name: string }[];
  roster: TeamMember[];
}) {
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [pmId, setPmId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  function submit() {
    if (!title.trim()) return;
    start(async () => {
      await createTask(projectId, { title, pmId, assigneeId });
      setTitle("");
      setPmId("");
      setAssigneeId("");
    });
  }

  return (
    <div className="well space-y-2.5 px-4 py-3.5">
      <Input
        placeholder="What needs doing?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
      />
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div>
          <Label className="mb-1">Module</Label>
          <Select value={pmId} onChange={(e) => setPmId(e.target.value)}>
            <option value="">— any / none —</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label className="mb-1">Assign to</Label>
          <Select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">— unassigned —</option>
            {roster.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.profile?.display_name || m.profile?.username || "Someone"}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <p className="voice text-[11.5px] text-faint">
        Assigning a module to someone is what lets them edit its entries.
      </p>
      <Button size="sm" variant="primary" disabled={pending || !title.trim()} onClick={submit}>
        Add to checklist
      </Button>
    </div>
  );
}

function TaskRow({
  projectId,
  task,
  canEditState,
  canManage,
  modules,
  roster,
}: {
  projectId: string;
  task: ResolvedTask;
  canEditState: boolean;
  canManage: boolean;
  modules: { id: string; name: string }[];
  roster: TeamMember[];
}) {
  const [pending, start] = useTransition();
  const assigneeName =
    task.assignee?.display_name || task.assignee?.username || null;

  return (
    <div className="flex items-start gap-3 py-3">
      <button
        aria-label={`Mark ${STATE_LABEL[NEXT_STATE[task.state]]}`}
        disabled={!canEditState || pending}
        onClick={() =>
          start(() => setTaskState(projectId, task.id, NEXT_STATE[task.state]).then(() => {}))
        }
        className={`mono mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[9.5px] uppercase tracking-[0.05em] transition-colors ${
          task.state === "done"
            ? "border-accent bg-accent text-white"
            : task.state === "doing"
              ? "border-accent text-accent-ink"
              : "border-hairline text-muted"
        } ${canEditState ? "hover:border-accent" : "cursor-default opacity-70"}`}
      >
        {STATE_LABEL[task.state]}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-[13px] ${
            task.state === "done" ? "text-faint line-through" : "text-ink"
          }`}
        >
          {task.title}
        </p>
        {task.detail && (
          <p className="voice mt-0.5 text-[12px] text-muted">{task.detail}</p>
        )}
        <div className="mono mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] uppercase tracking-[0.05em] text-faint">
          {task.moduleName && <span>{task.moduleName}</span>}
          {task.moduleName && assigneeName && <span aria-hidden>·</span>}
          {assigneeName ? <span>{assigneeName}</span> : <span>unassigned</span>}
        </div>

        {canManage && (
          <div className="mt-2 flex flex-wrap gap-2">
            <select
              value={task.project_module_id ?? ""}
              disabled={pending}
              onChange={(e) =>
                start(() => updateTask(projectId, task.id, { pmId: e.target.value }).then(() => {}))
              }
              className="fio-field h-7 cursor-pointer rounded-[var(--radius-sm)] border border-hairline bg-paper px-2 text-[11px] text-muted"
            >
              <option value="">no module</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={task.assignee_id ?? ""}
              disabled={pending}
              onChange={(e) =>
                start(() =>
                  updateTask(projectId, task.id, { assigneeId: e.target.value }).then(() => {}),
                )
              }
              className="fio-field h-7 cursor-pointer rounded-[var(--radius-sm)] border border-hairline bg-paper px-2 text-[11px] text-muted"
            >
              <option value="">unassigned</option>
              {roster.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.profile?.display_name || m.profile?.username || "Someone"}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {canManage && (
        <button
          aria-label="Delete task"
          disabled={pending}
          className="mt-0.5 text-faint hover:text-accent-ink disabled:opacity-40"
          onClick={() => {
            if (confirm("Delete this task?"))
              start(() => deleteTask(projectId, task.id).then(() => {}));
          }}
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
