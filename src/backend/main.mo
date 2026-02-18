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
        {
          speaker = "Teacher";
          prompt = "Ask where the nearest store is in Arabic.";
          expectedResponse = "أين أقرب متجر؟ (Ayn aqrab matjir?)";
        },
      ];
      xpReward = 25;
    },
    {
      id = 18;
      languageId = 2;
      title = "Swahili Shopping Experience";
      description = "Navigate shopping situations using Swahili language skills.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Ask for the price in Swahili.";
          expectedResponse = "Pesa ngapi?";
        },
        {
          speaker = "Instructor";
          prompt = "Request to buy an item in Swahili.";
          expectedResponse = "Ningependa kununua hii";
        },
        {
          speaker = "Instructor";
          prompt = "Inquire about nearby shops in Swahili.";
          expectedResponse = "Duka la karibu liko wapi?";
        },
      ];
      xpReward = 20;
    },
    {
      id = 19;
      languageId = 3;
      title = "Hausa Shopping Encounters";
      description = "Master negotiation and shopping vocabulary in Hausa.";
      steps = [
        {
          speaker = "Teacher";
          prompt = "Ask about the price in Hausa.";
          expectedResponse = "Nawa ne kudinsa?";
        },
        {
          speaker = "Teacher";
          prompt = "Request a discount in Hausa.";
          expectedResponse = "Za a kawo sauki?";
        },
        {
          speaker = "Teacher";
          prompt = "Inquire about mall locations in Hausa.";
          expectedResponse = "Ina kasuwa mafi kusa take?";
        },
      ];
      xpReward = 30;
    },
    {
      id = 20;
      languageId = 4;
      title = "Amharic Marketplace Conversations";
      description = "Explore buying and selling scenarios in Amharic.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Ask for the price in Amharic.";
          expectedResponse = "ዋጋ ስንት ነው (Waga sint new?)";
        },
        {
          speaker = "Instructor";
          prompt = "Request help finding stores in Amharic.";
          expectedResponse = "ሱቅ የት ነው (Suk yet new?)";
        },
        {
          speaker = "Instructor";
          prompt = "Ask for product variety in Amharic.";
          expectedResponse = "የበለይ አምራቾች አሉ? (Yebeley amirachoch alu)";
        },
      ];
      xpReward = 25;
    },
    {
      id = 21;
      languageId = 5;
      title = "Yoruba Shopping Adventure";
      description = "Engage in Yoruba shopping conversations.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Ask for the price in Yoruba.";
          expectedResponse = "Eelo ni eyi?";
        },
        {
          speaker = "Instructor";
          prompt = "Request directions to the shopping area in Yoruba.";
          expectedResponse = "Ibo ni ibi to ta awọn ọja";
        },
        {
          speaker = "Instructor";
          prompt = "Inquire about discounts in Yoruba.";
          expectedResponse = "Se e le fun mi ni idinku odo?";
        },
      ];
      xpReward = 20;
    },
    {
      id = 22;
      languageId = 6;
      title = "Zulu Shopping Scenarios";
      description = "Practice Zulu phrases for various shopping situations.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Ask for the price in Zulu.";
          expectedResponse = "Kuyabiza malini lokhu?";
        },
        {
          speaker = "Instructor";
          prompt = "Request help finding a shop in Zulu.";
          expectedResponse = "Ngicela noma usizo thola isitolo";
        },
        {
          speaker = "Instructor";
          prompt = "Inquire about discounts in Zulu.";
          expectedResponse = "Ngabe kunokuthoba intengo?";
        },
      ];
      xpReward = 25;
    },
  ]);

  let cultureEntries = List.empty<CultureEntry>();
  let allCultureContent = List.fromArray<CultureContent>([
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
      title = "Yoruba Shopping Culture | Asà iná Yoruba";
      content = "Bargaining is an integral part of Yoruba shopping experiences. | Idasilẹyọ jẹ’ apakan pataki ti ìrágbára rira ni Yoruba.";
      languageText = "Markets are bustling centers of economic and social activity. | Awọn ọja jẹ́ ile-iṣẹ iṣe-aje ati ọja.";
      translatedText = "Shopping in Yoruba culture is deeply rooted in tradition, family, and celebration.";
      xpReward = 15;
    },
    {
      title = "Zulu Shopping Traditions | Isiko Zoku Thenga kwe Zulu";
      content = "Traditional markets play a vital role in Zulu commerce. | Izimakethe zendabuko zenza indima ebalulekile ezohwebo zamaZulu.";
      languageText = "Negotiation and friendly interactions are common in Zulu shopping. | Uxoxiswano oluhle luyavunyelwa ezitolo zamaZulu.";
      translatedText = "Zulu shopping culture is vibrant, inclusive, and reflective of community values.";
      xpReward = 15;
    },
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
    listRangeToArray(allCultureContent, offset, limit);
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
