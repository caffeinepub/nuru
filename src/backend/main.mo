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

  // Conversation scenarios (unchanged, still use original type for dialogue practice)
  let conversationScenarios = List.fromArray<ConversationScenario>([
    { // Arabic Greetings
      id = 1;
      languageId = 1;
      title = "Arabic Greetings | تحية باللغة العربية";
      description = "Learn basic greetings in Arabic for everyday situations. | تعلم تحيات بسيطة باللغة العربية لمواقف الحياة اليومية.";
      steps = [
        {
          speaker = "Teacher";
          prompt = "Say 'Hello' in Arabic. | قل 'مرحبا' بالعربية.";
          expectedResponse = "مرحبا (Marhaba)";
        },
        {
          speaker = "Teacher";
          prompt = "Say 'Goodbye' in Arabic. | قل 'مع السلامة' بالعربية.";
          expectedResponse = "مع السلامة (Ma'a salama)";
        },
        {
          speaker = "Teacher";
          prompt = "Say 'How are you?' in Arabic. | قل 'كيف حالك؟' بالعربية.";
          expectedResponse = "كيف حالك؟ (Kayfa halak?)";
        },
        {
          speaker = "Teacher";
          prompt = "Respond to 'كيف حالك؟ (Kayfa halak?)' with 'I am fine, thank you.' | رد ب'أنا بخير، شكراً'.";
          expectedResponse = "أنا بخير، شكراً (Ana bikhayr, shukran)";
        },
        {
          speaker = "Teacher";
          prompt = "Say 'Good morning' in Arabic. | قل 'صباح الخير' بالعربية.";
          expectedResponse = "صباح الخير (Sabah al-khayr)";
        },
        {
          speaker = "Teacher";
          prompt = "Say 'Thank you' in Arabic. | قل 'شكراً' بالعربية.";
          expectedResponse = "شكراً (Shukran)";
        },
      ];
      xpReward = 20;
    },
    {
      id = 2;
      languageId = 1;
      title = "Arabic Directions | استعلام عن الاتجاهات بالعربية";
      description = "Practice asking for basic directions in Arabic. | مارِسْ سؤال الاتجاهات الأساسية باللغة العربية.";
      steps = [
        {
          speaker = "Teacher";
          prompt = "How do you say 'Where is the hotel?' in Arabic? | كيف تسأل 'أين الفندق؟' بالعربية؟";
          expectedResponse = "أين الفندق؟ (Ayn al-funduq?)";
        },
        {
          speaker = "Teacher";
          prompt = "Reply with 'It is next to the bank.' | رد ب 'هو بجانب البنك'.";
          expectedResponse = "هو بجانب البنك (Hu bijanib albink)";
        },
        {
          speaker = "Teacher";
          prompt = "Ask 'Where is the restroom?' in Arabic. | اسأل 'أين الحمام؟'.";
          expectedResponse = "أين الحمام؟ (Ayn al-hammam?)";
        },
        {
          speaker = "Teacher";
          prompt = "Say 'Go straight ahead' in Arabic. | قل 'اذهب إلى الأمام'.";
          expectedResponse = "اذهب إلى الأمام (Idhab ila al-amam)";
        },
      ];
      xpReward = 30;
    },
    {
      id = 3;
      languageId = 1;
      title = "Restaurant Requests | الطلبات في المطعم";
      description = "Learn how to order food in Arabic restaurants. | تعلم كيفية طلب الطعام في المطاعم العربية.";
      steps = [
        {
          speaker = "Teacher";
          prompt = "Say 'I would like some water, please.' | قل 'أريد بعض الماء، من فضلك'.";
          expectedResponse = "أريد بعض الماء، من فضلك (Urid baad alma'a, min fadlik)";
        },
        {
          speaker = "Teacher";
          prompt = "Order chicken with rice. | اطلب دجاج مع الأرز.";
          expectedResponse = "أريد دجاج مع الأرز (Urid dajaj maa al-aruz)";
        },
        {
          speaker = "Teacher";
          prompt = "Say 'The food was delicious' in Arabic. | قل 'كان الطعام لذيذاً'.";
          expectedResponse = "كان الطعام لذيذاً (Kan altaam ladheedhan)";
        },
      ];
      xpReward = 25;
    },
    // Swahili Scenarios - Beginner
    {
      id = 4;
      languageId = 2;
      title = "Swahili Greetings";
      description = "Learn basic greetings and responses in Swahili.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Say 'How are you?' in Swahili";
          expectedResponse = "Habari gani?";
        },
        {
          speaker = "Instructor";
          prompt = "Respond 'I'm fine, thank you'";
          expectedResponse = "Nzuri, asante.";
        },
        {
          speaker = "Instructor";
          prompt = "Say 'Good morning' in Swahili";
          expectedResponse = "Habari za asubuhi?";
        },
        {
          speaker = "Instructor";
          prompt = "Say 'Thank you very much' in Swahili";
          expectedResponse = "Asante sana.";
        },
      ];
      xpReward = 20;
    },
    {
      id = 5;
      languageId = 2;
      title = "Swahili Directions";
      description = "Practice asking for basic directions in Swahili.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "How do you ask for the nearest market in Swahili?";
          expectedResponse = "Soko liko wapi karibu?";
        },
        {
          speaker = "Instructor";
          prompt = "Reply with 'It is straight ahead.'";
          expectedResponse = "Ni mbele tu";
        },
        {
          speaker = "Instructor";
          prompt = "Ask 'Where is the restroom?' in Swahili";
          expectedResponse = "Choo kiko wapi?";
        },
      ];
      xpReward = 30;
    },
    {
      id = 6;
      languageId = 2;
      title = "Restaurant Conversations";
      description = "Learn how to order food in Swahili.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Say 'I would like fish with rice.'";
          expectedResponse = "Ningependa samaki na wali.";
        },
        {
          speaker = "Instructor";
          prompt = "Ask for a glass of water.";
          expectedResponse = "Naomba maji tafadhali.";
        },
        {
          speaker = "Instructor";
          prompt = "Say 'The food was delicious' in Swahili";
          expectedResponse = "Chakula kilikuwa kitamu.";
        },
      ];
      xpReward = 25;
    },
    // Hausa Scenarios - Beginner
    {
      id = 7;
      languageId = 3;
      title = "Hausa Greetings";
      description = "Learn basic greetings and responses in Hausa.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Say 'Hello' in Hausa";
          expectedResponse = "Sannu";
        },
        {
          speaker = "Instructor";
          prompt = "Say 'How are you?' in Hausa";
          expectedResponse = "Lafiya lau?";
        },
        {
          speaker = "Instructor";
          prompt = "Reply 'I am fine, thank you' in Hausa";
          expectedResponse = "Lafiya, nagode";
        },
        {
          speaker = "Instructor";
          prompt = "Say 'Good morning' in Hausa";
          expectedResponse = "Ina kwana";
        },
      ];
      xpReward = 20;
    },
    // Amharic Scenarios - Beginner
    {
      id = 8;
      languageId = 4;
      title = "Amharic Greetings";
      description = "Learn basic greetings in Amharic.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Say 'Hello' in Amharic";
          expectedResponse = "ሰላም (Selam)";
        },
        {
          speaker = "Instructor";
          prompt = "Say 'How are you?' in Amharic";
          expectedResponse = "እንደምን አለህ? (Endemin Aleh?)";
        },
        {
          speaker = "Instructor";
          prompt = "Reply 'I am fine, thank you' in Amharic";
          expectedResponse = "ደህና ነኝ፣ አመሰግናለሁ (Dehna neny, amesegenallo)";
        },
      ];
      xpReward = 20;
    },
    // Yoruba Scenarios - Beginner
    {
      id = 9;
      languageId = 5;
      title = "Yoruba Greetings";
      description = "Learn basic greetings in Yoruba.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Say 'Hello' in Yoruba";
          expectedResponse = "Bawo ni";
        },
        {
          speaker = "Instructor";
          prompt = "Say 'How are you?' in Yoruba";
          expectedResponse = "Se dada ni?";
        },
        {
          speaker = "Instructor";
          prompt = "Reply 'I am fine, thank you' in Yoruba";
          expectedResponse = "Mo wa daadaa, e se";
        },
      ];
      xpReward = 20;
    },
    // Zulu Scenarios - Beginner
    {
      id = 10;
      languageId = 6;
      title = "Zulu Greetings";
      description = "Learn basic greetings in Zulu.";
      steps = [
        {
          speaker = "Instructor";
          prompt = "Say 'Hello' in Zulu";
          expectedResponse = "Sawubona";
        },
        {
          speaker = "Instructor";
          prompt = "Say 'How are you?' in Zulu";
          expectedResponse = "Unjani?";
        },
        {
          speaker = "Instructor";
          prompt = "Reply 'I am fine, thank you' in Zulu";
          expectedResponse = "Ngiyaphila, ngiyabonga";
        },
      ];
      xpReward = 20;
    },
  ]);

  // Culture entries (old type no longer used, keep for migration)
  let cultureEntries = List.empty<CultureEntry>();

  // New culture content with language-focused instructions and translations
  let allCultureContent = List.fromArray<CultureContent>([
    {
      title = "Arabic Cuisine | المأكولات العربية";
      content = "Arabic cuisine is famous for its rich, flavorful dishes. | المطبخ العربي مشهور بأطباقه الغنية بالنكهات.";
      languageText = "المطبخ العربي يقدم مجموعة واسعة من الأطعمة مثل الكبة، الحمص، المشاوي. | Arabic cuisine offers a wide variety of foods like kibbeh, hummus, and grilled meats.";
      translatedText = "Traditional Arabic hospitality means serving plentiful meals and welcoming guests with drinks and tea ceremonies.";
      xpReward = 15;
    },
    {
      title = "Arabic Music Traditions | تقاليد الموسيقى العربية";
      content = "Arabic music uses unique instruments like the oud and darbuka. | تستخدم الموسيقى العربية آلات موسيقية خاصة مثل العود والدف.";
      languageText = "الموسيقى تلعب دورا كبيرا في الأعراس والحفلات والتقاليد الشعبية. | Music plays a big role in weddings, parties, and popular traditions.";
      translatedText = "Distinct rhythms and melodies reflect diverse regional influences from Morocco to Egypt and the Gulf countries.";
      xpReward = 15;
    },
    {
      title = "Swahili Coast History | Historia ya Fuo za Swahili";
      content = "Swahili culture is shaped by African, Arabic, and Indian influences. | Utamaduni wa Kiswahili umeathiriwa na Afrika, Uarabuni na Uhindi.";
      languageText = "Ishara za urafiki ni muhimu, kama salamu na tabasamu. | Friendly gestures like greetings and smiles are important.";
      translatedText = "Festivals and celebrations often feature traditional Swahili music and dances such as tarab and taarabu.";
      xpReward = 15;
    },
    {
      title = "Swahili Clothing and Dress | Mavazi ya Kiswahili";
      content = "Traditional Swahili dress is known for bright patterns and kanga cloth. | Mavazi ya Kiswahili yanajulikana kwa rangi na vitenge vyenye rangi.";
      languageText = "Wanawake wanapenda sana kanga, na wanaume huvaa kanzu rasmi. | Women like kanga, and men wear a traditional kanzu.";
      translatedText = "Clothing styles change based on region and importance of an event.";
      xpReward = 15;
    },
    // Add more entries for Hausa, Amharic, Yoruba, Zulu, etc.
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
    // For now, return all culture entries regardless of languageId. Fine-tune later if needed.
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
