"""
Safe {{variable}} template rendering for personalizing campaign scripts.

Used to merge a Contact's `custom_fields` (plus a few built-in fields like
name/phone_number) into a Campaign's `ai_prompt` before it's handed to the
voice agent — e.g. "Hi {{name}}, this is a reminder for your appointment
with {{doctor_name}} on {{appointment_date}} at {{department}}."

Deliberately NOT a general templating engine (no Jinja2, no eval/exec) —
this only does literal {{key}} -> value substitution against a plain dict,
so nothing in custom_fields can ever execute code or reach attributes it
shouldn't.
"""
import re
from typing import Mapping, Optional

_VAR_PATTERN = re.compile(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}")


def render_template(text: Optional[str], variables: Mapping[str, object]) -> str:
    """
    Replace {{variable}} placeholders in `text` with values from `variables`.

    Any placeholder with no matching key is replaced with an empty string
    rather than left in place — a voice agent must never literally say
    "open brace brace missing_var close brace brace" out loud.
    """
    if not text:
        return ""

    def _replace(match: "re.Match[str]") -> str:
        value = variables.get(match.group(1))
        return "" if value is None else str(value)

    return _VAR_PATTERN.sub(_replace, text)
