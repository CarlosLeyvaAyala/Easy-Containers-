/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable @typescript-eslint/no-namespace */
// Generated automatically. Do not edit.
System.register("Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DM-Lib/Debug", ["Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_2, context_2) {
    "use strict";
    var skyrimPlatform_1, LoggingLevel;
    var __moduleName = context_2 && context_2.id;
    function ReadLoggingFromSettings(pluginName, optionName) {
        const l = skyrimPlatform_1.settings[pluginName][optionName];
        const l2 = typeof l === "string" ? l : "None";
        const t = LoggingLevel[l2];
        return t === undefined ? LoggingLevel.verbose : t;
    }
    exports_2("ReadLoggingFromSettings", ReadLoggingFromSettings);
    /** Creates a logging function that will log the mod's name and message when the log level is correct.
     *
     * @returns A function that logs a message to the console.
     *
     * @remarks
     * Levels with negative numbers will only be displayed when the current logging level is exactly their value,
     * while positive numbers will get displayed when the current logging level is at least their value.
     * @see {@link LoggingLevel}
     *
     * @example
     * const CLF = (logAt: LoggingLevel) => CreateLoggingFunction("Meh", LoggingLevel.Info, logAt)
     * const LogO = CLF(LoggingLevel.Optimization)
     * const LogE = CLF(LoggingLevel.Error)
     * const LogI = CLF(LoggingLevel.Info)
     * const LogV = CLF(LoggingLevel.Verbose)
     *
     * LogO("Meh")              // ""
     * LogI("Mi mi mi mi mi")   // "[Meh] Mi mi mi mi mi"
     * LogV("Meh!")             // "[Meh] Meh!"
     */
    function CreateLoggingFunction(modName, currLogLvl, logAt) {
        return function (msg) {
            const m = `[${modName}] ${msg}`;
            if (currLogLvl >= logAt || (currLogLvl < 0 && currLogLvl === logAt))
                skyrimPlatform_1.printConsole(m);
        };
    }
    exports_2("CreateLoggingFunction", CreateLoggingFunction);
    /**
     * Makes a logging function to log a value, then returns that value.
     *
     * @param f - The logging function.
     * @returns A {@link TappedLoggingFunction}.
     *
     * @remarks
     * This function is intended to be used to initialize variables while logging them,
     * so logging looks cleaner and variables become self documenting in code and
     * "debuggeable" at the same time.
     *
     * @example
     * const LogAndInit = TapLog(printConsole)
     * const x = LogAndInit("Value for x", 3) // -> "Value for x: 3". Meanwhile: x === 3.
     *
     * // Don't know what the next call will yield, but we can log it to console to see it!
     * const form = LogAndInit("Found form", Game.getFormFromFile(0x3bba, "Skyrim.esm"))
     */
    function TapLog(f) {
        return function (msg, x, g) {
            if (g)
                f(`${msg}: ${g(x)}`);
            else
                f(`${msg}: ${x}`);
            return x;
        };
    }
    exports_2("TapLog", TapLog);
    /** @experimental
     * Measures the time it takes a function to execute and logs that.
     *
     * @remarks
     * `Utility.getCurrentRealTime()` seems to be returning the same value for both
     * times the function starts and ends.\
     * I suspect this is because most functions in Skyrim Platform don't wait for the others to end.
     *
     * @param f - Function to measure.
     * @param Log - Function used for logging the time. You can supply a logging level-aware function.
     */
    function Benchmark(f, Log) {
        return () => {
            const t1 = skyrimPlatform_1.Utility.getCurrentRealTime();
            Log(`${f.name} start time: ${t1}`);
            f();
            const t2 = skyrimPlatform_1.Utility.getCurrentRealTime();
            Log(`${f.name} end time: ${t2}`);
            Log(`Execution time for ${f.name}: ${t2 - t1}`);
        };
    }
    exports_2("Benchmark", Benchmark);
    return {
        setters: [
            function (skyrimPlatform_1_1) {
                skyrimPlatform_1 = skyrimPlatform_1_1;
            }
        ],
        execute: function () {
            /** How much will the console be spammed.
             * - Optimization - Meant to only output the times functions take to execute. Used for bottleneck solving.
             * - None
             * - Error - Just errors
             * - Info - Detailed info so the players can know if things are going as expected, but not enough for actual debugging.
             * - Verbose - Info meant for developers.
             */
            (function (LoggingLevel) {
                LoggingLevel[LoggingLevel["optimization"] = -1] = "optimization";
                LoggingLevel[LoggingLevel["none"] = 0] = "none";
                LoggingLevel[LoggingLevel["error"] = 1] = "error";
                LoggingLevel[LoggingLevel["info"] = 2] = "info";
                LoggingLevel[LoggingLevel["verbose"] = 3] = "verbose";
            })(LoggingLevel || (LoggingLevel = {}));
            exports_2("LoggingLevel", LoggingLevel);
        }
    };
});
/**
 * Module for Hotkey related functions.
 */
