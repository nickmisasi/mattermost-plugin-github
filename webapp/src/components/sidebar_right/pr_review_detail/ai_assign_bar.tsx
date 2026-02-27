// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback} from 'react';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import {AIAgent} from '../../../types/github_types';

type Props = {
    selectedCount: number;
    agents: AIAgent[];
    onAssign: (agentMention: string) => void;
    theme: Theme;
};

const AIAssignBar: React.FC<Props> = ({selectedCount, agents, onAssign, theme}) => {
    const defaultMention = agents.length > 0 ? (agents.find((a) => a.is_default)?.mention || agents[0].mention) : '';
    const [selectedAgent, setSelectedAgent] = useState(defaultMention);

    const handleAssign = useCallback(() => {
        if (selectedAgent) {
            onAssign(selectedAgent);
        }
    }, [selectedAgent, onAssign]);

    if (selectedCount === 0 || agents.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                ...styles.container,
                backgroundColor: theme.centerChannelBg,
                borderTop: `1px solid ${changeOpacity(theme.centerChannelColor, 0.2)}`,
                boxShadow: `0 -1px 3px ${changeOpacity(theme.centerChannelColor, 0.08)}`,
            }}
        >
            <span style={{...styles.countText, color: theme.centerChannelColor}}>
                {selectedCount + (selectedCount === 1 ? ' comment selected' : ' comments selected')}
            </span>
            <div style={styles.actions}>
                <select
                    style={{
                        ...styles.select,
                        backgroundColor: changeOpacity(theme.centerChannelColor, 0.05),
                        color: theme.centerChannelColor,
                        border: `1px solid ${changeOpacity(theme.centerChannelColor, 0.2)}`,
                    }}
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                >
                    {agents.map((agent) => (
                        <option
                            key={agent.mention}
                            value={agent.mention}
                        >
                            {agent.name}
                        </option>
                    ))}
                </select>
                <button
                    style={{
                        ...styles.assignButton,
                        backgroundColor: theme.buttonBg,
                        color: theme.buttonColor,
                    }}
                    onClick={handleAssign}
                >
                    {'Assign'}
                </button>
            </div>
        </div>
    );
};

const CHEVRON_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23666' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

const styles: Record<string, React.CSSProperties> = {
    container: {
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        transition: 'opacity 0.2s ease',
    },
    countText: {
        fontSize: '13px',
        fontWeight: 600,
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    select: {
        padding: '4px 8px',
        paddingRight: '24px',
        borderRadius: '4px',
        fontSize: '12px',
        height: '28px',
        outline: 'none',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: `url("${CHEVRON_SVG}")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 6px center',
        backgroundSize: '10px',
    },
    assignButton: {
        padding: '0 16px',
        borderRadius: '4px',
        border: 'none',
        fontSize: '12px',
        fontWeight: 600,
        height: '28px',
        cursor: 'pointer',
    },
};

export default AIAssignBar;
