import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'hi' | 'gu';

const dict: Record<Lang, Record<string, string>> = {
  en: {
    appName: 'RAHATSETU',
    prototype: 'Prototype',
    dashboard: 'Dashboard',
    report: 'Report Problem',
    myReports: 'My Reports',
    liveMap: 'Live Map',
    priorityQueue: 'Priority Queue',
    allProblems: 'All Problems',
    projectTracker: 'Project Tracker',
    sosMonitor: 'SOS Monitor',
    verified: 'Verified',
    language: 'Language',
  },
  hi: {
    appName: 'राहतसेतु',
    prototype: 'प्रोटोटाइप',
    dashboard: 'डैशबोर्ड',
    report: 'समस्या सूचित करें',
    myReports: 'मेरी रिपोर्टें',
    liveMap: 'लाइव मानचित्र',
    priorityQueue: 'प्राथमिकता कतार',
    allProblems: 'सभी समस्याएँ',
    projectTracker: 'परियोजना ट्रैकर',
    sosMonitor: 'एसओएस मॉनिटर',
    verified: 'सत्यापित',
    language: 'भाषा',
  },
  gu: {
    appName: 'રાહતસેતુ',
    prototype: 'પ્રોટોટાઇપ',
    dashboard: 'ડેશબોર્ડ',
    report: 'સમસ્યા જાણ કરો',
    myReports: 'મારી જાણ',
    liveMap: 'લાઇવ નકશો',
    priorityQueue: 'પ્રાથમિકતા કતાર',
    allProblems: 'બધી સમસ્યાઓ',
    projectTracker: 'પ્રોજેક્ટ ટ્રેકર',
    sosMonitor: 'એસઓએસ મોનિટર',
    verified: 'ચકાસાયેલ',
    language: 'ભાષા',
  },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const t = (key: string) => dict[lang][key] ?? dict.en[key] ?? key;

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}