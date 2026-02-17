import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ConversationScenario {
    id: bigint;
    title: string;
    xpReward: bigint;
    languageId: bigint;
    description: string;
    steps: Array<DialogueStep>;
}
export interface DialogueStep {
    expectedResponse: string;
    prompt: string;
    speaker: string;
}
export interface Language {
    id: bigint;
    name: string;
    description: string;
}
export interface CultureContent {
    title: string;
    content: string;
    xpReward: bigint;
    languageText: string;
    translatedText: string;
}
export interface UserProgress {
    xp: bigint;
    completedCultureEntries: Array<bigint>;
    selectedLanguage: bigint;
    level: bigint;
    completedMinigames: Array<[bigint, GameMode, bigint]>;
    completedDialogues: Array<bigint>;
}
export interface UserProfile {
    xp: bigint;
    name: string;
    selectedLanguage: bigint;
    level: bigint;
}
export interface MinigameConfig {
    id: bigint;
    timeLimit?: bigint;
    xpReward: bigint;
    languageId: bigint;
    difficulty: bigint;
    instructions: string;
    gameMode: GameMode;
}
export enum GameMode {
    listeningComprehension = "listeningComprehension",
    sentenceBuilder = "sentenceBuilder",
    vocabularyQuiz = "vocabularyQuiz",
    repeatableChallenge = "repeatableChallenge",
    wordMatch = "wordMatch"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeCultureEntry(entryId: bigint, xpReward: bigint): Promise<void>;
    completeDialogue(dialogueId: bigint, xpReward: bigint): Promise<void>;
    completeMinigame(gameMode: GameMode, xpReward: bigint, score: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversationScenarios(languageId: bigint, offset: bigint, limit: bigint): Promise<Array<ConversationScenario>>;
    getCultureEntries(languageId: bigint, offset: bigint, limit: bigint): Promise<Array<CultureContent>>;
    getLanguages(offset: bigint, limit: bigint): Promise<Array<Language>>;
    getMinigameConfigs(languageId: bigint, offset: bigint, limit: bigint): Promise<Array<MinigameConfig>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserProgress(): Promise<UserProgress>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setSelectedLanguage(languageId: bigint): Promise<void>;
}
