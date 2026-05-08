'use client';

import { useState, useCallback } from 'react';
import GroupManager from '@/components/creators/GroupManager';
import CreatorList from '@/components/creators/CreatorList';
import SettingsModal from '@/components/layout/SettingsModal';
import AddCreatorModal from '@/components/creators/AddCreatorModal';
import GroupManageModal from '@/components/creators/GroupManageModal';
import { useCreatorContext } from '@/hooks/CreatorContext';

export default function LeftPanel() {
  const { state, selectAll } = useCreatorContext();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addCreatorOpen, setAddCreatorOpen] = useState(false);
  const [groupManageOpen, setGroupManageOpen] = useState(false);

  const handleSelectGroup = useCallback(
    (group: string | null) => {
      setActiveGroup(group);
      if (group) {
        const groupUids = state.creators
          .filter((c) => c.groups.includes(group))
          .map((c) => c.uid);
        selectAll(groupUids);
      } else {
        selectAll();
      }
    },
    [state.creators, selectAll]
  );

  return (
    <>
      <div className="w-72 h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">BiliRain</h1>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="设置"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Fixed groups */}
        <div className="flex-shrink-0 px-4 pt-3 pb-2">
          <GroupManager
            activeGroup={activeGroup}
            onSelectGroup={handleSelectGroup}
            onManageGroups={() => setGroupManageOpen(true)}
          />
        </div>

        {/* Scrollable list area: contains search + cards */}
        <div className="flex-1 min-h-0 px-4 pb-3 pt-2">
          <CreatorList
            activeGroup={activeGroup}
            onAddCreator={() => setAddCreatorOpen(true)}
          />
        </div>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <AddCreatorModal open={addCreatorOpen} onClose={() => setAddCreatorOpen(false)} />
      <GroupManageModal open={groupManageOpen} onClose={() => setGroupManageOpen(false)} />
    </>
  );
}
