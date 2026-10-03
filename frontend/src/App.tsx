import React, { useState } from "react";
import { HomePage } from "./components/HomePage";
import { ConversationsPage } from "./components/ConversationsPage";
import { SettingsScreen } from "./components/SettingsScreen";
import { AddConversationPage } from "./components/AddConversationPage";
import { IncomingCallScreen } from "./components/IncomingCallScreen";
import { ActiveCallScreen } from "./components/ActiveCallScreen";
import { PhoneMockupFrame } from "./components/layout/PhoneMockupFrame";
import { useAppSettings } from "./hooks/useAppSettings";
import { useScenarios } from "./hooks/useScenarios";
import { useEmergencyCall } from "./hooks/useEmergencyCall";
import type { ActiveView } from "./types";

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>("home");

  // 1. Settings state & persistence
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    callDelaySeconds,
    setCallDelaySeconds,
    keywords,
    addKeyword,
    removeKeyword,
    contact,
    updateContact,
  } = useAppSettings();

  // 2. Scenario state & caller/topic selection
  const {
    defaultCallers,
    defaultTopics,
    selectedCaller,
    selectedTopic,
    customScenarios,
    selectedScenario,
    selectDefaultCaller,
    selectDefaultTopic,
    selectCustomScenario,
    addCustomScenario,
    deleteCustomScenario,
  } = useScenarios(language);

  // 3. Emergency call, speech recognition & GPS
  const {
    scheduledCountdown,
    scheduleCall,
    cancelSchedule,
    coords,
    transcript,
    emergencyTriggered,
    alertDetails,
    startActiveCall,
    endActiveCall,
    executeEmergencyAlert,
  } = useEmergencyCall({
    language,
    selectedScenario,
    callDelaySeconds,
    keywords,
    contact,
    onNavigate: setCurrentView,
  });

  return (
    <PhoneMockupFrame theme={theme}>
      {/* 1. HOME PAGE */}
      {currentView === "home" && (
        <HomePage
          language={language}
          theme={theme}
          onOpenSettings={() => setCurrentView("settings")}
          onNavigateToConversations={() => setCurrentView("conversations")}
          selectedScenario={selectedScenario}
          onStartCallNow={startActiveCall}
          onScheduleCall={scheduleCall}
          onCancelSchedule={cancelSchedule}
          scheduledSeconds={scheduledCountdown}
          callDelaySeconds={callDelaySeconds}
          coords={coords}
          contactName={contact.name}
        />
      )}

      {/* 2. DEDICATED CONVERSATION CONFIGURATION PAGE */}
      {currentView === "conversations" && (
        <ConversationsPage
          language={language}
          theme={theme}
          onBackToHome={() => setCurrentView("home")}
          onNavigateToAddConversation={() => setCurrentView("add_conversation")}
          defaultCallers={defaultCallers}
          defaultTopics={defaultTopics}
          selectedCaller={selectedCaller}
          selectedTopic={selectedTopic}
          onSelectDefaultCaller={selectDefaultCaller}
          onSelectDefaultTopic={selectDefaultTopic}
          customScenarios={customScenarios}
          selectedScenario={selectedScenario}
          onSelectCustomScenario={selectCustomScenario}
        />
      )}

      {/* 3. SETTINGS SCREEN */}
      {currentView === "settings" && (
        <SettingsScreen
          language={language}
          onSelectLanguage={setLanguage}
          theme={theme}
          onSelectTheme={setTheme}
          onBackToHome={() => setCurrentView("home")}
          keywords={keywords}
          onAddKeyword={addKeyword}
          onRemoveKeyword={removeKeyword}
          callDelaySeconds={callDelaySeconds}
          onChangeCallDelay={setCallDelaySeconds}
          contact={contact}
          onUpdateContact={updateContact}
          onTestEmergencyTrigger={() => executeEmergencyAlert("TEST_MANUAL", "Manual SOS Test")}
        />
      )}

      {/* 4. DEDICATED ADD CONVERSATION PAGE */}
      {currentView === "add_conversation" && (
        <AddConversationPage
          language={language}
          theme={theme}
          onBackToHome={() => setCurrentView("conversations")}
          customScenarios={customScenarios}
          onAddCustomScenario={addCustomScenario}
          onDeleteCustomScenario={deleteCustomScenario}
          onSelectScenario={selectCustomScenario}
        />
      )}

      {/* 5. INCOMING CALL SCREEN */}
      {currentView === "incoming" && (
        <IncomingCallScreen
          scenario={selectedScenario}
          language={language}
          onAccept={startActiveCall}
          onDecline={() => setCurrentView("home")}
        />
      )}

      {/* 6. ACTIVE CALL SCREEN */}
      {currentView === "connected" && (
        <ActiveCallScreen
          scenario={selectedScenario}
          language={language}
          onEndCall={endActiveCall}
          isListening={true}
          transcript={transcript}
          emergencyTriggered={emergencyTriggered}
          alertDetails={alertDetails}
          onSimulateKeyword={(kw) => executeEmergencyAlert(kw, `Simulated word: ${kw}`)}
          keywords={keywords}
        />
      )}
    </PhoneMockupFrame>
  );
}
