// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState, useCallback} from 'react';
import Scrollbars from 'react-custom-scrollbars-2';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import {SelectedPRData, PRReviewThreadsData, ReviewThreadData, AIAgent} from '../../../types/github_types';

import {renderView, renderThumbHorizontal, renderThumbVertical} from '../sidebar_right';

import PRReviewDetailHeader from './pr_review_detail_header';
import FileGroup from './file_group';
import AIAssignBar from './ai_assign_bar';

type Props = {
    selectedPR: SelectedPRData | null;
    threads: PRReviewThreadsData | null;
    threadsGroupedByFile: Record<string, ReviewThreadData[]>;
    loading: boolean;
    aiAgents: AIAgent[];
    theme: Theme;
    actions: {
        clearSelectedPR: () => void;
        getPRReviewThreads: (owner: string, repo: string, number: number) => Promise<any>;
        replyToReviewComment: (owner: string, repo: string, number: number, commentId: number, body: string) => Promise<any>;
        toggleReaction: (owner: string, repo: string, commentId: number, reaction: string) => Promise<any>;
        resolveThread: (threadId: string, action: string) => Promise<any>;
        postAIAssignment: (owner: string, repo: string, number: number, body: string) => Promise<any>;
        getAIAgents: () => Promise<any>;
    };
};

const PRReviewDetail: React.FC<Props> = ({
    selectedPR,
    threads,
    threadsGroupedByFile,
    loading,
    aiAgents,
    theme,
    actions,
}) => {
    const [selectedCommentIds, setSelectedCommentIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (selectedPR) {
            actions.getPRReviewThreads(selectedPR.owner, selectedPR.repo, selectedPR.number);
            actions.getAIAgents();
        }
    }, [selectedPR?.owner, selectedPR?.repo, selectedPR?.number]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleToggleComment = useCallback((commentId: string) => {
        setSelectedCommentIds((prev) => {
            const next = new Set(prev);
            if (next.has(commentId)) {
                next.delete(commentId);
            } else {
                next.add(commentId);
            }
            return next;
        });
    }, []);

    const handleAIAssign = useCallback((agentMention: string) => {
        if (selectedCommentIds.size === 0 || !selectedPR) {
            return;
        }

        // Build a comment body mentioning the agent and referencing selected comment IDs
        const commentRefs = Array.from(selectedCommentIds).join(', ');
        const body = `${agentMention} Please review the following comment threads: ${commentRefs}`;

        actions.postAIAssignment(selectedPR.owner, selectedPR.repo, selectedPR.number, body);
        setSelectedCommentIds(new Set());
    }, [selectedCommentIds, actions, selectedPR]);

    if (!selectedPR) {
        return null;
    }

    const summary = threads?.summary || null;
    const title = threads?.pr_title || selectedPR.title;
    const prUrl = threads?.pr_url || selectedPR.url;
    const filePaths = Object.keys(threadsGroupedByFile).sort();

    return (
        <div style={styles.outerContainer}>
            <div style={styles.headerWrapper}>
                <PRReviewDetailHeader
                    title={title}
                    prNumber={selectedPR.number}
                    prUrl={prUrl}
                    summary={summary}
                    onBack={actions.clearSelectedPR}
                    theme={theme}
                />
            </div>
            <div style={styles.scrollWrapper}>
                <Scrollbars
                    autoHide={true}
                    autoHideTimeout={500}
                    autoHideDuration={500}
                    renderThumbHorizontal={renderThumbHorizontal}
                    renderThumbVertical={renderThumbVertical}
                    renderView={renderView}
                    style={{flex: 1}}
                >
                    {loading && (
                        <div style={styles.loadingContainer}>
                            <svg
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                            >
                                <circle
                                    cx='12'
                                    cy='12'
                                    r='10'
                                    fill='none'
                                    stroke={changeOpacity(theme.centerChannelColor, 0.15)}
                                    strokeWidth='3'
                                />
                                <circle
                                    cx='12'
                                    cy='12'
                                    r='10'
                                    fill='none'
                                    stroke={theme.buttonBg}
                                    strokeWidth='3'
                                    strokeDasharray='30 70'
                                    strokeLinecap='round'
                                >
                                    <animateTransform
                                        attributeName='transform'
                                        type='rotate'
                                        from='0 12 12'
                                        to='360 12 12'
                                        dur='1s'
                                        repeatCount='indefinite'
                                    />
                                </circle>
                            </svg>
                            <span style={{color: changeOpacity(theme.centerChannelColor, 0.6), fontSize: '13px'}}>
                                {'Loading review threads...'}
                            </span>
                        </div>
                    )}
                    {!loading && filePaths.length === 0 && (
                        <div style={styles.emptyState}>
                            <span style={{color: changeOpacity(theme.centerChannelColor, 0.5), fontSize: '13px'}}>
                                {'No review threads found for this pull request.'}
                            </span>
                        </div>
                    )}
                    {!loading && filePaths.map((filePath) => (
                        <FileGroup
                            key={filePath}
                            filePath={filePath}
                            threads={threadsGroupedByFile[filePath]}
                            selectedCommentIds={selectedCommentIds}
                            onToggleComment={handleToggleComment}
                            replyToReviewComment={actions.replyToReviewComment}
                            toggleReaction={actions.toggleReaction}
                            resolveThread={actions.resolveThread}
                            theme={theme}
                            owner={selectedPR.owner}
                            repo={selectedPR.repo}
                            prNumber={selectedPR.number}
                        />
                    ))}
                </Scrollbars>
            </div>
            <AIAssignBar
                selectedCount={selectedCommentIds.size}
                agents={aiAgents}
                onAssign={handleAIAssign}
                theme={theme}
            />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    outerContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    headerWrapper: {
        flexShrink: 0,
    },
    scrollWrapper: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        gap: '12px',
    },
    emptyState: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
    },
};

export default PRReviewDetail;
