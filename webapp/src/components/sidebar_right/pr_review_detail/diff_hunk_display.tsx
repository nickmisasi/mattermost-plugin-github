// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

type Props = {
    diffHunk: string;
    theme: Theme;
};

const MAX_VISIBLE_LINES = 8;

const DiffHunkDisplay: React.FC<Props> = ({diffHunk, theme}) => {
    const [expanded, setExpanded] = useState(false);

    if (!diffHunk) {
        return null;
    }

    const lines = diffHunk.split('\n');
    const isLong = lines.length > MAX_VISIBLE_LINES;
    const visibleLines = expanded ? lines : lines.slice(0, MAX_VISIBLE_LINES);

    const getLineStyle = (line: string): React.CSSProperties => {
        if (line.startsWith('@@')) {
            return {backgroundColor: changeOpacity(theme.buttonBg, 0.08), color: changeOpacity(theme.centerChannelColor, 0.6)};
        }
        if (line.startsWith('+')) {
            return {backgroundColor: changeOpacity(theme.onlineIndicator, 0.1)};
        }
        if (line.startsWith('-')) {
            return {backgroundColor: changeOpacity(theme.dndIndicator, 0.1)};
        }
        return {};
    };

    const containerStyle: React.CSSProperties = {
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '8px',
        border: `1px solid ${changeOpacity(theme.centerChannelColor, 0.15)}`,
        backgroundColor: changeOpacity(theme.centerChannelColor, 0.03),
    };

    const preStyle: React.CSSProperties = {
        margin: 0,
        padding: '4px 0',
        fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
        fontSize: '11px',
        lineHeight: '1.4',
        overflowX: 'auto',
    };

    const lineStyle: React.CSSProperties = {
        padding: '0 8px',
        whiteSpace: 'pre',
    };

    const expandButtonStyle: React.CSSProperties = {
        display: 'block',
        width: '100%',
        padding: '4px',
        border: 'none',
        borderTop: `1px solid ${changeOpacity(theme.centerChannelColor, 0.08)}`,
        background: changeOpacity(theme.centerChannelColor, 0.04),
        cursor: 'pointer',
        fontSize: '11px',
        color: theme.linkColor,
        textAlign: 'center',
    };

    return (
        <div style={containerStyle}>
            <pre style={preStyle}>
                {visibleLines.map((line, idx) => (
                    <div
                        key={idx}
                        style={{...lineStyle, ...getLineStyle(line)}}
                    >
                        {line}
                    </div>
                ))}
            </pre>
            {isLong && !expanded && (
                <button
                    style={expandButtonStyle}
                    onClick={() => setExpanded(true)}
                >
                    {'Show more (' + (lines.length - MAX_VISIBLE_LINES) + ' more lines)'}
                </button>
            )}
            {isLong && expanded && (
                <button
                    style={expandButtonStyle}
                    onClick={() => setExpanded(false)}
                >
                    {'Show less'}
                </button>
            )}
        </div>
    );
};

export default DiffHunkDisplay;
