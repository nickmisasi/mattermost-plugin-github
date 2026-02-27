// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ChevronLeftIcon} from '@primer/octicons-react';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {makeStyleFromTheme, changeOpacity} from 'mattermost-redux/utils/theme_utils';

import {PRReviewSummary} from '../../../types/github_types';

type Props = {
    title: string;
    prNumber: number;
    prUrl: string;
    summary: PRReviewSummary | null;
    onBack: () => void;
    theme: Theme;
};

const PRReviewDetailHeader: React.FC<Props> = ({title, prNumber, prUrl, summary, onBack, theme}) => {
    const style = getStyle(theme);

    return (
        <div style={style.container}>
            <button
                style={style.backButton}
                onClick={onBack}
            >
                <ChevronLeftIcon size={16}/>
                {'Back'}
            </button>
            <div style={style.titleRow}>
                <a
                    href={prUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={style.titleLink}
                >
                    {title + ' #' + prNumber}
                </a>
            </div>
            {summary && (
                <div style={style.summaryRow}>
                    <span style={style.approvedCount}>
                        {summary.approved + ' approved'}
                    </span>
                    <span style={style.dotSeparator}/>
                    <span style={style.changesRequestedCount}>
                        {summary.changes_requested + ' changes requested'}
                    </span>
                    <span style={style.dotSeparator}/>
                    <span style={style.unresolvedCount}>
                        {summary.unresolved_threads + ' unresolved threads'}
                    </span>
                </div>
            )}
        </div>
    );
};

const getStyle = makeStyleFromTheme((theme) => {
    return {
        container: {
            padding: '16px',
            borderBottom: `1px solid ${changeOpacity(theme.centerChannelColor, 0.2)}`,
        },
        backButton: {
            background: 'none',
            border: 'none',
            color: theme.linkColor,
            cursor: 'pointer',
            padding: '4px 8px',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: 400,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            borderRadius: '4px',
        },
        titleRow: {
            marginBottom: '8px',
        },
        titleLink: {
            color: theme.centerChannelColor,
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '1.4',
            textDecoration: 'none',
        },
        summaryRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            flexWrap: 'wrap',
        },
        approvedCount: {
            color: theme.onlineIndicator,
            fontWeight: 600,
        },
        changesRequestedCount: {
            color: theme.dndIndicator,
            fontWeight: 600,
        },
        unresolvedCount: {
            color: changeOpacity(theme.centerChannelColor, 0.7),
            fontWeight: 600,
        },
        dotSeparator: {
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.3),
            display: 'inline-block',
        },
    };
});

export default PRReviewDetailHeader;