System.register("Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DM-Lib/Hotkeys", ["Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_3, context_3) {
    "use strict";
    var skyrimPlatform_2, DoNothing, DoNothingOnHold, LogPress, LogRelease, LogHold;
    var __moduleName = context_3 && context_3.id;
    /**
     * Listens for some Hotkey press / release / hold.
     *
     * @see {@link https://www.creationkit.com/index.php?title=Input_Script#DXScanCodes | DXScanCodes}
     * for possible hotkey values.
     *
     * @remarks
     * Use this ***only inside an `'update'` event***.
     *
     * @param hk The hotkey to listen for.
     *
     * @returns A function that accepts three callbacks:
     * 1. OnKeyPress
     * 1. OnKeyReleased
     * 1. OnKeyHold - This one gets how many frames has the key being held
     *
     * @example
     * const LogPress = () => { printConsole(`Key was pressed`) }
     *
     * const LogRelease = () => { printConsole(`Key was released`) }
     *
     * const LogHold: KeyHoldEvt = n => () => { printConsole(`Key has been held for ${n} frames.`) }
     *
     * const DoStuff = ListenTo(76)           // Listen to num5
     * const OnlyCareForHold = ListenTo(77)   // Listen to num6
     *
     * on('update', () => {
     *   DoStuff(LogPress, LogRelease, LogHold)
     *   OnlyCareForHold(undefined, undefined, LogHold)
     * })
     */
    function ListenTo(hk) {
        let old = false;
        let frames = 0;
        return (OnPress = DoNothing, OnRelease = DoNothing, OnHold = DoNothingOnHold) => {
            const p = skyrimPlatform_2.Input.isKeyPressed(hk);
            if (old !== p) {
                frames = 0;
                if (p)
                    skyrimPlatform_2.once("update", OnPress);
                else
                    skyrimPlatform_2.once("update", OnRelease);
            }
            else if (p) {
                frames++;
                skyrimPlatform_2.once("update", OnHold(frames));
            }
            old = p;
        };
    }
    exports_3("ListenTo", ListenTo);
    return {
        setters: [
            function (skyrimPlatform_2_1) {
                skyrimPlatform_2 = skyrimPlatform_2_1;
            }
        ],
        execute: function () {
            exports_3("DoNothing", DoNothing = () => { });
            exports_3("DoNothingOnHold", DoNothingOnHold = (_) => () => { });
            /** Not an useful function. Use it as a template. @see {@link ListenTo} */
            exports_3("LogPress", LogPress = () => {
                skyrimPlatform_2.printConsole(`Key was pressed`);
            });
            /** Not an useful function. Use it as a template. @see {@link ListenTo} */
            exports_3("LogRelease", LogRelease = () => {
                skyrimPlatform_2.printConsole(`Key was released`);
            });
            /** Not an useful function. Use it as a template. @see {@link ListenTo} */
            exports_3("LogHold", LogHold = (n) => () => {
                skyrimPlatform_2.printConsole(`Key has been held for ${n} frames.`);
            });
        }
    };
});
System.register("Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DM-Lib/Iteration", [], function (exports_4, context_4) {
    "use strict";
    var forEachItemR, forEachFormInCell, FormType;
    var __moduleName = context_4 && context_4.id;
    /**
     * Iterates over all items belonging to some `ObjectReference`, from last to first.
     *
     * @param o - The object reference to iterate over.
     * @param f - Function applied to each item.
     */
    function ForEachItemR(o, f) {
        let i = o.getNumItems();
        while (i > 0) {
            i--;
            f(o.getNthForm(i));
        }
    }
    exports_4("ForEachItemR", ForEachItemR);
    /**
     * Iterates over all forms of `formType` in some `cell`.
     *
     * @param cell Cell to search forms for.
     * @param formType {@link FormType}
     * @param f Function applied to each `Form`.
     */
    function ForEachFormInCell(cell, formType, f) {
        let i = cell.getNumRefs(formType);
        while (i > 0) {
            i--;
            f(cell.getNthRef(i, formType));
        }
    }
    exports_4("ForEachFormInCell", ForEachFormInCell);
    return {
        setters: [],
        execute: function () {
            // Aliases for people preferring names starting in lowercase.
            // These names are more in line with skyrymPlatform naming conventions.
            exports_4("forEachItemR", forEachItemR = ForEachItemR);
            exports_4("forEachFormInCell", forEachFormInCell = ForEachFormInCell);
            /**
             * Values were taken from.
             * {@link https://www.creationkit.com/index.php?title=GetType_-_Form}
             */
            (function (FormType) {
                FormType[FormType["ANIO"] = 83] = "ANIO";
                FormType[FormType["ARMA"] = 102] = "ARMA";
                FormType[FormType["AcousticSpace"] = 16] = "AcousticSpace";
                FormType[FormType["Action"] = 6] = "Action";
                FormType[FormType["Activator"] = 24] = "Activator";
                FormType[FormType["ActorValueInfo"] = 95] = "ActorValueInfo";
                FormType[FormType["AddonNode"] = 94] = "AddonNode";
                FormType[FormType["Ammo"] = 42] = "Ammo";
                FormType[FormType["Apparatus"] = 33] = "Apparatus";
                FormType[FormType["Armor"] = 26] = "Armor";
                FormType[FormType["ArrowProjectile"] = 64] = "ArrowProjectile";
                FormType[FormType["Art"] = 125] = "Art";
                FormType[FormType["AssociationType"] = 123] = "AssociationType";
                FormType[FormType["BarrierProjectile"] = 69] = "BarrierProjectile";
                FormType[FormType["BeamProjectile"] = 66] = "BeamProjectile";
                FormType[FormType["BodyPartData"] = 93] = "BodyPartData";
                FormType[FormType["Book"] = 27] = "Book";
                FormType[FormType["CameraPath"] = 97] = "CameraPath";
                FormType[FormType["CameraShot"] = 96] = "CameraShot";
                FormType[FormType["Cell"] = 60] = "Cell";
                FormType[FormType["Character"] = 62] = "Character";
                FormType[FormType["Class"] = 10] = "Class";
                FormType[FormType["Climate"] = 55] = "Climate";
                FormType[FormType["CollisionLayer"] = 132] = "CollisionLayer";
                FormType[FormType["ColorForm"] = 133] = "ColorForm";
                FormType[FormType["CombatStyle"] = 80] = "CombatStyle";
                FormType[FormType["ConeProjectile"] = 68] = "ConeProjectile";
                FormType[FormType["ConstructibleObject"] = 49] = "ConstructibleObject";
                FormType[FormType["Container"] = 28] = "Container";
                FormType[FormType["DLVW"] = 117] = "DLVW";
                FormType[FormType["Debris"] = 88] = "Debris";
                FormType[FormType["DefaultObject"] = 107] = "DefaultObject";
                FormType[FormType["DialogueBranch"] = 115] = "DialogueBranch";
                FormType[FormType["Door"] = 29] = "Door";
                FormType[FormType["DualCastData"] = 129] = "DualCastData";
                FormType[FormType["EffectSetting"] = 18] = "EffectSetting";
                FormType[FormType["EffectShader"] = 85] = "EffectShader";
                FormType[FormType["Enchantment"] = 21] = "Enchantment";
                FormType[FormType["EncounterZone"] = 103] = "EncounterZone";
                FormType[FormType["EquipSlot"] = 120] = "EquipSlot";
                FormType[FormType["Explosion"] = 87] = "Explosion";
                FormType[FormType["Eyes"] = 13] = "Eyes";
                FormType[FormType["Faction"] = 11] = "Faction";
                FormType[FormType["FlameProjectile"] = 67] = "FlameProjectile";
                FormType[FormType["Flora"] = 39] = "Flora";
                FormType[FormType["Footstep"] = 110] = "Footstep";
                FormType[FormType["FootstepSet"] = 111] = "FootstepSet";
                FormType[FormType["Furniture"] = 40] = "Furniture";
                FormType[FormType["GMST"] = 3] = "GMST";
                FormType[FormType["Global"] = 9] = "Global";
                FormType[FormType["Grass"] = 37] = "Grass";
                FormType[FormType["GrenadeProjectile"] = 65] = "GrenadeProjectile";
                FormType[FormType["Group"] = 2] = "Group";
                FormType[FormType["Hazard"] = 51] = "Hazard";
                FormType[FormType["HeadPart"] = 12] = "HeadPart";
                FormType[FormType["Idle"] = 78] = "Idle";
                FormType[FormType["IdleMarker"] = 47] = "IdleMarker";
                FormType[FormType["ImageSpace"] = 89] = "ImageSpace";
                FormType[FormType["ImageSpaceModifier"] = 90] = "ImageSpaceModifier";
                FormType[FormType["ImpactData"] = 100] = "ImpactData";
                FormType[FormType["ImpactDataSet"] = 101] = "ImpactDataSet";
                FormType[FormType["Ingredient"] = 30] = "Ingredient";
                FormType[FormType["Key"] = 45] = "Key";
                FormType[FormType["Keyword"] = 4] = "Keyword";
                FormType[FormType["Land"] = 72] = "Land";
                FormType[FormType["LandTexture"] = 20] = "LandTexture";
                FormType[FormType["LeveledCharacter"] = 44] = "LeveledCharacter";
                FormType[FormType["LeveledItem"] = 53] = "LeveledItem";
                FormType[FormType["LeveledSpell"] = 82] = "LeveledSpell";
                FormType[FormType["Light"] = 31] = "Light";
                FormType[FormType["LightingTemplate"] = 108] = "LightingTemplate";
                FormType[FormType["List"] = 91] = "List";
                FormType[FormType["LoadScreen"] = 81] = "LoadScreen";
                FormType[FormType["Location"] = 104] = "Location";
                FormType[FormType["LocationRef"] = 5] = "LocationRef";
                FormType[FormType["Material"] = 126] = "Material";
                FormType[FormType["MaterialType"] = 99] = "MaterialType";
                FormType[FormType["MenuIcon"] = 8] = "MenuIcon";
                FormType[FormType["Message"] = 105] = "Message";
                FormType[FormType["Misc"] = 32] = "Misc";
                FormType[FormType["MissileProjectile"] = 63] = "MissileProjectile";
                FormType[FormType["MovableStatic"] = 36] = "MovableStatic";
                FormType[FormType["MovementType"] = 127] = "MovementType";
                FormType[FormType["MusicTrack"] = 116] = "MusicTrack";
                FormType[FormType["MusicType"] = 109] = "MusicType";
                FormType[FormType["NAVI"] = 59] = "NAVI";
                FormType[FormType["NPC"] = 43] = "NPC";
                FormType[FormType["NavMesh"] = 73] = "NavMesh";
                FormType[FormType["None"] = 0] = "None";
                FormType[FormType["Note"] = 48] = "Note";
                FormType[FormType["Outfit"] = 124] = "Outfit";
                FormType[FormType["PHZD"] = 70] = "PHZD";
                FormType[FormType["Package"] = 79] = "Package";
                FormType[FormType["Perk"] = 92] = "Perk";
                FormType[FormType["Potion"] = 46] = "Potion";
                FormType[FormType["Projectile"] = 50] = "Projectile";
                FormType[FormType["Quest"] = 77] = "Quest";
                FormType[FormType["Race"] = 14] = "Race";
                FormType[FormType["Ragdoll"] = 106] = "Ragdoll";
                FormType[FormType["Reference"] = 61] = "Reference";
                FormType[FormType["ReferenceEffect"] = 57] = "ReferenceEffect";
                FormType[FormType["Region"] = 58] = "Region";
                FormType[FormType["Relationship"] = 121] = "Relationship";
                FormType[FormType["ReverbParam"] = 134] = "ReverbParam";
                FormType[FormType["Scene"] = 122] = "Scene";
                FormType[FormType["Script"] = 19] = "Script";
                FormType[FormType["ScrollItem"] = 23] = "ScrollItem";
                FormType[FormType["ShaderParticleGeometryData"] = 56] = "ShaderParticleGeometryData";
                FormType[FormType["Shout"] = 119] = "Shout";
                FormType[FormType["Skill"] = 17] = "Skill";
                FormType[FormType["SoulGem"] = 52] = "SoulGem";
                FormType[FormType["Sound"] = 15] = "Sound";
                FormType[FormType["SoundCategory"] = 130] = "SoundCategory";
                FormType[FormType["SoundDescriptor"] = 128] = "SoundDescriptor";
                FormType[FormType["SoundOutput"] = 131] = "SoundOutput";
                FormType[FormType["Spell"] = 22] = "Spell";
                FormType[FormType["Static"] = 34] = "Static";
                FormType[FormType["StaticCollection"] = 35] = "StaticCollection";
                FormType[FormType["StoryBranchNode"] = 112] = "StoryBranchNode";
                FormType[FormType["StoryEventNode"] = 114] = "StoryEventNode";
                FormType[FormType["StoryQuestNode"] = 113] = "StoryQuestNode";
                FormType[FormType["TES4"] = 1] = "TES4";
                FormType[FormType["TLOD"] = 74] = "TLOD";
                FormType[FormType["TOFT"] = 86] = "TOFT";
                FormType[FormType["TalkingActivator"] = 25] = "TalkingActivator";
                FormType[FormType["TextureSet"] = 7] = "TextureSet";
                FormType[FormType["Topic"] = 75] = "Topic";
                FormType[FormType["TopicInfo"] = 76] = "TopicInfo";
                FormType[FormType["Tree"] = 38] = "Tree";
                FormType[FormType["VoiceType"] = 98] = "VoiceType";
                FormType[FormType["Water"] = 84] = "Water";
                FormType[FormType["Weapon"] = 41] = "Weapon";
                FormType[FormType["Weather"] = 54] = "Weather";
                FormType[FormType["WordOfPower"] = 118] = "WordOfPower";
                FormType[FormType["WorldSpace"] = 71] = "WorldSpace";
            })(FormType || (FormType = {}));
            exports_4("FormType", FormType);
        }
    };
});
System.register("Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DM-Lib/Misc", ["Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_5, context_5) {
    "use strict";
    var skyrimPlatform_3;
    var __moduleName = context_5 && context_5.id;
    /**
     * Avoids a function to be executed many times at the same time.
     *
     * @param f The function to wrap.
     * @returns A function that will be called only once when the engine
     * tries to spam it.
     *
     * @remarks
     * Sometimes the engine is so fast a function may be called many times
     * in a row. For example, the `OnSleepStart` event may be fired 4 times
     * in a row, thus executing a function those 4 times, even when it was
     * intended to run only once.
     *
     * This function will make a function in that situation to be called
     * only once, as expected.
     *
     * @see {@link ListenPapyrusEvent} for a useful sample usage.
     *
     * @warning
     * Since this function is a "closure" it needs to be used outside loops
     * and things that may redefine the inner variables inside it.
     *
     * If this function doesn't appear to work, try to use it outside the
     * current execution block.
     *
     * @example
     * let f = () => { printConsole("Only once") }
     * f = AvoidRapidFire(f)
     *
     * // The engine is so fast this will actually work
     * f()
     * f()
     * f()
     */
    function AvoidRapidFire(f) {
        let lastExecuted = 0;
        return () => {
            const t = skyrimPlatform_3.Utility.getCurrentGameTime();
            if (lastExecuted === t)
                return;
            lastExecuted = t;
            f();
        };
    }
    exports_5("AvoidRapidFire", AvoidRapidFire);
    /**
     * Waits for a Papyrus event named `eventName` to be fired.
     *
     * @param eventName
     * @returns A function that accepts a `Context` and the function `f` that will be
     * executed when the `papyrusEventName` inside that context is the same as
     * `eventName`.
     *
     * @remarks
     * Some events fire many times at the same time. It's advisable to wrap `f`
     * with {@link AvoidRapidFire} to avoid executing the same function over and over.
     *
     * @example
     * const SleepStart = ListenPapyrusEvent("OnSleepStart")
     * let OnSleepStart = () => { printConsole("I just started sleeping") }
     * OnSleepStart = AvoidRapidFire(OnSleepStart)
     *
     * hooks.sendPapyrusEvent.add({
     *   enter(ctx) {
     *     SleepStart(ctx, OnSleepStart)
     *     // SleepStart(ctx, AvoidRapidFire(OnSleepStart)) <- DON'T DO THIS. AvoidRapidFire won't work here. It needs to be used outside the event hook.
     *   },
     * })
     */
    function ListenPapyrusEvent(eventName) {
        return function (c, f) {
            if (eventName !== c.papyrusEventName)
                return;
            f();
        };
    }
    exports_5("ListenPapyrusEvent", ListenPapyrusEvent);
    return {
        setters: [
            function (skyrimPlatform_3_1) {
                skyrimPlatform_3 = skyrimPlatform_3_1;
            }
        ],
        execute: function () {
        }
    };
});
/*
This file was automatically generated by Papyrus-2-Typescript.exe
https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript

The program has no way to know the intention of the humans that made
the scripts, so it's always advisable to manually check all generated
files to make sure everything is declared as it should.

Take note the program assumes this script exists in some subfolder
to the folder where `skyrimPlatform.ts` is found, otherwise you'll get
"Cannot find module..." type of errors.

If you want to have this script in some other place, just change the
relative path of each `import`.
*/
System.register("Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JDB", ["Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_6, context_6) {
    "use strict";
    var sp, sn, solveFlt, solveInt, solveStr, solveObj, solveForm, solveFltSetter, solveIntSetter, solveStrSetter, solveObjSetter, solveFormSetter, setObj, hasPath, allKeys, allValues, writeToFile, root;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (sp_1) {
                sp = sp_1;
            }
        ],
        execute: function () {
            /** Global entry point to store mod information. Main intent - replace global variables
                Manages keys and values associations (like JMap) */
            sn = sp.JDB;
            /** Attempts to retrieve the value associated with the @path.
                For ex. the following information associated with 'frosfall' key:
                
                "frostfall" : {
                    "exposureRate" : 0.5,
                    "arrayC" : ["stringValue", 1.5, 10, 1.14]
                }
                
                then JDB.solveFlt(".frostfall.exposureRate") will return 0.5 and
                JDB.solveObj(".frostfall.arrayC") will return the array containing ["stringValue", 1.5, 10, 1.14] values */
            exports_6("solveFlt", solveFlt = (path, defaultVal = 0.0) => sn.solveFlt(path, defaultVal));
            exports_6("solveInt", solveInt = (path, defaultVal = 0) => sn.solveInt(path, defaultVal));
            exports_6("solveStr", solveStr = (path, defaultVal = "") => sn.solveStr(path, defaultVal));
            exports_6("solveObj", solveObj = (path, defaultVal = 0) => sn.solveObj(path, defaultVal));
            exports_6("solveForm", solveForm = (path, defaultVal = null) => sn.solveForm(path, defaultVal));
            /** Attempts to assign the @value. Returns false if no such path.
                If 'createMissingKeys=true' it creates any missing path elements: JDB.solveIntSetter(".frostfall.keyB", 10, true) creates {frostfall: {keyB: 10}} structure */
            exports_6("solveFltSetter", solveFltSetter = (path, value, createMissingKeys = false) => sn.solveFltSetter(path, value, createMissingKeys));
            exports_6("solveIntSetter", solveIntSetter = (path, value, createMissingKeys = false) => sn.solveIntSetter(path, value, createMissingKeys));
            exports_6("solveStrSetter", solveStrSetter = (path, value, createMissingKeys = false) => sn.solveStrSetter(path, value, createMissingKeys));
            exports_6("solveObjSetter", solveObjSetter = (path, value, createMissingKeys = false) => sn.solveObjSetter(path, value, createMissingKeys));
            exports_6("solveFormSetter", solveFormSetter = (path, value, createMissingKeys = false) => sn.solveFormSetter(path, value, createMissingKeys));
            /** Associates(and replaces previous association) container object with a string key.
                destroys association if object is zero
                for ex. JDB.setObj("frostfall", frostFallInformation) will associate 'frostall' key and frostFallInformation so you can access it later */
            exports_6("setObj", setObj = (key, object) => sn.setObj(key, object));
            /** Returns true, if JDB capable resolve given @path, i.e. if it able to execute solve* or solver*Setter functions successfully */
            exports_6("hasPath", hasPath = (path) => sn.hasPath(path));
            /** returns new array containing all JDB keys */
            exports_6("allKeys", allKeys = () => sn.allKeys());
            /** returns new array containing all containers associated with JDB */
            exports_6("allValues", allValues = () => sn.allValues());
            /** writes storage data into JSON file at given path */
            exports_6("writeToFile", writeToFile = (path) => sn.writeToFile(path));
            /** Returns underlying JDB's container - an instance of JMap.
                The object being owned (retained) internally, so you don't have to (but can) retain or release it. */
            exports_6("root", root = () => sn.root());
        }
    };
});
/*
This file was automatically generated by Papyrus-2-Typescript.exe
https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript

The program has no way to know the intention of the humans that made
the scripts, so it's always advisable to manually check all generated
files to make sure everything is declared as it should.

Take note the program assumes this script exists in some subfolder
to the folder where `skyrimPlatform.ts` is found, otherwise you'll get
"Cannot find module..." type of errors.

If you want to have this script in some other place, just change the
relative path of each `import`.
*/
System.register("Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JMap", ["Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_7, context_7) {
    "use strict";
    var sp, sn, object, getInt, getFlt, getStr, getObj, getForm, setInt, setFlt, setStr, setObj, setForm, hasKey, valueType, allKeys, allKeysPArray, allValues, removeKey, count, clear, addPairs, nextKey, getNthKey;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (sp_2) {
                sp = sp_2;
            }
        ],
        execute: function () {
            /** Associative key-value container.
                Inherits JValue functionality */
            sn = sp.JMap;
            /** creates new container object. returns container's identifier (unique integer number). */
            exports_7("object", object = () => sn.object());
            /** Returns the value associated with the @key. If not, returns @default value */
            exports_7("getInt", getInt = (object, key, defaultVal = 0) => sn.getInt(object, key, defaultVal));
            exports_7("getFlt", getFlt = (object, key, defaultVal = 0.0) => sn.getFlt(object, key, defaultVal));
            exports_7("getStr", getStr = (object, key, defaultVal = "") => sn.getStr(object, key, defaultVal));
            exports_7("getObj", getObj = (object, key, defaultVal = 0) => sn.getObj(object, key, defaultVal));
            exports_7("getForm", getForm = (object, key, defaultVal = null) => sn.getForm(object, key, defaultVal));
            /** Inserts @key: @value pair. Replaces existing pair with the same @key */
            exports_7("setInt", setInt = (object, key, value) => sn.setInt(object, key, value));
            exports_7("setFlt", setFlt = (object, key, value) => sn.setFlt(object, key, value));
            exports_7("setStr", setStr = (object, key, value) => sn.setStr(object, key, value));
            exports_7("setObj", setObj = (object, key, container) => sn.setObj(object, key, container));
            exports_7("setForm", setForm = (object, key, value) => sn.setForm(object, key, value));
            /** Returns true, if the container has @key: value pair */
            exports_7("hasKey", hasKey = (object, key) => sn.hasKey(object, key));
            /** Returns type of the value associated with the @key.
                0 - no value, 1 - none, 2 - int, 3 - float, 4 - form, 5 - object, 6 - string */
            exports_7("valueType", valueType = (object, key) => sn.valueType(object, key));
            /** Returns a new array containing all keys */
            exports_7("allKeys", allKeys = (object) => sn.allKeys(object));
            exports_7("allKeysPArray", allKeysPArray = (object) => sn.allKeysPArray(object));
            /** Returns a new array containing all values */
            exports_7("allValues", allValues = (object) => sn.allValues(object));
            /** Removes the pair from the container where the key equals to the @key */
            exports_7("removeKey", removeKey = (object, key) => sn.removeKey(object, key));
            /** Returns count of pairs in the conainer */
            exports_7("count", count = (object) => sn.count(object));
            /** Removes all pairs from the container */
            exports_7("clear", clear = (object) => sn.clear(object));
            /** Inserts key-value pairs from the source container */
            exports_7("addPairs", addPairs = (object, source, overrideDuplicates) => sn.addPairs(object, source, overrideDuplicates));
            /** Simplifies iteration over container's contents.
                Accepts the @previousKey, returns the next key.
                If @previousKey == @endKey the function returns the first key.
                The function always returns so-called 'valid' keys (the ones != @endKey).
                The function returns @endKey ('invalid' key) only once to signal that iteration has reached its end.
                In most cases, if the map doesn't contain an invalid key ("" for JMap, None form-key for JFormMap)
                it's ok to omit the @endKey.
                
                Usage:
                
                    string key = JMap.nextKey(map, previousKey="", endKey="")
                    while key != ""
                      <retrieve values here>
                      key = JMap.nextKey(map, key, endKey="")
                    endwhile */
            exports_7("nextKey", nextKey = (object, previousKey = "", endKey = "") => sn.nextKey(object, previousKey, endKey));
            /** Retrieves N-th key. negative index accesses items from the end of container counting backwards.
                Worst complexity is O(n/2) */
            exports_7("getNthKey", getNthKey = (object, keyIndex) => sn.getNthKey(object, keyIndex));
        }
    };
});
/*
This file was automatically generated by Papyrus-2-Typescript.exe
https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript

The program has no way to know the intention of the humans that made
the scripts, so it's always advisable to manually check all generated
files to make sure everything is declared as it should.

Take note the program assumes this script exists in some subfolder
to the folder where `skyrimPlatform.ts` is found, otherwise you'll get
"Cannot find module..." type of errors.

If you want to have this script in some other place, just change the
relative path of each `import`.
*/
System.register("Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JFormMap", ["Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_8, context_8) {
    "use strict";
    var sp, sn, object, getInt, getFlt, getStr, getObj, getForm, setInt, setFlt, setStr, setObj, setForm, hasKey, valueType, allKeys, allKeysPArray, allValues, removeKey, count, clear, addPairs, nextKey, getNthKey;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (sp_3) {
                sp = sp_3;
            }
        ],
        execute: function () {
            /** Associative key-value container.
                Inherits JValue functionality */
            sn = sp.JFormMap;
            /** creates new container object. returns container's identifier (unique integer number). */
            exports_8("object", object = () => sn.object());
            /** Returns the value associated with the @key. If not, returns @default value */
            exports_8("getInt", getInt = (object, key, defaultVal = 0) => sn.getInt(object, key, defaultVal));
            exports_8("getFlt", getFlt = (object, key, defaultVal = 0.0) => sn.getFlt(object, key, defaultVal));
            exports_8("getStr", getStr = (object, key, defaultVal = "") => sn.getStr(object, key, defaultVal));
            exports_8("getObj", getObj = (object, key, defaultVal = 0) => sn.getObj(object, key, defaultVal));
            exports_8("getForm", getForm = (object, key, defaultVal = null) => sn.getForm(object, key, defaultVal));
            /** Inserts @key: @value pair. Replaces existing pair with the same @key */
            exports_8("setInt", setInt = (object, key, value) => sn.setInt(object, key, value));
            exports_8("setFlt", setFlt = (object, key, value) => sn.setFlt(object, key, value));
            exports_8("setStr", setStr = (object, key, value) => sn.setStr(object, key, value));
            exports_8("setObj", setObj = (object, key, container) => sn.setObj(object, key, container));
            exports_8("setForm", setForm = (object, key, value) => sn.setForm(object, key, value));
            /** Returns true, if the container has @key: value pair */
            exports_8("hasKey", hasKey = (object, key) => sn.hasKey(object, key));
            /** Returns type of the value associated with the @key.
                0 - no value, 1 - none, 2 - int, 3 - float, 4 - form, 5 - object, 6 - string */
            exports_8("valueType", valueType = (object, key) => sn.valueType(object, key));
            /** Returns a new array containing all keys */
            exports_8("allKeys", allKeys = (object) => sn.allKeys(object));
            exports_8("allKeysPArray", allKeysPArray = (object) => sn.allKeysPArray(object));
            /** Returns a new array containing all values */
            exports_8("allValues", allValues = (object) => sn.allValues(object));
            /** Removes the pair from the container where the key equals to the @key */
            exports_8("removeKey", removeKey = (object, key) => sn.removeKey(object, key));
            /** Returns count of pairs in the conainer */
            exports_8("count", count = (object) => sn.count(object));
            /** Removes all pairs from the container */
            exports_8("clear", clear = (object) => sn.clear(object));
            /** Inserts key-value pairs from the source container */
            exports_8("addPairs", addPairs = (object, source, overrideDuplicates) => sn.addPairs(object, source, overrideDuplicates));
            /** Simplifies iteration over container's contents.
                Accepts the @previousKey, returns the next key.
                If @previousKey == @endKey the function returns the first key.
                The function always returns so-called 'valid' keys (the ones != @endKey).
                The function returns @endKey ('invalid' key) only once to signal that iteration has reached its end.
                In most cases, if the map doesn't contain an invalid key ("" for JMap, None form-key for JFormMap)
                it's ok to omit the @endKey.
                
                Usage:
                
                    string key = JMap.nextKey(map, previousKey="", endKey="")
                    while key != ""
                      <retrieve values here>
                      key = JMap.nextKey(map, key, endKey="")
                    endwhile */
            exports_8("nextKey", nextKey = (object, previousKey = null, endKey = null) => sn.nextKey(object, previousKey, endKey));
            /** Retrieves N-th key. negative index accesses items from the end of container counting backwards.
                Worst complexity is O(n/2) */
            exports_8("getNthKey", getNthKey = (object, keyIndex) => sn.getNthKey(object, keyIndex));
        }
    };
});
System.register("Skyrim SE/MO2/mods/Easy Containers-src/Platform/easy-containers/src/entry", ["Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DM-Lib/Debug", "Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DM-Lib/Hotkeys", "Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DM-Lib/Iteration", "Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DM-Lib/Misc", "Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JDB", "Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JFormMap", "Steam/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_9, context_9) {
    "use strict";
    var D, Hotkey, Iteration_1, Misc_1, JDB, JFormMap, skyrimPlatform_4;
    var __moduleName = context_9 && context_9.id;
    function main() {
        const modName = "Easy Containers";
        const mod_name = "easy-containers";
        /** Current logging level. */
        const currLogLvl = D.ReadLoggingFromSettings(mod_name, "loggingLevel");
        skyrimPlatform_4.printConsole(currLogLvl);
        // Generates a logging function specific to this mod.
        const CLF = (logAt) => D.CreateLoggingFunction(modName, currLogLvl, logAt);
        /** Logs messages intended to detect bottlenecks. */
        const LogO = CLF(D.LoggingLevel.optimization);
        /** Logs an error message. */
        const LogE = CLF(D.LoggingLevel.error);
        /** Logs detailed info meant for players to see. */
        const LogI = CLF(D.LoggingLevel.info);
        /** Logs detailed info meant only for debugging. */
        const LogV = CLF(D.LoggingLevel.verbose);
        /** Logs a variable while initializing it. Message level: verbose. */
        const LogVT = D.TapLog(LogV);
        /** Where the marked items database is located. */
        const basePath = ".EasyContainers.items";
        /** Gets a memory database handle to a JContainers object, creating it if it doesn't exist. */
        function GetDbHandle() {
            const r = JDB.solveObj(basePath);
            return r !== 0 ? r : JFormMap.object();
        }
        /** Saves a JContainers object handle to the memory database. */
        function SaveDbHandle(h) {
            JDB.solveObjSetter(basePath, h, true);
        }
        const IntToHex = (x) => x.toString(16);
        function GetFormEsp(frm) {
            if (!frm)
                return "";
            const formId = LogVT("FormId", frm.getFormID(), IntToHex);
            const modIndex = LogVT("modIndex", formId >>> 24, IntToHex);
            const modForm = LogVT("modForm", formId & 0xffffff, IntToHex);
            let name = "";
            if (modIndex == 0xfe) {
                const lightIndex = LogVT("Light mod index", (formId >>> 12) & 0xfff, IntToHex);
                if (lightIndex < skyrimPlatform_4.Game.getLightModCount())
                    name = skyrimPlatform_4.Game.getLightModName(lightIndex);
                else
                    return "";
            }
            else
                name = skyrimPlatform_4.Game.getModName(modIndex);
            // printConsole(name)
            return name;
            // UInt8 modIndex = form->formID >> 24;
            // UInt32 modForm = form->formID & 0xFFFFFF;
            // ModInfo* modInfo = nullptr;
            // if (modIndex == 0xFE)
            // {
            //   UInt16 lightIndex = (form->formID >> 12) & 0xFFF;
            //   if (lightIndex < (*g_dataHandler)->modList.loadedCCMods.count)
            //     modInfo = (*g_dataHandler)->modList.loadedCCMods[lightIndex];
            // }
            // else
            // {
            //   modInfo = (*g_dataHandler)->modList.loadedMods[modIndex];
            // }
            // if (modInfo) {
            //   sprintf_s(formName, "%s|%06X", modInfo->name, modForm);
            // }
            // return formName;
        }
        /** Marks all items in some container. */
        function DoMarkItems() {
            var _a;
            const container = skyrimPlatform_4.Game.getCurrentCrosshairRef();
            GetFormEsp(container ? container.getBaseObject() : (_a = skyrimPlatform_4.Game.getPlayer()) === null || _a === void 0 ? void 0 : _a.getBaseObject());
            if (!container)
                return;
            skyrimPlatform_4.Debug.notification("Marking items in container.");
            const a = LogVT("Mark. Database handle", GetDbHandle());
            Iteration_1.ForEachItemR(container, (item) => {
                const name = item === null || item === void 0 ? void 0 : item.getName();
                const exists = LogVT(`Trying to add ${name} to database. Already added?`, JFormMap.hasKey(a, item));
                if (exists)
                    return;
                JFormMap.setInt(a, item, 0); // `value` is irrelevant; we only want the `key` (item) to be added
                LogI(`${name} was added to database`);
            });
            SaveDbHandle(a);
            skyrimPlatform_4.Debug.messageBox("All items were marked");
        }
        /** Transfers all marked items in player inventory to the selected container in the crosshair.\
         * Equiped and favorited items are not transferred.
         */
        function DoTransferItems() {
            const container = skyrimPlatform_4.Game.getCurrentCrosshairRef();
            if (!container)
                return;
            skyrimPlatform_4.Debug.notification("Transferring items to container.");
            const p = skyrimPlatform_4.Game.getPlayer();
            const a = LogVT("Transfer. Database handle", GetDbHandle());
            let n = 0;
            Iteration_1.ForEachItemR(p, (item) => {
                if (!JFormMap.hasKey(a, item) ||
                    p.isEquipped(item) ||
                    p.getEquippedObject(0) === item ||
                    skyrimPlatform_4.Game.isObjectFavorited(item))
                    return;
                p.removeItem(item, 999999, true, container); // Remove all items belonging to the marked type
                n++;
            });
            skyrimPlatform_4.Debug.messageBox(`${n} items were transferred`);
        }
        skyrimPlatform_4.printConsole(skyrimPlatform_4.settings["easy-containers"]["hkMark1"]);
        skyrimPlatform_4.printConsole(skyrimPlatform_4.settings["easy-containers"]["hkTransfer1"]);
        const l = skyrimPlatform_4.settings["easy-containers"]["hkMark1"];
        const l2 = typeof l === "number" ? l : 0;
        /** React when the player presses the "Mark" hotkey. */
        // const MarkItems = Hotkey.ListenTo(l2)
        const MarkItems = Hotkey.ListenTo(75);
        /** React when the player presses the "Transfer" hotkey. */
        const TransferItems = Hotkey.ListenTo(76);
        skyrimPlatform_4.printConsole("Easy Containers successfully initialized.");
        /** This code is executed every single frame.
         * It runs fast because most of the time it will only be asking if a key is pressed.
         * It's only when a key is pressed when all code above gets fired for just one frame.
         *
         * You can see how all of this is accomplished using `once()` if you check the code for
         * `Hotkey.ListenTo()`.
         */
        skyrimPlatform_4.on("update", () => {
            MarkItems(DoMarkItems);
            TransferItems(DoTransferItems);
        });
        // ===========================================================
        // Meh. Ignore all lines below.
        // I was testing things for other mod and I don't want to lose those tests.
        // I will eventually delete these lines.
        // ===========================================================
        let lastSlept = 0;
        let goneToSleepAt = 0;
        const Now = skyrimPlatform_4.Utility.getCurrentGameTime;
        let OnSleepStart = () => {
            goneToSleepAt = LogVT("OnSleepStart", Now());
        };
        let OnSleepEnd = () => {
            if (Now() - lastSlept < 2) {
                LogE("You just slept. Nothing will be done.");
                lastSlept = LogVT("Awaken at", Now());
                return;
            }
            const hoursSlept = LogVT("Time slept", Now() - goneToSleepAt);
            if (hoursSlept < 1)
                return; // Do nothing. Didn't really slept.
            lastSlept = LogVT("Awaken at", Now());
            //   const p = Game.getPlayer() as Actor
            //   p.sendModEvent("Maxick_JourneyByAverage", "", 9000)
        };
        OnSleepStart = Misc_1.AvoidRapidFire(OnSleepStart);
        OnSleepEnd = Misc_1.AvoidRapidFire(OnSleepEnd);
        const SleepStart = Misc_1.ListenPapyrusEvent("OnSleepStart");
        const SleepEnd = Misc_1.ListenPapyrusEvent("OnSleepStop");
        const CellAttach = Misc_1.ListenPapyrusEvent("OnCellAttach");
        skyrimPlatform_4.hooks.sendPapyrusEvent.add({
            enter(ctx) {
                SleepStart(ctx, OnSleepStart);
                SleepEnd(ctx, OnSleepEnd);
            },
        });
        // on("equip", (e) => {
        //   const b = e.actor.getBaseObject()
        //   // if (b) printConsole(`EQUIP. actor: ${b.getName()}. object: ${e.baseObj.getName()}`);
        // });
        skyrimPlatform_4.on("objectLoaded", (e) => {
            var _a;
            const a = (_a = skyrimPlatform_4.Actor.from(e.object)) === null || _a === void 0 ? void 0 : _a.getBaseObject();
            const formId = LogVT("FormId", e.object.getFormID(), IntToHex);
            skyrimPlatform_4.printConsole(`Name: ${a === null || a === void 0 ? void 0 : a.getName()}`);
            // const l = Actor.from(Game.getFormEx(formId))?.getLeveledActorBase()
            // printConsole(
            //   `Leveled actor name ${l?.getName()} race: ${l
            //     ?.getRace()
            //     ?.getName()} class: ${l?.getClass()?.getName()}`
            // )
            // const base = Actor.from(e.object)?.getBaseObject()
            // printConsole(`Base actor name ${base?.getName()}`)
            // printConsole(`UNLOADED raw name ${e.object?.getName()}`)
            // const b = Actor.from(e.object)?.getLeveledActorBase()
            // if (b) {
            // const r = ActorBase.from(b)?.getRace()
            // const c = ActorBase.from(b)?.getClass()
            // printConsole(`(UN)LOADED object: ${b.getName()}. loaded: ${e.isLoaded} class: ${c?.getName()} race: ${r?.getName()}`);
            // }
        });
        // on("unequip", (e) => {
        //   const b = e.actor.getBaseObject()
        //   // if (b) printConsole(`UNEQUIP. actor: ${b.getName()}. object: ${e.baseObj.getName()}`);
        // });
    }
    exports_9("main", main);
    return {
        setters: [
            function (D_1) {
                D = D_1;
            },
            function (Hotkey_1) {
                Hotkey = Hotkey_1;
            },
            function (Iteration_1_1) {
                Iteration_1 = Iteration_1_1;
            },
            function (Misc_1_1) {
                Misc_1 = Misc_1_1;
            },
            function (JDB_1) {
                JDB = JDB_1;
            },
            function (JFormMap_1) {
                JFormMap = JFormMap_1;
            },
            function (skyrimPlatform_4_1) {
                skyrimPlatform_4 = skyrimPlatform_4_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("Skyrim SE/MO2/mods/Easy Containers-src/Platform/easy-containers/index", ["Skyrim SE/MO2/mods/Easy Containers-src/Platform/easy-containers/src/entry"], function (exports_10, context_10) {
    "use strict";
    var example;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (example_1) {
                example = example_1;
            }
        ],
        execute: function () {
            example.main();
        }
    };
});
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable @typescript-eslint/no-namespace */
// Generated automatically. Do not edit.
System.register("Skyrim SE/MO2/mods/Easy Containers-src/Platform/easy-containers/skyrimPlatform", [], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
