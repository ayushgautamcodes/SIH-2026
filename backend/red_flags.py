"""
Deterministic red-flag rules — ported from script.js checkForUrgentSymptoms().
Kept server-side so priority flagging can't be bypassed or tampered with
by editing client-side JS. Add the remaining rules from your original
script.js the same way: one `if` block, one `rule` id, one `reason`.
"""
from typing import Optional, Dict, Any


def val(answers: Dict[str, Any], qid: str) -> Optional[str]:
    entry = answers.get(qid)
    return entry.get("value") if entry else None


def check_urgent_symptoms(problem: str, answers: Dict[str, Any]) -> Optional[dict]:
    # Rule 1: severe chest pain + difficulty breathing
    if problem == "chest" and val(answers, "severity") == "severe" and val(answers, "breathing") == "yes":
        return {
            "rule": "chest_severe_breathing",
            "reason": {
                "en": "You reported severe chest pain together with difficulty breathing. "
                      "These symptoms may require prompt medical attention.",
                "hi": "आपने तेज़ सीने का दर्द और सांस लेने में तकलीफ़ बताई है। "
                      "इन लक्षणों के लिए तत्काल चिकित्सीय ध्यान आवश्यक हो सकता है।",
            },
        }

    # Rule 2: severe chest pain + dizziness/faintness
    if problem == "chest" and val(answers, "severity") == "severe" and val(answers, "dizzy") == "yes":
        return {
            "rule": "chest_severe_dizzy",
            "reason": {
                "en": "You reported severe chest pain together with dizziness or faintness. "
                      "These symptoms may require prompt medical attention.",
                "hi": "आपने तेज़ सीने का दर्द और चक्कर या बेहोशी बताई है। "
                      "इन लक्षणों के लिए तत्काल चिकित्सीय ध्यान आवश्यक हो सकता है।",
            },
        }

    # Rule 3: sudden severe headache + vision problems
    if (
        problem == "headache"
        and val(answers, "onset") == "sudden"
        and val(answers, "severity") == "severe"
        and val(answers, "vision") == "yes"
    ):
        return {
            "rule": "headache_sudden_vision",
            "reason": {
                "en": "You reported a sudden severe headache together with vision problems. "
                      "These symptoms may require prompt medical assessment.",
                "hi": "आपने अचानक तेज़ सिरदर्द और दृष्टि की समस्या बताई है। "
                      "इन लक्षणों के लिए तत्काल चिकित्सीय मूल्यांकन आवश्यक हो सकता है।",
            },
        }

    # Rule 4: child with breathing difficulty
    if problem == "child" and val(answers, "concern") == "breath":
        return {
            "rule": "child_breathing",
            "reason": {
                "en": "A child with breathing difficulty may require prompt assessment. "
                      "Please seek medical attention immediately.",
                "hi": "सांस लेने में कठिनाई वाले बच्चे के लिए तत्काल मूल्यांकन आवश्यक हो सकता है। "
                      "कृपया तुरंत चिकित्सा सहायता लें।",
            },
        }

    # TODO: port the remaining rules from your original checkForUrgentSymptoms()
    return None
