import React, { useState } from 'react';

const statusBadge = (status) => <span className={`badge badge-${status}`}>{status}</span>;
const categoryLabel = (cat) => cat?.replace(/_/g, ' ') || 'Other';
const canForward = { admin: true, controller: true, coordinator: true, vc: false };

const actionLabels = {
    submitted: { icon: '📤', label: 'Submitted' },
    approved: { icon: '✅', label: 'Approved' },
    rejected: { icon: '❌', label: 'Rejected' },
    forwarded: { icon: '➡️', label: 'Forwarded' },
    reviewed: { icon: '👁', label: 'Reviewed' },
};

export default function ApplicationDetailModal({ app, role, onClose, onAction }) {
    const [comment, setComment] = useState('');
    const [confirming, setConfirming] = useState(null);

    const isStaff = role !== 'student';
    // const alreadyActed = isStaff && role !== 'vc' && app.currentRole !== role;
    // const canAct = isStaff && app.currentRole === role;
    // const canAct = isStaff && app.currentRole === role && app.status === 'pending';

    // const isFinal = app.status === 'approved' || app.status === 'rejected';

    // const canAct =
    //     role === 'vc' ||                // 👈 VC always allowed
    //     (!isFinal && app.currentRole === role);

    // const canAct =
    //     role === 'vc' || app.currentRole === role;

    const roleKeyMap = {
        admin: 'adminStatus',
        controller: 'controllerStatus',
        coordinator: 'coordinatorStatus',
        vc: 'vcStatus'
    };

    const currentStatus = app[roleKeyMap[role]];

    // final state
    const isFinal = app.status === 'approved' || app.status === 'rejected';

    // const canAct =
    //     role === 'vc'
    //         ? !isFinal   // VC sirf final hone tak act kare
    //         : app.currentRole === role && app[roleKeyMap[role]] === 'pending';

    const hasVcActed =
    app.vcStatus === 'approved' ||
    app.vcStatus === 'rejected';

const canAct =
    role === 'vc'
        ? !hasVcActed   // VC jab tak act na kare, button dikhao (even if rejected)
        : !isFinal && app.currentRole === role;

    // const canAct =
    //     !isFinal &&
    //     (
    //         role === 'vc' ||           // VC anytime
    //         app.currentRole === role   // normal role
    //     );






    const handleAction = (action) => {
        if (!confirming) { setConfirming(action); return; }
        onAction(app._id, action, comment);
        setConfirming(null);
        setComment('');
    };

    const perRoleStatus = [
        { role: 'Admin', key: 'adminStatus' },
        { role: 'Controller', key: 'controllerStatus' },
        { role: 'Coordinator', key: 'coordinatorStatus' },
        { role: 'VC', key: 'vcStatus' },
    ];


    // New addition for button hide when VC approve 
    // const canTakeAction =
    //     role === 'vc' || app.currentRole === role;
    // // && app.status === 'pending';

    // const canTakeAction =
    //     !isFinal && (
    //         role === 'vc' || app.currentRole === role
    //     );

    const currentLevel =
        app.currentRole ||
        app.lastActionRole ||
        (app.status === 'approved' || app.status === 'rejected'
            ? 'Completed'
            : 'Pending');

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem' }}>📂 Application Details</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: 4 }}>{app.title}</h4>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {statusBadge(app.status)}
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                📁 {categoryLabel(app.category)}
                            </span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(app.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                </div>

                {role !== 'student' && (
                    <div style={{ background: 'var(--bg-card-2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student Info</div>
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Name: </span><strong style={{ fontSize: '0.88rem' }}>{app.studentName}</strong></div>
                            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ID: </span><strong style={{ fontSize: '0.88rem' }}>{app.studentId || '—'}</strong></div>
                            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Email: </span><strong style={{ fontSize: '0.88rem' }}>{app.studentEmail}</strong></div>
                        </div>
                    </div>
                )}

                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</div>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{app.description}</p>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approval Pipeline</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {perRoleStatus.map(({ role: r, key }) => {
                            const s = app[key];
                            const color = s === 'approved' ? 'var(--success)' : s === 'rejected' ? 'var(--danger)' : s === 'forwarded' ? 'var(--primary)' : s === 'not_reached' ? 'var(--border-light)' : 'var(--warning)';
                            return (
                                <div key={key} style={{ flex: 1, minWidth: 80, background: 'var(--bg-card-2)', border: `1px solid ${color}22`, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{r}</div>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'capitalize' }}>
                                        {s === 'not_reached' ? '—' : s}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Activity Timeline</div>
                    {app.history?.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No activity yet</p>
                    ) : (
                        <ul className="timeline">
                            {app.history?.map((h, i) => {
                                const { icon, label } = actionLabels[h.action] || { icon: '•', label: h.action };
                                return (
                                    <li key={i} className={`timeline-item ${h.action}`}>
                                        <div className="timeline-header">{icon} {label} by <strong>{h.actorRole || h.role || 'unknown'}</strong> <span className="role-tag" style={{ textTransform: 'capitalize' }}>{h.actorRole || h.role || 'unknown'}</span></div>
                                        <div className="timeline-meta">{new Date(h.timestamp || h.createdAt).toLocaleString()}</div>
                                        {(h.comment || h.message) && <div className="timeline-comment">"{h.comment || h.message}"</div>}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* {isStaff && alreadyActed && app.status === 'pending' && ( */}
                {/* {canAct && app.status !== 'pending' && ( */}
                {/* {canAct && ( */}
                {/* {isStaff && canAct && ( */}
                {/* {isStaff && (canAct || role === 'vc') && ( */}
                {/* {isStaff && canTakeAction && ( */}
                {isStaff && canAct && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Take Action</div>
                        {confirming && (
                            <div style={{ marginBottom: 12 }}>
                                <div className="form-group" style={{ marginBottom: 8 }}>
                                    <label>Add a Comment (optional)</label>
                                    <textarea className="form-control" rows={2} placeholder="Add a reason or note..." value={comment} onChange={e => setComment(e.target.value)} />
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className={`btn btn-sm ${confirming === 'approved' ? 'btn-success' : confirming === 'rejected' ? 'btn-danger' : 'btn-primary'}`} onClick={() => handleAction(confirming)}>
                                        ✓ Confirm {confirming}
                                    </button>
                                    <button className="btn btn-outline btn-sm" onClick={() => { setConfirming(null); setComment(''); }}>Cancel</button>
                                </div>
                            </div>
                        )}

                        {/* {!confirming && canTakeAction && ( */}
                        {/* {!confirming && (role === 'vc' || app.currentRole === role) && ( */}
                        {!confirming && canAct && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button className="btn btn-success btn-sm" onClick={() => handleAction('approved')}>✅ Approve</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleAction('rejected')}>❌ Reject</button>
                                {canForward[role] && (
                                    <button className="btn btn-primary btn-sm" onClick={() => handleAction('forwarded')}>➡️ Forward</button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* {isStaff && alreadyActed && ( */}
                {/* {isStaff && canAct && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            ℹ️ This application is currently at the <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{app.currentRole
                                        ? app.currentRole
                                        : app.lastActionRole
                                            ? app.lastActionRole
                                            : '-'}</strong> level.
                        </p>
                    </div>
                )} */}

                {/* {isStaff && app.status !== 'pending' && !alreadyActed && ( */}
                {/* {isStaff && app.status === 'pending' && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            This application has been <strong style={{ textTransform: 'capitalize' }}>{app.status}</strong>.
                        </p>
                    </div>
                )} */}

                {/* {isStaff && !canAct && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            ℹ️ This application is currently at
                            <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>
                                {' '}
                                {
                                    app.currentRole
                                        ? app.currentRole
                                        : app.lastActionRole
                                            ? app.lastActionRole
                                            : '-'
                                }

                            </strong> level.
                        </p>
                    </div>
                )} */}

                {/* {isStaff && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            ℹ️ This application is currently at the{' '}
                            <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>
                                {app.currentRole || app.lastActionRole || '-'}
                            </strong>{' '}
                            level.
                        </p>
                    </div>
                )} */}

                {isStaff && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            ℹ️ This application is currently at the{' '}
                            <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>
                                {currentLevel}
                            </strong>{' '}
                            level.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}