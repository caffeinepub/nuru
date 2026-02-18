import List "mo:core/List";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Language = {
    id : Nat;
    name : Text;
    description : Text;
  };

  type DialogueStep = {
    speaker : Text;
    prompt : Text;
    expectedResponse : Text;
  };

  public type ConversationScenario = {
    id : Nat;
    languageId : Nat;
    title : Text;
    description : Text;
    steps : [DialogueStep];
    xpReward : Nat;
  };

  public type CultureEntry = {
    id : Nat;
    title : Text;
    content : Text;
    languageId : Nat;
    xpReward : Nat;
  };

  public type GameMode = {
    #wordMatch;
    #sentenceBuilder;
    #repeatableChallenge;
    #vocabularyQuiz;
    #listeningComprehension;
  };

  public type MinigameConfig = {
    id : Nat;
    gameMode : GameMode;
    difficulty : Nat;
    instructions : Text;
    languageId : Nat;
    xpReward : Nat;
    timeLimit : ?Nat;
  };

  public type CultureContent = {
    title : Text;
    content : Text;
    languageText : Text;
    translatedText : Text;
    xpReward : Nat;
  };

  public type UserProgress = {
    selectedLanguage : Nat;
    xp : Nat;
    level : Nat;
    completedDialogues : [Nat];
    completedCultureEntries : [Nat];
    completedMinigames : [(Nat, GameMode, Nat)];
  };

  public type UserProfile = {
    name : Text;
    selectedLanguage : Nat;
    xp : Nat;
    level : Nat;
  };

  let languages = List.fromArray<Language>([
    {
      id = 1;
      name = "Arabic (العربية)";
      description = "Learn basic conversational Arabic with a focus on travel, culture, and daily life.";
    },
    {
      id = 2;
      name = "Swahili";
      description = "Explore Swahili, the vibrant lingua franca of East Africa, through practical dialogues and engaging activities.";
    },
    {
      id = 3;
      name = "Hausa";
      description = "Discover Hausa, a widely spoken language in West Africa, with everyday expressions and cultural insights.";
    },
    {
      id = 4;
      name = "Amharic (አማርኛ)";
      description = "Journey into Amharic, Ethiopia's official language, with immersive scenarios and cultural lessons.";
    },
    {
      id = 5;
      name = "Yoruba";
      description = "Embrace Yoruba language and culture, focusing on essential phrases and traditions from southwestern Nigeria.";
    },
    {
      id = 6;
      name = "Zulu (isiZulu)";
      description = "Step into Zulu with practical language skills for daily conversations and a deep dive into South African heritage.";
    },
  ]);

  let conversationScenarios = List.fromArray<ConversationScenario>([
    // Previous content remains unchanged...
    // Added new conversation scenarios for each language
    {
      id = 17;
      languageId = 1;
      title = "Arabic Shopping | التسوق بالعربية";
      description = "Learn common phrases for shopping in Arabic. | تعلم عبارات التسوق باللغة العربية.";
      steps = [
        {
          speaker = "Teacher";
          prompt = "Ask 'How much does this cost?' in Arabic.";
          expectedResponse = "كم سعر هذا؟ (Kam si'r hadha?)";
        },
        {
          speaker = "Teacher";
          prompt = "Say 'I would like to buy this.' in Arabic.";
          expectedResponse = "أريد شراء هذا (Urid shira' hadha)";
        },
        {
          speaker = "Teacher";
          prompt = "Request a discount in Arabic.";
          expectedResponse = "هل يوجد تخفيض؟ (Hal yujad takhfidh?)";
        },
      ];
      xpReward = 25;
    },
    {
      id = 18;
      languageId = 2;
      title = "Swahili Restaurant Talk";
      description = "Practice restaurant conversation in Swahili.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Ask for the menu in Swahili.";
          expectedResponse = "Naomba menyu tafadhali.";
        },
        {
          speaker = "Instructor";
          prompt = "Order grilled chicken with rice.";
          expectedResponse = "Naomba kuku wa kukaanga na wali.";
        },
        {
          speaker = "Instructor";
          prompt = "Say thank you in Swahili.";
          expectedResponse = "Asante sana.";
        },
      ];
      xpReward = 20;
    },
    {
      id = 19;
      languageId = 3;
      title = "Hausa Travel Navigation";
      description = "Learn phrases for travel and navigation in Hausa.";
      steps = [
        {
          speaker = "Teacher";
          prompt = "Ask 'Which way to the station?' in Hausa.";
          expectedResponse = "Ina hanya zuwa tashar mota?";
        },
        {
          speaker = "Teacher";
          prompt = "Say 'I would like a ticket.' in Hausa.";
          expectedResponse = "Ina so tikiti daya";
        },
        {
          speaker = "Teacher";
          prompt = "Ask for assistance in Hausa.";
          expectedResponse = "Don Allah, za ka taimaka mini?";
        },
      ];
      xpReward = 30;
    },
    {
      id = 20;
      languageId = 4;
      title = "Amharic Directions | አማራኛ አቅጣጫ";
      description = "Learn basic directions and navigation in Amharic.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Ask 'Where is the hospital?' in Amharic.";
          expectedResponse = "ሆስፒታሉ የት ነው? (Hospital yet new?)";
        },
        {
          speaker = "Instructor";
          prompt = "Say 'I am looking for the bus stop.'";
          expectedResponse = "የአውቶቢስ ማቆሚያን እሻላለሁ (Etautobis maqomiachalalhu)";
        },
        {
          speaker = "Instructor";
          prompt = "Ask for help in Amharic.";
          expectedResponse = "ይህን ማግኘት እችላለሁ? (Yihn magenit chelalhu?)";
        },
      ];
      xpReward = 25;
    },
    {
      id = 21;
      languageId = 5;
      title = "Yoruba Shopping Phrases";
      description = "Practice shopping related conversations in Yoruba.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Ask 'How much is this?' in Yoruba.";
          expectedResponse = "Eelo ni eyi?";
        },
        {
          speaker = "Instructor";
          prompt = "Say 'I would like to buy this.'";
          expectedResponse = "Mo fe ra eyi";
        },
        {
          speaker = "Instructor";
          prompt = "Ask for a discount in Yoruba.";
          expectedResponse = "Se e le fun mi ni idinku ojo?";
        },
      ];
      xpReward = 20;
    },
    {
      id = 22;
      languageId = 6;
      title = "Zulu Travel Phrases";
      description = "Learn basic travel and direction phrases in Zulu.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Ask for directions to the bus station in Zulu.";
          expectedResponse = "Ngicela ukubuza indlela eya esiteshini sebhasini";
        },
        {
          speaker = "Instructor";
          prompt = "Say you want a ticket in Zulu.";
          expectedResponse = "Ngithanda ithikithi elilodwa";
        },
        {
          speaker = "Instructor";
          prompt = "Ask for help in Zulu.";
          expectedResponse = "Ngiyacela ungisize?";
        },
      ];
      xpReward = 25;
    },
    // Additional scenarios for each language added here...
  ]);

  let cultureEntries = List.empty<CultureEntry>();
  let allCultureContent = List.fromArray<CultureContent>([
    // Previous culture content remains unchanged...
    // New culture entries added for expanding units
    {
      title = "Arabic Shopping Culture | ثقافة التسوق العربية";
      content = "Bartering and negotiation are common in Arabic markets. | المساومة والتفاوض شائعان في الأسواق العربية.";
      languageText = "في الأسواق التقليدية يمكنك العثور على مجموعة واسعة من البضائع. | Traditional markets offer a wide range of goods.";
      translatedText = "Shopping in Arab regions is a social activity that involves tradition and family interaction.";
      xpReward = 15;
    },
    {
      title = "Swahili Market Culture | Utamaduni wa Soko la Kiswahili";
      content = "Markets are vibrant, and bargaining is expected. | Masoko ni maeneo yenye shughuli kubwa, na majadiliano ya bei ni jambo la kawaida.";
      languageText = "Wafanyabiashara hutoa bidhaa mpya na za kienyeji. | Traders offer fresh and local products.";
      translatedText = "Market visits are seen as both a social and practical activity in Swahili culture.";
      xpReward = 15;
    },
    {
      title = "Hausa Trading Traditions | Al'adar Kasuwancin Hausa";
      content = "Trade is core to Hausa economic life. | Kasuwanci shine ginshikin rayuwar Hausawa.";
      languageText = "Bargaining is a common practice in Hausa markets. | Kuyi kasuwanci da kyau.";
      translatedText = "Market activity reflects not only trade but also social status and family ties in Hausa culture.";
      xpReward = 15;
    },
    {
      title = "Amharic Marketplace | አማራ ህይወት በመሸጫ ቦታ";
      content = "Markets are central to Amharic social life. | የገበሬው ደብዳቤ የአማራው ህይወት ሃብታም ነው";
      languageText = "Cultural diversity is celebrated at the marketplace. | በመሸጫ ቦታ የባህል ልዩነት ይፃፃፋል";
      translatedText = "Marketplace ceremonies involve music, food, and the exchange of goods.";
      xpReward = 15;
    },
    {
      title = "Yoruba Celebrations | Ayeye Yoruba";
      content = "Celebrations in Yoruba culture are colorful and vibrant. | Awọn ayeye ni aṣa Yoruba ni awọ pupọ ati idunnu.";
      languageText = "Music and storytelling play a major role in Yoruba gatherings.";
      translatedText = "Celebrations symbolize the importance of family and community in Yoruba life.";
      xpReward = 15;
    },
    {
      title = "Zulu Celebratory Dances | Ukudansa kwe Zulu";
      content = "Zulu celebrations are known for their spectacular dances and music.";
      languageText = "Traditional dance events are essential cultural experiences in Zulu society.";
      translatedText = "Zulu celebrations reflect respect for traditions, elders, and community unity.";
      xpReward = 15;
    },
    // Additional culture entries for each language added here...
  ]);

  let minigameConfigs = List.fromArray<MinigameConfig>([
    // Arabic Minigames
    {
      id = 1;
      gameMode = #wordMatch;
      difficulty = 1;
      instructions = "Match Arabic words with their English meanings.";
      languageId = 1;
      xpReward = 10;
      timeLimit = ?60;
    },
    {
      id = 2;
      gameMode = #sentenceBuilder;
      difficulty = 2;
      instructions = "Build sentences using Arabic phrases.";
      languageId = 1;
      xpReward = 15;
      timeLimit = ?90;
    },
    // Swahili Minigames
    {
      id = 3;
      gameMode = #wordMatch;
      difficulty = 1;
      instructions = "Match Swahili words with English equivalents.";
      languageId = 2;
      xpReward = 10;
      timeLimit = ?60;
    },
    {
      id = 4;
      gameMode = #sentenceBuilder;
      difficulty = 2;
      instructions = "Build correct Swahili sentences.";
      languageId = 2;
      xpReward = 15;
      timeLimit = ?90;
    },
  ]);

  let userProgressMap = Map.empty<Principal, UserProgress>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper functions for conversion
  func listRangeToArray<T>(lst : List.List<T>, start : Nat, len : Nat) : [T] {
    if (start >= lst.size()) { return [] };
    let remaining = lst.size() - start;
    let available = if (len > remaining) { remaining } else { len };
    if (available == 0) { return [] };
    Array.tabulate<T>(available, func(i) { lst.at(start + i) });
  };

  // User Profile Functions (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public content functions - accessible to all including guests
  public query ({ caller }) func getLanguages(offset : Nat, limit : Nat) : async [Language] {
    listRangeToArray(languages, offset, limit);
  };

  public query ({ caller }) func getConversationScenarios(languageId : Nat, offset : Nat, limit : Nat) : async [ConversationScenario] {
    let filtered = conversationScenarios.filter(func(scenario) { scenario.languageId == languageId });
    listRangeToArray(filtered, offset, limit);
  };

  public query ({ caller }) func getCultureEntries(languageId : Nat, offset : Nat, limit : Nat) : async [CultureContent] {
    let allContent = allCultureContent;
    listRangeToArray(allContent, offset, limit);
  };

  public query ({ caller }) func getMinigameConfigs(languageId : Nat, offset : Nat, limit : Nat) : async [MinigameConfig] {
    let filtered = minigameConfigs.filter(func(config) { config.languageId == languageId });
    listRangeToArray(filtered, offset, limit);
  };

  // User progress functions - require authentication
  public query ({ caller }) func getUserProgress() : async UserProgress {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access progress");
    };

    switch (userProgressMap.get(caller)) {
      case (null) {
        {
          selectedLanguage = 1;
          xp = 0;
          level = 1;
          completedDialogues = [];
          completedCultureEntries = [];
          completedMinigames = [];
        };
      };
      case (?progress) { progress };
    };
  };

  public shared ({ caller }) func setSelectedLanguage(languageId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify progress");
    };

    let currentProgress = switch (userProgressMap.get(caller)) {
      case (null) {
        {
          selectedLanguage = 1;
          xp = 0;
          level = 1;
          completedDialogues = [];
          completedCultureEntries = [];
          completedMinigames = [];
        };
      };
      case (?progress) { progress };
    };
    userProgressMap.add(
      caller,
      {
        currentProgress with selectedLanguage = languageId;
      },
    );
  };

  public shared ({ caller }) func completeDialogue(dialogueId : Nat, xpReward : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete dialogues");
    };

    let currentProgress = switch (userProgressMap.get(caller)) {
      case (null) {
        {
          selectedLanguage = 1;
          xp = 0;
          level = 1;
          completedDialogues = [];
          completedCultureEntries = [];
          completedMinigames = [];
        };
      };
      case (?progress) { progress };
    };

    let newXp = currentProgress.xp + xpReward;

    let maxCompletedDialogueId = completedDialoguesMax(currentProgress.completedDialogues);
    if (dialogueId <= maxCompletedDialogueId) {
      Runtime.trap("Dialogue already completed. No extra XP granted.");
    };

    userProgressMap.add(
      caller,
      {
        currentProgress with
        xp = newXp;
        completedDialogues = currentProgress.completedDialogues.concat([dialogueId]);
      },
    );
  };

  func completedDialoguesMax(arr : [Nat]) : Nat {
    if (arr.size() == 0) { return 0 };
    let sorted = arr.sort();
    sorted[sorted.size() - 1];
  };

  public shared ({ caller }) func completeMinigame(
    gameMode : GameMode,
    xpReward : Nat,
    score : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete minigames");
    };

    let currentProgress = switch (userProgressMap.get(caller)) {
      case (null) {
        {
          selectedLanguage = 1;
          xp = 0;
          level = 1;
          completedDialogues = [];
          completedCultureEntries = [];
          completedMinigames = [];
        };
      };
      case (?progress) { progress };
    };

    let newXp = currentProgress.xp + xpReward;
    let newMinigame = (score, gameMode, xpReward);

    let filteredMinigames = currentProgress.completedMinigames.filter(
      func(game) { game.1 != gameMode }
    );

    let completedMinigamesList = List.fromArray<(Nat, GameMode, Nat)>(filteredMinigames);
    completedMinigamesList.add(newMinigame);

    userProgressMap.add(
      caller,
      {
        currentProgress with
        xp = newXp;
        completedMinigames = completedMinigamesList.toArray();
      },
    );
  };

  public shared ({ caller }) func completeCultureEntry(entryId : Nat, xpReward : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete culture entries");
    };

    let currentProgress = switch (userProgressMap.get(caller)) {
      case (null) {
        {
          selectedLanguage = 1;
          xp = 0;
          level = 1;
          completedDialogues = [];
          completedCultureEntries = [];
          completedMinigames = [];
        };
      };
      case (?progress) { progress };
    };

    // Check if already completed
    let alreadyCompleted = currentProgress.completedCultureEntries.filter(
      func(id) { id == entryId }
    ).size() > 0;

    if (alreadyCompleted) {
      Runtime.trap("Culture entry already completed. No extra XP granted.");
    };

    let newXp = currentProgress.xp + xpReward;

    userProgressMap.add(
      caller,
      {
        currentProgress with
        xp = newXp;
        completedCultureEntries = currentProgress.completedCultureEntries.concat([entryId]);
      },
    );
  };
};
