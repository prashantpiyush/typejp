'use strict;'

input = document.getElementById("input");
input.addEventListener("input", onInput);

function onInput(event) {
    const target = event.target;
    const valueInAscii = convertToAsiiFromFullWidth(target.value);
    const ch = toKana(valueInAscii);
    target.value = ch;
}

const
LOWER_LATIN_START = 97,
LOWER_LATIN_END = 122,
UPPER_LATIN_START = 65,
UPPER_LATIN_END = 90,
LOWER_LATIN_FW_START = 65345,
LOWER_LATIN_FW_END = 65370,
UPPER_LATIN_FW_START = 65313,
UPPER_LATIN_FW_END = 65338;
HIRAGANA_START = 12353,
HIRAGANA_END = 12438,
KATAKANA_START = 12449,
KATAKANA_END = 12538;

VOWELS = "aeiou".split("");
CONSONANTS = "bcdfghjklmnpqrstvwxyz".split("");

function indexOf(arr, ele) {
    for(let idx=0; idx < arr.length; ++idx) {
        if(idx in arr && arr[idx] === ele) {
            return idx;
        }
    }
    return -1;
}

/**
 * ch is single char string
 */
function isCharInRange(ch, start, end) {
    const charCode = ch.charCodeAt(0);
    return start <= charCode && charCode <= end;
}

function isCharLowerLatin(ch) {
    return isCharInRange(ch, LOWER_LATIN_START, LOWER_LATIN_END);
}

function isCharUpperLatin(ch) {
    return isCharInRange(ch, UPPER_LATIN_START, UPPER_LATIN_END);
}

function isCharLowerLatinFW(ch) {
    return isCharInRange(ch, LOWER_LATIN_FW_START, LOWER_LATIN_FW_END);
}

function isCharUpperLatinFW(ch) {
    return isCharInRange(ch, UPPER_LATIN_FW_START, UPPER_LATIN_FW_END);
}

function isCharHiragana(ch) {
    return isCharInRange(ch, HIRAGANA_START, HIRAGANA_END);
}

function isCharKatakana(ch) {
    return isCharInRange(ch, KATAKANA_START, KATAKANA_END);
}

function isCharVowel(ch) {
    return -1 !== indexOf(VOWELS, ch);
}

function isCharConsonant(ch) {
    return -1 != indexOf(CONSONANTS, ch);
}

function convertToAsiiFromFullWidth(string) {
    const chars = string.split("");
    const len = chars.length;
    const parsed = [];
    for(let idx = 0; idx < len; ++idx) {
        const charCode = chars[idx].charCodeAt(0);
        // if full width latin, then make ascii
        if(isCharInRange(chars[idx], LOWER_LATIN_FW_START, LOWER_LATIN_FW_END)) {
            parsed[idx] = String.fromCharCode(charCode - LOWER_LATIN_FW_START + LOWER_LATIN_START);
            console.log("convert", chars[idx], parsed[idx]);
        } else if(isCharInRange(chars[idx], UPPER_LATIN_FW_START, UPPER_LATIN_FW_END)) {
            parsed[idx] = String.fromCharCode(charCode - UPPER_LATIN_FW_START + UPPER_LATIN_START);
            console.log("convert", chars[idx], parsed[idx]);
        } else {
            parsed[idx] = chars[idx];
        }
    }
    return parsed.join("");
}

function toKana(string) {
    const len = string.length;
    const parsed = [];
    const minCharToConsider = 4;
    for(let idx = 0; idx < len; ++idx) {
        for(let l = Math.min(minCharToConsider, len - idx); l > 0; --l) {
            let sub = string.substr(idx, l).toLowerCase();
            if("n" !== sub.charAt(0)) {
                if(isCharConsonant(sub.charAt(0)) && sub.charAt(0) === sub.charAt(1)) {
                    if(isCharUpperLatin(string.substr(idx, l).charAt(0))) {
                        parsed.push("\u30c3");
                    } else {
                        parsed.push("\u3063");
                    }
                    break;
                }
            }
            let kana = romajiToKana[sub];
            if(kana != null) {
                if(isCharUpperLatin(string.substr(idx, l).charAt(0))) {
                    kana = hiraganaToKatakana(kana);
                }
                parsed.push(kana);
                idx += l - 1;
                break;
            } else if(l === 1) {
                kana = convertPunctuation(sub);
                if(kana != null) {
                    parsed.push(kana);
                } else {
                    parsed.push(string.substr(idx, l));
                }
            }
        }
    }
    return parsed.join("");
}

function convertPunctuation(ch) {
    if(ch === " ") return ch;
    if(ch === "-") return "\u30fc";
    if(ch === ".") return "\uff61";
    return null;
}

function hiraganaToKatakana(string) {
    const chars = string.split("");
    const len = chars.length;
    const parsed = [];
    for(let idx = 0; idx < len; ++idx) {
        if(isCharHiragana(chars[idx])) {
            let charCode = chars[idx].charCodeAt(0);
            charCode += KATAKANA_START - HIRAGANA_START;
            parsed[idx] = String.fromCharCode(charCode);
        } else {
            parsed[idx] = chars[idx];
        }
    }
    return parsed.join("");
}

