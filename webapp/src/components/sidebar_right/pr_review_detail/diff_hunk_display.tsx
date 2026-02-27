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

/**
 * Parse the @@ header to extract the new file start line number.
 * Format: @@ -oldStart,oldCount +newStart,newCount @@
 */
function parseHunkHeader(line: string): {oldStart: number; newStart: number} {
    const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (match) {
        return {oldStart: parseInt(match[1], 10), newStart: parseInt(match[2], 10)};
    }
    return {oldStart: 1, newStart: 1};
}

/**
 * Compute line numbers for each line in the diff.
 * Returns an array of {oldLine, newLine} where null means no number for that side.
 */
function computeLineNumbers(lines: string[]): Array<{oldLine: number | null; newLine: number | null}> {
    let oldLine = 1;
    let newLine = 1;
    let initialized = false;

    return lines.map((line) => {
        if (line.startsWith('@@')) {
            const parsed = parseHunkHeader(line);
            oldLine = parsed.oldStart;
            newLine = parsed.newStart;
            initialized = true;
            return {oldLine: null, newLine: null};
        }

        if (!initialized) {
            return {oldLine: null, newLine: null};
        }

        if (line.startsWith('-')) {
            const result = {oldLine, newLine: null as number | null};
            oldLine++;
            return result;
        }

        if (line.startsWith('+')) {
            const result = {oldLine: null as number | null, newLine};
            newLine++;
            return result;
        }

        // Context line — both sides increment
        const result = {oldLine, newLine};
        oldLine++;
        newLine++;
        return result;
    });
}

const DiffHunkDisplay: React.FC<Props> = ({diffHunk, theme}) => {
    const [expanded, setExpanded] = useState(false);

    if (!diffHunk) {
        return null;
    }

    const lines = diffHunk.split('\n');
    const lineNumbers = computeLineNumbers(lines);
    const isLong = lines.length > MAX_VISIBLE_LINES;
    const visibleLines = expanded ? lines : lines.slice(0, MAX_VISIBLE_LINES);
    const visibleLineNumbers = expanded ? lineNumbers : lineNumbers.slice(0, MAX_VISIBLE_LINES);

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

    const gutterStyle: React.CSSProperties = {
        width: '35px',
        textAlign: 'right',
        paddingRight: '8px',
        color: changeOpacity(theme.centerChannelColor, 0.35),
        fontSize: '10px',
        userSelect: 'none',
        flexShrink: 0,
    };

    const lineContentStyle: React.CSSProperties = {
        whiteSpace: 'pre',
        flex: 1,
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
                {visibleLines.map((line, idx) => {
                    const ln = visibleLineNumbers[idx];
                    const lineNum = ln?.newLine;
                    return (
                        <div
                            key={idx}
                            style={{display: 'flex', ...getLineStyle(line)}}
                        >
                            <span style={gutterStyle}>
                                {lineNum == null ? '' : lineNum}
                            </span>
                            <span style={{...lineContentStyle, padding: '0 8px'}}>
                                {line}
                            </span>
                        </div>
                    );
                })}
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
