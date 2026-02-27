// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';

import {PersonIcon} from '@primer/octicons-react';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import {ReviewCommentData} from '../../../types/github_types';
import {formatTimeSince} from '../../../utils/date_utils';

import ReactionBar from './reaction_bar';

function renderMarkdown(body: string): string {
    if (!body) {
        return '';
    }

    let html = body;

    // Escape HTML entities first to prevent injection
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks (triple backticks) — must be done before inline code
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
        return '<pre><code>' + code + '</code></pre>';
    });

    // Inline code (single backticks)
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // Bold (**text**)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic (*text*) — but not inside already-handled bold
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks (newlines → <br> but not inside pre blocks)
    // Split by pre blocks, only add <br> outside them
    const parts = html.split(/(<pre>[\s\S]*?<\/pre>)/g);
    html = parts.map((part) => {
        if (part.startsWith('<pre>')) {
            return part;
        }
        return part.replace(/\n/g, '<br>');
    }).join('');

    return html;
}

type Props = {
    comment: ReviewCommentData;
    toggleReaction: (owner: string, repo: string, commentId: number, reaction: string) => Promise<any>;
    owner: string;
    repo: string;
    theme: Theme;
};

const MARKDOWN_STYLES = `
.review-comment-body code {
    font-family: SFMono-Regular, Consolas, monospace;
    background: rgba(0,0,0,0.06);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 12px;
}
.review-comment-body pre {
    background: rgba(0,0,0,0.04);
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
}
.review-comment-body pre code {
    background: none;
    padding: 0;
}
.review-comment-body a {
    color: inherit;
    text-decoration: underline;
}
`;

const ReviewComment: React.FC<Props> = ({comment, toggleReaction, owner, repo, theme}) => {
    const handleToggleReaction = useCallback((content: string) => {
        return toggleReaction(owner, repo, comment.database_id, content);
    }, [toggleReaction, owner, repo, comment.database_id]);

    const timeSince = formatTimeSince(comment.created_at);

    const authorLogin = comment.author_login;
    const avatarUrl = authorLogin ? `https://github.com/${authorLogin}.png?size=40` : '';

    return (
        <div style={{...styles.container, borderBottom: `1px solid ${changeOpacity(theme.centerChannelColor, 0.1)}`}}>
            <style>{MARKDOWN_STYLES}</style>
            <div style={styles.header}>
                {authorLogin ? (
                    <img
                        src={avatarUrl}
                        alt={authorLogin}
                        style={styles.avatar}
                    />
                ) : (
                    <div
                        style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: changeOpacity(theme.centerChannelColor, 0.15),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <span style={{color: changeOpacity(theme.centerChannelColor, 0.5), display: 'inline-flex'}}>
                            <PersonIcon size={12}/>
                        </span>
                    </div>
                )}
                <strong style={{fontSize: '14px', fontWeight: 600, color: theme.centerChannelColor}}>
                    {authorLogin || 'GitHub User'}
                </strong>
                <span style={{...styles.timestamp, color: changeOpacity(theme.centerChannelColor, 0.6)}}>
                    {timeSince + ' ago'}
                </span>
            </div>
            <div
                className='review-comment-body'
                style={{...styles.body, color: theme.centerChannelColor}}
                dangerouslySetInnerHTML={{__html: renderMarkdown(comment.body)}}
            />
            {comment.reactions && comment.reactions.length > 0 && (
                <ReactionBar
                    reactions={comment.reactions}
                    onToggleReaction={handleToggleReaction}
                    theme={theme}
                />
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        padding: '8px 0',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '4px',
    },
    avatar: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
    },
    timestamp: {
        fontSize: '12px',
        marginLeft: '6px',
    },
    body: {
        fontSize: '14px',
        lineHeight: '1.5',
        wordBreak: 'break-word',
    },
};

export default ReviewComment;