let romajiToKana = {
    "a": "\u3042",
    "i": "\u3044",
    "u": "\u3046",
    "e": "\u3048",
    "o": "\u304a",
    "ya": "\u3084",
    "yu": "\u3086",
    "yo": "\u3088",
    "ka": "\u304b",
    "ki": "\u304d",
    "ku": "\u304f",
    "ke": "\u3051",
    "ko": "\u3053",
    "kya": "\u304d\u3083",
    "kyu": "\u304d\u3085",
    "kyo": "\u304d\u3087",
    "sa": "\u3055",
    "shi": "\u3057",
    "si": "\u3057",
    "su": "\u3059",
    "se": "\u305b",
    "so": "\u305d",
    "sha": "\u3057\u3083",
    "sya": "\u3057\u3083",
    "shu": "\u3057\u3085",
    "syu": "\u3057\u3085",
    "sho": "\u3057\u3087",
    "syo": "\u3057\u3087",
    "ta": "\u305f",
    "chi": "\u3061",
    "ti": "\u3061",
    "tsu": "\u3064",
    "tu": "\u3064",
    "te": "\u3066",
    "to": "\u3068",
    "cha": "\u3061\u3083",
    "tya": "\u3061\u3083",
    "chu": "\u3061\u3085",
    "tyu": "\u3061\u3085",
    "cho": "\u3061\u3087",
    "tyo": "\u3061\u3087",
    "na": "\u306a",
    "ni": "\u306b",
    "nu": "\u306c",
    "ne": "\u306d",
    "no": "\u306e",
    "nya": "\u306b\u3083",
    "nyu": "\u306b\u3085",
    "nyo": "\u306b\u3087",
    "ha": "\u306f",
    "hi": "\u3072",
    "fu": "\u3075",
    "hu": "\u3075",
    "he": "\u3078",
    "ho": "\u307b",
    "hya": "\u3072\u3083",
    "hyu": "\u3072\u3085",
    "hyo": "\u3072\u3087",
    "ma": "\u307e",
    "mi": "\u307f",
    "mu": "\u3080",
    "me": "\u3081",
    "mo": "\u3082",
    "mya": "\u307f\u3083",
    "myu": "\u307f\u3085",
    "myo": "\u307f\u3087",
    "ra": "\u3089",
    "ri": "\u308a",
    "ru": "\u308b",
    "re": "\u308c",
    "ro": "\u308d",
    "rya": "\u308a\u3083",
    "ryu": "\u308a\u3085",
    "ryo": "\u308a\u3087",
    "wa": "\u308f",
    "wi": "\u3046\u3043",
    "we": "\u3046\u3047",
    "wo": "\u3092",
    "nn": "\u3093",
    "n ": "\u3093",
    "ga": "\u304c",
    "gi": "\u304e",
    "gu": "\u3050",
    "ge": "\u3052",
    "go": "\u3054",
    "gya": "\u304e\u3083",
    "gyu": "\u304e\u3085",
    "gyo": "\u304e\u3087",
    "za": "\u3056",
    "ji": "\u3058",
    "zi": "\u3058",
    "zu": "\u305a",
    "ze": "\u305c",
    "zo": "\u305e",
    "ja": "\u3058\u3083",
    "zya": "\u3058\u3083",
    "ju": "\u3058\u3085",
    "zyu": "\u3058\u3085",
    "jo": "\u3058\u3087",
    "zyo": "\u3058\u3087",
    "da": "\u3060",
    "di": "\u3062",
    "du": "\u3065",
    "de": "\u3067",
    "do": "\u3069",
    "dya": "\u3062\u3083",
    "dyu": "\u3062\u3085",
    "dyo": "\u3062\u3087",
    "ba": "\u3070",
    "bi": "\u3073",
    "bu": "\u3076",
    "be": "\u3079",
    "bo": "\u307c",
    "bya": "\u3073\u3083",
    "byu": "\u3073\u3085",
    "byo": "\u3073\u3087",
    "pa": "\u3071",
    "pi": "\u3074",
    "pu": "\u3077",
    "pe": "\u307a",
    "po": "\u307d",
    "pya": "\u3074\u3083",
    "pyu": "\u3074\u3085",
    "pyo": "\u3074\u3087",
    "ltsu": "\u3063",
    "shya": "\u3057\u3083",
    "shyu": "\u3057\u3085",
    "shyo": "\u3057\u3087",
    "chya": "\u3061\u3083",
    "chyu": "\u3061\u3085",
    "chyo": "\u3061\u3087",
    "va": "\u3094\u3041",
    "vi": "\u3094\u3043",
    "vu": "\u3094",
    "ve": "\u3094\u3047",
    "vo": "\u3094\u3049",
    "vya": "\u3094\u3083",
    "vyu": "\u3094\u3085",
    "vyo": "\u3094\u3087",
    "fya": "\u3075\u3083",
    "fyu": "\u3075\u3085",
    "fyo": "\u3075\u3087",
    "fa": "\u3075\u3041",
    "fi": "\u3075\u3043",
    "fe": "\u3075\u3047",
    "fo": "\u3075\u3049",
    "wu": "\u3046",
    "yi": "\u3044",
    "ye": "\u3044\u3047"
}