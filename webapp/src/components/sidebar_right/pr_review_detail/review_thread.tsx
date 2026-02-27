// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback} from 'react';

import {ChevronRightIcon} from '@primer/octicons-react';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import {ReviewThreadData} from '../../../types/github_types';

import DiffHunkDisplay from './diff_hunk_display';
import ReviewComment from './review_comment';
import ReplyBox from './reply_box';

type Props = {
    thread: ReviewThreadData;
    selectedCommentIds: Set<string>;
    onToggleComment: (commentId: string) => void;
    replyToReviewComment: (owner: string, repo: string, number: number, commentId: number, body: string) => Promise<any>;
    toggleReaction: (owner: string, repo: string, commentId: number, reaction: string) => Promise<any>;
    resolveThread: (threadId: string, action: string) => Promise<any>;
    theme: Theme;
    owner: string;
    repo: string;
    prNumber: number;
};

const StyledCheckbox: React.FC<{checked: boolean; onChange: () => void; onClick?: (e: React.MouseEvent) => void; theme: Theme}> = ({checked, onChange, onClick, theme}) => (
    <div
        style={{position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer'}}
        onClick={(e) => {
            e.stopPropagation();
            if (onClick) {
                onClick(e);
            }
            onChange();
        }}
    >
        <input
            type='checkbox'
            checked={checked}
            readOnly={true}
            style={{position: 'absolute', opacity: 0, width: '16px', height: '16px', cursor: 'pointer', margin: 0, pointerEvents: 'none'}}
        />
        <div
            style={{
                width: '16px',
                height: '16px',
                borderRadius: '3px',
                cursor: 'pointer',
                border: checked ? `2px solid ${theme.buttonBg}` : `2px solid ${changeOpacity(theme.centerChannelColor, 0.3)}`,
                backgroundColor: checked ? theme.buttonBg : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {checked && (
                <svg
                    width='10'
                    height='8'
                    viewBox='0 0 10 8'
                    fill='none'
                >
                    <path
                        d='M1 4L3.5 6.5L9 1'
                        stroke='white'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                </svg>
            )}
        </div>
    </div>
);

const ReviewThread: React.FC<Props> = ({
    thread,
    selectedCommentIds,
    onToggleComment,
    replyToReviewComment,
    toggleReaction,
    resolveThread,
    theme,
    owner,
    repo,
    prNumber,
}) => {
    const [expandedResolved, setExpandedResolved] = useState(false);

    const isResolved = thread.is_resolved;
    const isCollapsed = isResolved && !expandedResolved;

    const firstComment = thread.comments?.[0];
    const threadCommentId = firstComment?.id || thread.id;
    const isSelected = selectedCommentIds.has(threadCommentId);

    const handleReply = useCallback(async (body: string) => {
        if (!firstComment) {
            return Promise.resolve();
        }
        return replyToReviewComment(owner, repo, prNumber, firstComment.database_id, body);
    }, [replyToReviewComment, owner, repo, prNumber, firstComment]);

    const handleResolveToggle = useCallback(async () => {
        const action = isResolved ? 'unresolve' : 'resolve';
        return resolveThread(thread.id, action);
    }, [resolveThread, thread.id, isResolved]);

    const handleCheckboxChange = useCallback(() => {
        onToggleComment(threadCommentId);
    }, [onToggleComment, threadCommentId]);

    if (isCollapsed) {
        return (
            <div
                style={{
                    ...styles.resolvedCollapsed,
                    backgroundColor: changeOpacity(theme.centerChannelColor, 0.03),
                    borderLeft: `2px solid ${changeOpacity(theme.centerChannelColor, 0.2)}`,
                }}
                onClick={() => setExpandedResolved(true)}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1}}>
                    <StyledCheckbox
                        checked={isSelected}
                        onChange={handleCheckboxChange}
                        onClick={(e) => e.stopPropagation()}
                        theme={theme}
                    />
                    <span
                        style={{
                            ...styles.resolvedLabel,
                            color: changeOpacity(theme.centerChannelColor, 0.5),
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {'Resolved thread'}
                        {thread.resolved_by ? ` by ${thread.resolved_by}` : ''}
                        {' - '}
                        {firstComment?.body ? firstComment.body.substring(0, 80) + (firstComment.body.length > 80 ? '...' : '') : ''}
                    </span>
                </div>
                <span style={{color: changeOpacity(theme.centerChannelColor, 0.4), display: 'inline-flex', flexShrink: 0}}>
                    <ChevronRightIcon size={16}/>
                </span>
            </div>
        );
    }

    return (
        <div
            style={{
                ...styles.container,
                backgroundColor: isResolved ? changeOpacity(theme.centerChannelColor, 0.03) : 'transparent',
                borderLeft: `2px solid ${isResolved ? changeOpacity(theme.centerChannelColor, 0.2) : changeOpacity(theme.buttonBg, 0.5)}`,
            }}
        >
            <div style={styles.threadHeader}>
                <StyledCheckbox
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    theme={theme}
                />
                {isResolved && (
                    <span
                        style={{
                            ...styles.resolvedBadge,
                            backgroundColor: changeOpacity(theme.onlineIndicator, 0.1),
                            color: changeOpacity(theme.onlineIndicator, 0.8),
                        }}
                    >
                        {'Resolved'}
                    </span>
                )}
            </div>

            {firstComment?.diff_hunk && (
                <DiffHunkDisplay
                    diffHunk={firstComment.diff_hunk}
                    theme={theme}
                />
            )}

            {thread.comments.map((comment) => (
                <ReviewComment
                    key={comment.id}
                    comment={comment}
                    toggleReaction={toggleReaction}
                    owner={owner}
                    repo={repo}
                    theme={theme}
                />
            ))}

            <div style={styles.threadActions}>
                <button
                    style={{
                        ...styles.resolveButton,
                        ...(isResolved ? {
                            color: changeOpacity(theme.centerChannelColor, 0.6),
                            border: `1px solid ${changeOpacity(theme.centerChannelColor, 0.3)}`,
                        } : {
                            color: theme.buttonColor,
                            backgroundColor: theme.buttonBg,
                            border: `1px solid ${theme.buttonBg}`,
                        }),
                    }}
                    onClick={handleResolveToggle}
                >
                    {isResolved ? 'Unresolve' : 'Resolve'}
                </button>
                {isResolved && (
                    <button
                        style={{...styles.collapseButton, color: changeOpacity(theme.centerChannelColor, 0.5)}}
                        onClick={() => setExpandedResolved(false)}
                    >
                        {'Collapse'}
                    </button>
                )}
            </div>

            <ReplyBox
                onSubmit={handleReply}
                theme={theme}
            />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        padding: '10px 12px',
        marginBottom: '8px',
        borderRadius: '4px',
    },
    resolvedCollapsed: {
        padding: '8px 12px',
        marginBottom: '8px',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resolvedLabel: {
        fontSize: '12px',
        fontStyle: 'italic',
    },
    threadHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
    },
    resolvedBadge: {
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '10px',
    },
    threadActions: {
        display: 'flex',
        gap: '8px',
        marginTop: '8px',
    },
    resolveButton: {
        padding: '3px 10px',
        borderRadius: '4px',
        background: 'transparent',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    collapseButton: {
        padding: '3px 10px',
        borderRadius: '4px',
        background: 'transparent',
        border: 'none',
        fontSize: '12px',
        cursor: 'pointer',
    },
};

export default ReviewThread;
